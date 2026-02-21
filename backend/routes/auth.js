const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if email exists
        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email.toLowerCase()]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, 'customer')",
            [firstName, lastName, email.toLowerCase(), hashed]
        );

        return res.status(201).json({
            id: result.insertId,
            firstName,
            lastName,
            email: email.toLowerCase(),
            role: "customer",
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }

        const [rows] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email.toLowerCase()]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const user = rows[0];

        // Support plain-text passwords (like the default admin) for legacy/demo data,
        // but compare with bcrypt for real registered users.
        let passwordMatch = false;
        if (user.password.startsWith("$2")) {
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            passwordMatch = password === user.password;
        }

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        return res.json({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            phone: user.phone || "",
            address: user.address || "",
            avatar: user.avatar_url || "",
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
