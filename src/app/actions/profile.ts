"use server"

import { auth } from "@/lib/auth"
import { User } from "@/lib/models/User"
import connectToDatabase from "@/lib/mongoose"
import { revalidatePath } from "next/cache"

export async function getUserProfile() {
  const session = await auth()
  if (!session?.user) return null

  await connectToDatabase()
  const user = await User.findById(session.user.id).lean()
  if (!user) return null

  return JSON.parse(JSON.stringify(user))
}

export async function updateDoctorProfile(data: any) {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Not authenticated" }

    await connectToDatabase()

    // Safely parse numbers, defaulting to undefined if NaN
    const parseNumber = (val: any) => {
      const num = Number(val)
      return isNaN(num) ? undefined : num
    }

    // Update top-level fields
    const updateData: any = {
      bio: data.bio,
      specialty: data.specialty,
    }

    // Only add numeric fields if they are valid numbers
    const price = parseNumber(data.price)
    if (price !== undefined) updateData["doctorProfile.price"] = price

    const duration = parseNumber(data.consultationDuration)
    if (duration !== undefined) updateData["doctorProfile.consultationDuration"] = duration

    const experience = parseNumber(data.experience)
    if (experience !== undefined) updateData["doctorProfile.experience"] = experience

    if (data.qualifications) {
      updateData["doctorProfile.qualifications"] = data.qualifications.split(",").map((q: string) => q.trim())
    }

    // Availability
    if (data.startTime && data.endTime) {
      updateData["doctorProfile.availability.startTime"] = data.startTime
      updateData["doctorProfile.availability.endTime"] = data.endTime
    }

    if (data.days) {
      updateData["doctorProfile.availability.days"] = data.days
    }

    await User.findByIdAndUpdate(session.user.id, { $set: updateData })

    revalidatePath("/dashboard/settings")
    revalidatePath("/doctors")
    revalidatePath(`/doctors/${session.user.id}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating doctor profile:", error)
    return { error: "Failed to update profile" }
  }
}

export async function updateHealthProfile(data: any) {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Not authenticated" }

    await connectToDatabase()

    const updateData = {
      gender: data.gender,
      dob: data.dob ? new Date(data.dob) : undefined,
      "healthProfile.bloodGroup": data.bloodGroup,
      "healthProfile.allergies": data.allergies ? data.allergies.split(",").map((s: string) => s.trim()) : [],
      "healthProfile.chronicConditions": data.chronicConditions ? data.chronicConditions.split(",").map((s: string) => s.trim()) : [],
      "healthProfile.medications": data.medications ? data.medications.split(",").map((s: string) => s.trim()) : [],
      "healthProfile.emergencyContact.name": data.emergencyName,
      "healthProfile.emergencyContact.phone": data.emergencyPhone,
      "healthProfile.emergencyContact.relation": data.emergencyRelation,
    }

    await User.findByIdAndUpdate(session.user.id, { $set: updateData })

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating health profile:", error)
    return { error: "Failed to update health profile" }
  }
}
