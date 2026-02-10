const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

async function ensureDefaultAdmin() {
  const existing = await Admin.countDocuments();
  if (existing > 0) return;

  const email = String(process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "password").trim();
  const name = String(process.env.ADMIN_NAME || "Admin").trim();

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed default admin");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ name, email, passwordHash, role: "Admin" });

  console.log(`Default admin created: ${email}`);
}

module.exports = ensureDefaultAdmin;
