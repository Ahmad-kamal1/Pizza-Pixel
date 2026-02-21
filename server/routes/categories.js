const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/categories
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM categories ORDER BY id ASC"
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/categories
router.post("/", async (req, res) => {
    try {
        const { name, emoji, description, image } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const [result] = await db.query(
            "INSERT INTO categories (name, emoji, description, image_url) VALUES (?, ?, ?, ?)",
            [name, emoji || "🍕", description || "", image || ""]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            emoji: emoji || "🍕",
            description: description || "",
            image: image || "",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
    try {
        const { name, emoji, description, image } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        await db.query(
            "UPDATE categories SET name=?, emoji=?, description=?, image_url=? WHERE id=?",
            [name, emoji || "🍕", description || "", image || "", req.params.id]
        );
        res.json({ id: Number(req.params.id), name, emoji, description, image });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM categories WHERE id=?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
