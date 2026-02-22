const express = require("express");
const router = express.Router();
const db = require("../config/db");

// POST /api/contact - User submits a form
router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const [result] = await db.query(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            [name, email, message]
        );

        // Also add a row to notifications so the bell icon updates
        const contactId = result.insertId;
        await db.query(
            "INSERT INTO notifications (message) VALUES (?)",
            [`New message from ${name}`]
        );

        res.status(201).json({ success: true, id: contactId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/contact - Admin fetches all messages
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, message, is_read AS `read`, reply, created_at AS time FROM contact_messages ORDER BY created_at DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/contact/user/:email - User fetches their own messages
router.get("/user/:email", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, message, reply, created_at AS time FROM contact_messages WHERE email = ? ORDER BY created_at DESC",
            [req.params.email]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/contact/:id/reply - Admin replies to a message
router.put("/:id/reply", async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        await db.query(
            "UPDATE contact_messages SET reply = ?, is_read = 1 WHERE id = ?",
            [reply, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/contact/:id/read - Mark single as read optionally
router.put("/:id/read", async (req, res) => {
    try {
        await db.query("UPDATE contact_messages SET is_read = 1 WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
