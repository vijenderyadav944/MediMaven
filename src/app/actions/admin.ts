'use server'

import { auth } from "@/lib/auth"
import { User } from "@/lib/models/User"
import { Appointment } from "@/lib/models/Appointment"
import connectToDatabase from "@/lib/mongoose"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  specialty: z.string().min(2),
})

export async function createDoctor(prevState: any, formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
      return { message: "Unauthorized" }
    }

    const validateFields = CreateDoctorSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      specialty: formData.get("specialty"),
    })

    if (!validateFields.success) {
      return { message: "Invalid fields", errors: validateFields.error.flatten().fieldErrors }
    }

    const { name, email, password, specialty } = validateFields.data

    await connectToDatabase()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return { message: "User already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      specialty,
      onboardingCompleted: true
    })

    revalidatePath("/admin/dashboard")
    return { message: "Doctor created successfully", success: true }

  } catch (error) {
    console.error("Failed to create doctor:", error)
    return { message: "Database Error: Failed to create doctor." }
  }
}

export async function getAdminStats() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
      return {
        revenue: 0,
        activeDoctors: 0,
        totalSessions: 0,
        growth: { revenue: 0 }
      }
    }

    await connectToDatabase()

    // 1. Total Revenue
    const revenueStats = await Appointment.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    const revenue = revenueStats[0]?.total || 0

    // 2. Active Doctors
    const activeDoctors = await User.countDocuments({ role: "doctor" })

    // 3. Total Sessions
    const totalSessions = await Appointment.countDocuments({})

    // Mock growth for now as we need historical data logic which is complex
    const growth = {
      revenue: 12.5
    }

    return {
      revenue,
      activeDoctors,
      totalSessions,
      growth
    }
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return {
      revenue: 0,
      activeDoctors: 0,
      totalSessions: 0,
      growth: { revenue: 0 }
    }
  }
}
