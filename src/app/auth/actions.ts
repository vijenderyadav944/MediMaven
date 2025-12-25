"use server";

import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerUser(formData: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = validatedFields.data;

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "Email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "patient", // Default role
      onboardingCompleted: false
    });

    await newUser.save();

    return { success: true };
  } catch (error: any) {
    console.error("Detailed Registration Error:", error);
    return { error: error.message || "Registration failed" };
  }
}
