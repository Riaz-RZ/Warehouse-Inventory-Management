const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const ensureDefaultAdmin = require("./utils/ensureDefaultAdmin");

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB Connection
const mongoConnect = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

// Routes
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// Start Server
const startServer = async() => {
    await mongoConnect();
    try {
        await ensureDefaultAdmin();
    } catch (err) {
        console.error("Default admin seed error:", err?.message || err);
    }
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};

startServer();