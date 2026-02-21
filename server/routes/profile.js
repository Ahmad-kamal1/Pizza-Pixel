const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// GET /api/profile/:email
router.get("/:email", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, first_name, last_name, email, phone, address, avatar_url, role FROM users WHERE email=?",
            [req.params.email.toLowerCase()]
        );
        if (!rows.length) return res.status(404).json({ error: "User not found" });
        const u = rows[0];
        res.json({
            id: u.id,
            firstName: u.first_name,
            lastName: u.last_name,
            email: u.email,
            phone: u.phone || "",
            address: u.address || "",
            avatar: u.avatar_url || "",
            role: u.role,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/profile/:email  — update profile info + optional avatar
router.put("/:email", async (req, res) => {
    try {
        const { firstName, lastName, phone, address, avatar } = req.body;
        if (!firstName || !lastName)
            return res.status(400).json({ error: "Name is required" });

        await db.query(
            "UPDATE users SET first_name=?, last_name=?, phone=?, address=?, avatar_url=? WHERE email=?",
            [
                firstName,
                lastName,
                phone || "",
                address || "",
                avatar || "",
                req.params.email.toLowerCase(),
            ]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/profile/:email/password
router.put("/:email/password", async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ error: "Both passwords required" });

        const [rows] = await db.query("SELECT password FROM users WHERE email=?", [
            req.params.email.toLowerCase(),
        ]);
        if (!rows.length) return res.status(404).json({ error: "User not found" });

        const stored = rows[0].password;
        let match = false;
        if (stored.startsWith("$2")) {
            match = await bcrypt.compare(currentPassword, stored);
        } else {
            match = currentPassword === stored;
        }
        if (!match)
            return res.status(401).json({ error: "Current password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password=? WHERE email=?", [
            hashed,
            req.params.email.toLowerCase(),
        ]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
