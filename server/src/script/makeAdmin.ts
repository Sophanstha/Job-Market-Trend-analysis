import dotenv   from "dotenv";
import mongoose from "mongoose";
import User from "../models/User..model";

dotenv.config();

// ── Hardcode your admin credentials here ─────────────────────
const ADMIN_NAME     = "Sophan Shrestha";
const ADMIN_EMAIL    = "admin@jobmarket.com";
const ADMIN_PASSWORD = "admin123";

const run = async (): Promise<void> => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existing) {
      // Already exists — just make sure role is admin
      existing.role = "admin";
      existing.password = ADMIN_PASSWORD; // pre-save hook re-hashes it
      await existing.save();
      console.log(`\n✅ Existing user updated to admin.`);
    } else {
      // Create fresh admin account
      const admin = await User.create({
        name:     ADMIN_NAME,
        email:    ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD, // pre-save hook hashes it automatically
        role:     "admin",
      });
      console.log(`\n✅ New admin account created.`);
      console.log(`   ID: ${admin._id}`);
    }

    console.log(`\n📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`\n💡 Log in at /login with these credentials.`);

    process.exit(0);

  } catch (error) {
    console.error("❌ Failed:", (error as Error).message);
    process.exit(1);
  }
};

run();