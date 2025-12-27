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
    // Only count appointments where payment is paid AND status is not cancelled (though paid usually implies not cancelled, 
    // unless they cancelled but refund request is pending/stuck, but our cancelAppointment sets it to refunded.
    // So ensuring status is not cancelled covers all bases.)
    const revenueStats = await Appointment.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    const revenue = revenueStats[0]?.total || 0

    // 2. Active Doctors
    const activeDoctors = await User.countDocuments({ role: "doctor" })

    // 3. Total Sessions
    const totalSessions = await Appointment.countDocuments({ status: { $ne: "cancelled" } })

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

// Get all doctors for admin with stats
export async function getAllDoctors() {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
      return []
    }

    await connectToDatabase()

    const doctors = await User.find({ role: "doctor" })
      .select("name email specialty image bio doctorProfile createdAt")
      .lean()

    // Get stats for each doctor
    const doctorIds = doctors.map(d => d._id)

    // Get appointment stats per doctor
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          doctorId: { $in: doctorIds },
          status: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: "$doctorId",
          totalMeetings: { $sum: 1 },
          completedMeetings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalEarnings: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$amount", 0] }
          },
          avgRating: { $avg: "$rating" }
        }
      }
    ])

    const statsMap = new Map(
      appointmentStats.map(s => [s._id.toString(), {
        totalMeetings: s.totalMeetings,
        completedMeetings: s.completedMeetings,
        totalEarnings: s.totalEarnings,
        avgRating: s.avgRating || 5.0
      }])
    )

    return JSON.parse(JSON.stringify(doctors.map(d => {
      const stats = statsMap.get(d._id.toString()) || {
        totalMeetings: 0,
        completedMeetings: 0,
        totalEarnings: 0,
        avgRating: 5.0
      }
      return {
        ...d,
        id: d._id.toString(),
        stats
      }
    })))
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return []
  }
}

// Update doctor details by admin
export async function updateDoctor(doctorId: string, data: {
  name?: string;
  email?: string;
  specialty?: string;
  bio?: string;
  image?: string;
  price?: number;
  consultationDuration?: number;
  qualifications?: string[];
  experience?: number;
  availability?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()

    const doctor = await User.findById(doctorId)
    if (!doctor || doctor.role !== "doctor") {
      return { error: "Doctor not found" }
    }

    // Update basic fields
    if (data.name) doctor.name = data.name
    if (data.email) doctor.email = data.email
    if (data.specialty) doctor.specialty = data.specialty
    if (data.bio) doctor.bio = data.bio
    if (data.image) doctor.image = data.image

    // Update doctorProfile fields
    if (!doctor.doctorProfile) {
      doctor.doctorProfile = {
        price: 500,
        consultationDuration: 30,
        qualifications: [],
        experience: 0,
        availability: {
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          startTime: "09:00",
          endTime: "17:00"
        }
      }
    }

    if (data.price !== undefined) doctor.doctorProfile.price = data.price
    if (data.consultationDuration !== undefined) doctor.doctorProfile.consultationDuration = data.consultationDuration
    if (data.qualifications) doctor.doctorProfile.qualifications = data.qualifications
    if (data.experience !== undefined) doctor.doctorProfile.experience = data.experience
    if (data.availability) doctor.doctorProfile.availability = data.availability

    await doctor.save()

    revalidatePath("/admin/dashboard")
    revalidatePath(`/doctors/${doctorId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating doctor:", error)
    return { error: "Failed to update doctor" }
  }
}

// Delete a doctor
export async function deleteDoctor(doctorId: string) {
  try {
    const session = await auth()
    if (!session?.user || (session.user as any).role !== "admin") {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()

    await User.findByIdAndDelete(doctorId)

    revalidatePath("/admin/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error deleting doctor:", error)
    return { error: "Failed to delete doctor" }
  }
}
