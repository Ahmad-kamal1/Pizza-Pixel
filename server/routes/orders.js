const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/orders  — returns orders with their line items
router.get("/", async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.id, o.invoice_number AS invoiceNumber, o.customer_name AS customer,
              o.customer_phone AS customerPhone, o.total_amount AS total,
              o.status, o.created_at AS time
       FROM orders o ORDER BY o.created_at DESC`
        );

        // Attach line items to each order
        for (const order of orders) {
            const [lineItems] = await db.query(
                `SELECT mi.name, oi.quantity AS qty, oi.unit_price AS unitPrice
         FROM order_items oi
         JOIN menu_items mi ON mi.id = oi.menu_item_id
         WHERE oi.order_id = ?`,
                [order.id]
            );
            order.orderItems = lineItems;
            order.items = lineItems.map((i) => i.name);
        }

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/orders  — create a new order (manual or from checkout)
router.post("/", async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const { customer, customerPhone, orderItems, total, status } = req.body;
        if (!customer || !orderItems || !orderItems.length)
            return res.status(400).json({ error: "customer and orderItems required" });

        const nextIdRow = await conn.query(
            "SELECT MAX(id) AS maxId FROM orders"
        );
        const nextId = (nextIdRow[0][0].maxId || 1000) + 1;
        const invoiceNumber = `INV-${nextId}`;

        const [result] = await conn.query(
            `INSERT INTO orders (invoice_number, customer_name, customer_phone, total_amount, status)
       VALUES (?, ?, ?, ?, ?)`,
            [invoiceNumber, customer, customerPhone || "", total, status || "pending"]
        );
        const orderId = result.insertId;

        // Resolve item names to IDs and insert line items
        for (const item of orderItems) {
            const [rows] = await conn.query(
                "SELECT id FROM menu_items WHERE name=? LIMIT 1",
                [item.name]
            );
            // Use found id or fall back to first item
            const menuItemId = rows.length ? rows[0].id : 1;
            await conn.query(
                "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?,?,?,?)",
                [orderId, menuItemId, item.qty, item.unitPrice]
            );
        }

        // Insert notification
        await conn.query(
            "INSERT INTO notifications (order_id, message) VALUES (?, ?)",
            [orderId, `New order #${orderId} from ${customer} — $${total}`]
        );

        await conn.commit();

        res.status(201).json({
            id: orderId,
            invoiceNumber,
            customer,
            customerPhone: customerPhone || "",
            orderItems,
            items: orderItems.map((i) => i.name),
            total,
            status: status || "pending",
            time: new Date(),
        });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        res.status(500).json({ error: "Server error" });
    } finally {
        conn.release();
    }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        if (!["pending", "completed", "cancelled"].includes(status))
            return res.status(400).json({ error: "Invalid status" });

        await db.query("UPDATE orders SET status=? WHERE id=?", [
            status,
            req.params.id,
        ]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/orders/notifications
router.get("/notifications", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, order_id AS orderId, message, is_read AS `read`, created_at AS time FROM notifications ORDER BY created_at DESC LIMIT 50"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/orders/notifications/mark-read
router.post("/notifications/mark-read", async (req, res) => {
    try {
        await db.query("UPDATE notifications SET is_read=1");
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
