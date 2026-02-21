const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/items  (optionally ?category=Pizzas)
router.get("/", async (req, res) => {
    try {
        let query = `
      SELECT mi.id, mi.name, mi.description, mi.price, mi.image_url AS image,
             mi.is_available, c.name AS category
      FROM menu_items mi
      LEFT JOIN categories c ON c.id = mi.category_id
    `;
        const params = [];
        if (req.query.category) {
            query += " WHERE c.name = ?";
            params.push(req.query.category);
        }
        query += " ORDER BY mi.id ASC";
        const [rows] = await db.query(query, params);
        // Format price with $ to match the existing frontend expectation
        const formatted = rows.map((r) => ({
            ...r,
            price: `$${Number(r.price).toFixed(2)}`,
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/items
router.post("/", async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        if (!name || price === undefined)
            return res.status(400).json({ error: "Name and price are required" });

        // Resolve category name to id
        const [cats] = await db.query("SELECT id FROM categories WHERE name=?", [
            category || "Pizzas",
        ]);
        const categoryId = cats.length ? cats[0].id : 1;

        // Strip leading "$" if present
        const numericPrice = parseFloat(String(price).replace("$", ""));

        const [result] = await db.query(
            "INSERT INTO menu_items (category_id, name, description, price, image_url) VALUES (?,?,?,?,?)",
            [categoryId, name, description || "", numericPrice, image || ""]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            description: description || "",
            price: `$${numericPrice.toFixed(2)}`,
            image: image || "",
            category: category || "Pizzas",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/items/:id
router.put("/:id", async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        if (!name || price === undefined)
            return res.status(400).json({ error: "Name and price are required" });

        const [cats] = await db.query("SELECT id FROM categories WHERE name=?", [
            category || "Pizzas",
        ]);
        const categoryId = cats.length ? cats[0].id : 1;
        const numericPrice = parseFloat(String(price).replace("$", ""));

        await db.query(
            "UPDATE menu_items SET category_id=?, name=?, description=?, price=?, image_url=? WHERE id=?",
            [categoryId, name, description || "", numericPrice, image || "", req.params.id]
        );

        res.json({
            id: Number(req.params.id),
            name,
            description: description || "",
            price: `$${numericPrice.toFixed(2)}`,
            image: image || "",
            category: category || "Pizzas",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/items/:id
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM menu_items WHERE id=?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
