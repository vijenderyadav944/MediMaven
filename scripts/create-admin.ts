import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Manually load .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log("Could not load .env.local file, assuming environment variables are set.");
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// Define User Schema directly to avoid import issues with aliases in standalone script
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    const email = "vijender@gmail.com"; // Default admin email
    const password = "asdasd"; // Default admin password
    const name = "Vijender";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      onboardingCompleted: true,
    });

    console.log("Admin user created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createAdmin();
