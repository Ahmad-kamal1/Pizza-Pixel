require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const itemsRoutes = require("./routes/items");
const ordersRoutes = require("./routes/orders");
const profileRoutes = require("./routes/profile");
const contactRoutes = require("./routes/contact");

const app = express();

// Allow requests from the Vite dev server
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8080"] }));
app.use(express.json({ limit: "10mb" })); // 10mb to support base64 image uploads

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Pizza Pixel API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🍕 Pizza Pixel API running on http://localhost:${PORT}`);
});
