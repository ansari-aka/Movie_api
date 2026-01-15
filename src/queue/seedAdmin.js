import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/user.js";

await connectDB();

if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
  console.log("Missing ADMIN_EMAIL / ADMIN_PASSWORD in .env");
  process.exit(1);
}

const existing = await User.findOne({ email: env.ADMIN_EMAIL });
if (existing) {
  console.log("Admin already exists:", env.ADMIN_EMAIL);
  process.exit(0);
}

const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
await User.create({
  email: env.ADMIN_EMAIL,
  passwordHash,
  role: "admin",
  name: "Admin",
});

console.log("✅ Admin created:", env.ADMIN_EMAIL);
process.exit(0);
