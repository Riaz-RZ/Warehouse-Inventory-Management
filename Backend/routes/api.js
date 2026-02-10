const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Admin = require("../models/Admin");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (secret && String(secret).trim()) return String(secret).trim();
    return "dev_secret_change_me";
};

const signToken = (doc) => {
    return jwt.sign(
        { sub: String(doc._id), role: doc.role || "User" },
        getJwtSecret(),
        { expiresIn: "7d" }
    );
};

const requireAuth = async (req, res, next) => {
    try {
        const auth = req.headers.authorization || "";
        const [scheme, token] = auth.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const payload = jwt.verify(token, getJwtSecret());
        const role = payload?.role;

        if (role === "Admin") {
            const admin = await Admin.findById(payload.sub).select("name email role avatarPath");
            if (!admin) return res.status(401).json({ success: false, message: "Unauthorized" });
            req.user = { role: "Admin", doc: admin };
            return next();
        }

        const user = await User.findById(payload.sub).select("name email role avatarPath");
        if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
        req.user = { role: "User", doc: user };
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "Admin") {
        return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return next();
};

const avatarUploadDir = path.join(__dirname, "..", "public", "uploads", "avatars");
fs.mkdirSync(avatarUploadDir, { recursive: true });

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarUploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const safeExt = ext && ext.length <= 10 ? ext : "";
        const role = (req.user?.role || "user").toLowerCase();
        const id = req.user?.doc?._id;
        const name = `${role}_${id}_${Date.now()}${safeExt}`;
        cb(null, name);
    },
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const okTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!okTypes.includes(file.mimetype)) {
            const err = new Error("Only JPG, PNG, or WEBP images are allowed");
            err.status = 400;
            return cb(err);
        }
        return cb(null, true);
    },
});

router.post('/login', async (req, res) => {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const admin = await Admin.findOne({ email });
        if (admin) {
            const ok = await bcrypt.compare(password, admin.passwordHash);
            if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

            admin.lastLoginAt = new Date();
            await admin.save();

            const token = signToken(admin);
            const userPayload = {
                id: String(admin._id),
                name: admin.name,
                email: admin.email,
                role: admin.role || "Admin",
                avatarPath: admin.avatarPath || "",
            };

            return res.json({
                success: true,
                message: "Login successful",
                token,
                user: userPayload,
                admin: userPayload,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        user.lastLoginAt = new Date();
        await user.save();

        const token = signToken(user);
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role || "User",
                avatarPath: user.avatarPath || "",
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/admin/me", requireAuth, requireAdmin, async (req, res) => {
    const admin = await Admin.findById(req.user.doc._id).select("name email role avatarPath lastLoginAt createdAt");
    return res.json({ success: true, admin });
});

router.get("/me", requireAuth, async (req, res) => {
    const role = req.user.role;
    const Model = role === "Admin" ? Admin : User;
    const me = await Model.findById(req.user.doc._id).select("name email role avatarPath lastLoginAt createdAt");
    return res.json({ success: true, user: me });
});

router.patch("/admin/me", requireAuth, requireAdmin, (req, res) => {
    uploadAvatar.single("avatar")(req, res, async (err) => {
        try {
            if (err) {
                return res.status(err.status || 400).json({ success: false, message: err.message || "Upload failed" });
            }

            const name = req.body?.name !== undefined ? String(req.body.name).trim() : undefined;
            const email = req.body?.email !== undefined ? String(req.body.email).trim().toLowerCase() : undefined;

            const updates = {};
            if (name !== undefined) {
                if (!name) return res.status(400).json({ success: false, message: "Name is required" });
                updates.name = name;
            }
            if (email !== undefined) {
                if (!email) return res.status(400).json({ success: false, message: "Email is required" });
                updates.email = email;
            }

            if (req.file) updates.avatarPath = `/uploads/avatars/${req.file.filename}`;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ success: false, message: "No updates provided" });
            }

            const updated = await Admin.findByIdAndUpdate(req.user.doc._id, updates, {
                new: true,
                runValidators: true,
                projection: "name email role avatarPath lastLoginAt createdAt",
            });

            return res.json({ success: true, message: "Profile updated", admin: updated });
        } catch (e) {
            if (e && e.code === 11000) {
                return res.status(409).json({ success: false, message: "Email already exists" });
            }
            console.error("Update admin profile error:", e);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
});

router.patch("/me", requireAuth, (req, res) => {
    uploadAvatar.single("avatar")(req, res, async (err) => {
        try {
            if (err) {
                return res.status(err.status || 400).json({ success: false, message: err.message || "Upload failed" });
            }

            const name = req.body?.name !== undefined ? String(req.body.name).trim() : undefined;
            const email = req.body?.email !== undefined ? String(req.body.email).trim().toLowerCase() : undefined;

            const updates = {};
            if (name !== undefined) {
                if (!name) return res.status(400).json({ success: false, message: "Name is required" });
                updates.name = name;
            }
            if (email !== undefined) {
                if (!email) return res.status(400).json({ success: false, message: "Email is required" });
                updates.email = email;
            }

            if (req.file) updates.avatarPath = `/uploads/avatars/${req.file.filename}`;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ success: false, message: "No updates provided" });
            }

            const role = req.user.role;
            const Model = role === "Admin" ? Admin : User;

            const updated = await Model.findByIdAndUpdate(req.user.doc._id, updates, {
                new: true,
                runValidators: true,
                projection: "name email role avatarPath lastLoginAt createdAt",
            });

            return res.json({ success: true, message: "Profile updated", user: updated });
        } catch (e) {
            if (e && e.code === 11000) {
                return res.status(409).json({ success: false, message: "Email already exists" });
            }
            console.error("Update profile error:", e);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
});

router.patch("/admin/me/password", requireAuth, requireAdmin, async (req, res) => {
    try {
        const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
        const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const admin = await Admin.findById(req.user.doc._id);
        if (!admin) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!ok) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        admin.passwordHash = await bcrypt.hash(newPassword, 10);
        await admin.save();

        return res.json({ success: true, message: "Password updated" });
    } catch (e) {
        console.error("Change password error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.patch("/me/password", requireAuth, async (req, res) => {
    try {
        const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
        const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "currentPassword and newPassword are required" });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const role = req.user.role;
        const Model = role === "Admin" ? Admin : User;
        const me = await Model.findById(req.user.doc._id);
        if (!me) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const ok = await bcrypt.compare(currentPassword, me.passwordHash);
        if (!ok) {
            return res.status(400).json({ success: false, message: "Current password is incorrect" });
        }

        me.passwordHash = await bcrypt.hash(newPassword, 10);
        await me.save();

        return res.json({ success: true, message: "Password updated" });
    } catch (e) {
        console.error("Change password error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/users", requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: "User" })
            .select("name email role avatarPath lastLoginAt createdAt")
            .sort({ createdAt: -1 });
        return res.json({ success: true, data: users });
    } catch (e) {
        console.error("List users error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post("/users", requireAuth, requireAdmin, async (req, res) => {
    try {
        const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const password = typeof req.body?.password === "string" ? req.body.password : "";

        if (!name) return res.status(400).json({ success: false, message: "Name is required" });
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const created = await User.create({ name, email, passwordHash, role: "User" });

        return res.status(201).json({
            success: true,
            message: "User created",
            data: {
                id: String(created._id),
                name: created.name,
                email: created.email,
                role: created.role,
                avatarPath: created.avatarPath || "",
                createdAt: created.createdAt,
            },
        });
    } catch (e) {
        if (e && e.code === 11000) {
            return res.status(409).json({ success: false, message: "Email already exists" });
        }
        console.error("Create user error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid user id" });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if ((user.role || "User") !== "User") {
            return res.status(400).json({ success: false, message: "Only users can be deleted" });
        }

        await User.findByIdAndDelete(id);
        return res.json({ success: true, message: "User deleted" });
    } catch (e) {
        console.error("Delete user error:", e);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post("/products", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name, sku, category, unit, warehouse } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ success: false, message: "Product name is required" });
        }
        if (!sku || !String(sku).trim()) {
            return res.status(400).json({ success: false, message: "SKU is required" });
        }
        if (!category || !String(category).trim()) {
            return res.status(400).json({ success: false, message: "Category is required" });
        }
        if (!unit || !String(unit).trim()) {
            return res.status(400).json({ success: false, message: "Unit is required" });
        }
        if (!warehouse || !String(warehouse).trim()) {
            return res.status(400).json({ success: false, message: "Warehouse is required" });
        }

        const product = await Product.create({
            name: String(name).trim(),
            sku: String(sku).trim(),
            category: String(category).trim(),
            unit: String(unit).trim(),
            warehouse: String(warehouse).trim(),
        });

        return res.status(201).json({ success: true, message: "Product created", data: product });
    } catch (err) {
        if (err && err.code === 11000) {
            const keyPattern = err?.keyPattern || {};
            const isSkuWarehouseDup = keyPattern.sku && keyPattern.warehouse;
            return res.status(409).json({
                success: false,
                message: isSkuWarehouseDup
                    ? "SKU already exists in this warehouse"
                    : "Duplicate key error",
            });
        }
        console.error("Create product error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/products", requireAuth, async (req, res) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

        const filter = {};
        if (search) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$or = [
                { name: regex },
                { sku: regex },
                { category: regex },
                { warehouse: regex },
            ];
        }

        const skip = (page - 1) * limit;

        const [totalItems, items] = await Promise.all([
            Product.countDocuments(filter),
            Product.find(filter)
                .select("-minStock")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

        return res.json({
            success: true,
            data: items,
            meta: {
                page,
                limit,
                totalItems,
                totalPages,
                search,
            },
        });
    } catch (err) {
        console.error("List products error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post("/products/:id/stock-in", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const quantityRaw = req.body?.quantity;
        const quantity = parseInt(quantityRaw, 10);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
        }

        const updated = await Product.findByIdAndUpdate(
            id,
            { $inc: { stock: quantity } },
            { new: true, runValidators: true, projection: "-minStock" }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, message: "Stock updated", data: updated });
    } catch (err) {
        console.error("Stock-in error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post("/products/:id/stock-out", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const quantityRaw = req.body?.quantity;
        const quantity = parseInt(quantityRaw, 10);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
        }

        const updated = await Product.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true, runValidators: true, projection: "-minStock" }
        );

        if (!updated) {
            const exists = await Product.exists({ _id: id });
            if (!exists) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        return res.json({ success: true, message: "Stock updated", data: updated });
    } catch (err) {
        console.error("Stock-out error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post("/products/transfer", requireAuth, async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const productId = typeof req.body?.productId === "string" ? req.body.productId.trim() : "";
        const fromWarehouse = typeof req.body?.fromWarehouse === "string" ? req.body.fromWarehouse.trim() : "";
        const toWarehouse = typeof req.body?.toWarehouse === "string" ? req.body.toWarehouse.trim() : "";
        const quantityRaw = req.body?.quantity;
        const quantity = parseInt(quantityRaw, 10);

        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid productId" });
        }
        if (!fromWarehouse) {
            return res.status(400).json({ success: false, message: "fromWarehouse is required" });
        }
        if (!toWarehouse) {
            return res.status(400).json({ success: false, message: "toWarehouse is required" });
        }
        if (fromWarehouse === toWarehouse) {
            return res.status(400).json({ success: false, message: "Source and destination warehouses must be different" });
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
        }

        const transferCore = async (opts = {}) => {
            const { session: s } = opts;
            const baseFromQuery = { _id: productId, warehouse: fromWarehouse, stock: { $gte: quantity } };

            const from = await Product.findOneAndUpdate(
                baseFromQuery,
                { $inc: { stock: -quantity } },
                { new: true, runValidators: true, session: s, projection: "-minStock" }
            );

            if (!from) {
                const existsInWarehouse = await Product.exists({ _id: productId, warehouse: fromWarehouse }).session(s || null);
                if (!existsInWarehouse) {
                    const idExists = await Product.exists({ _id: productId }).session(s || null);
                    const err = new Error(idExists ? "Product not found in the selected source warehouse" : "Product not found");
                    err.status = idExists ? 400 : 404;
                    throw err;
                }
                const err = new Error("Insufficient stock");
                err.status = 400;
                throw err;
            }

            const insertDoc = {
                name: from.name,
                sku: from.sku,
                category: from.category,
                unit: from.unit,
                warehouse: toWarehouse,
            };

            const to = await Product.findOneAndUpdate(
                { sku: from.sku, warehouse: toWarehouse },
                { $setOnInsert: insertDoc, $inc: { stock: quantity } },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                    session: s,
                    projection: "-minStock",
                }
            );

            return { from, to };
        };

        let result;
        try {
            await session.withTransaction(async () => {
                result = await transferCore({ session });
            });
        } catch (txErr) {
            const msg = String(txErr?.message || "");
            const isTxUnsupported =
                msg.includes("Transaction") ||
                msg.includes("replica set") ||
                msg.includes("mongos") ||
                txErr?.code === 20;

            if (!isTxUnsupported) throw txErr;

            // Fallback for standalone MongoDB: perform operations sequentially with rollback on destination failure.
            let fromAfter;
            try {
                const { from, to } = await transferCore();
                fromAfter = from;
                result = { from, to };
            } catch (err) {
                throw err;
            } finally {
                // If we decremented source but couldn't increment destination, rollback.
                if (fromAfter && !result?.to) {
                    await Product.findByIdAndUpdate(fromAfter._id, { $inc: { stock: quantity } });
                }
            }
        }

        return res.json({
            success: true,
            message: "Stock transferred",
            data: {
                from: result.from,
                to: result.to,
            },
        });
    } catch (err) {
        const status = err?.status || 500;
        const message = err?.message || "Internal server error";
        if (status >= 500) {
            console.error("Stock transfer error:", err);
        }
        return res.status(status).json({ success: false, message });
    } finally {
        session.endSession();
    }
});

router.patch("/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sku, category, unit, warehouse } = req.body || {};

        const updates = {};
        if (name !== undefined) {
            if (!String(name).trim()) {
                return res.status(400).json({ success: false, message: "Product name is required" });
            }
            updates.name = String(name).trim();
        }
        if (sku !== undefined) {
            if (!String(sku).trim()) {
                return res.status(400).json({ success: false, message: "SKU is required" });
            }
            updates.sku = String(sku).trim();
        }
        if (category !== undefined) {
            if (!String(category).trim()) {
                return res.status(400).json({ success: false, message: "Category is required" });
            }
            updates.category = String(category).trim();
        }
        if (unit !== undefined) {
            if (!String(unit).trim()) {
                return res.status(400).json({ success: false, message: "Unit is required" });
            }
            updates.unit = String(unit).trim();
        }
        if (warehouse !== undefined) {
            if (!String(warehouse).trim()) {
                return res.status(400).json({ success: false, message: "Warehouse is required" });
            }
            updates.warehouse = String(warehouse).trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No updates provided" });
        }

        const updated = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
            projection: "-minStock",
        });

        if (!updated) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.json({ success: true, message: "Product updated", data: updated });
    } catch (err) {
        if (err && err.code === 11000) {
            const keyPattern = err?.keyPattern || {};
            const isSkuWarehouseDup = keyPattern.sku && keyPattern.warehouse;
            return res.status(409).json({
                success: false,
                message: isSkuWarehouseDup
                    ? "SKU already exists in this warehouse"
                    : "Duplicate key error",
            });
        }
        console.error("Update product error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.delete("/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.json({ success: true, message: "Product deleted" });
    } catch (err) {
        console.error("Delete product error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;