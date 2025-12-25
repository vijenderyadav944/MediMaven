'use server'

import { User } from "@/lib/models/User"
import connectToDatabase from "@/lib/mongoose"

function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export async function searchDoctors(query: string = "", specialty: string = "all") {
  try {
    await connectToDatabase()

    const filter: any = { role: "doctor" }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { specialty: { $regex: query, $options: "i" } }
      ]
    }

    if (specialty && specialty !== "all") {
      // If specific specialty matches, override regex specialty search or combine?
      // Simple approach: strict match if provided via dropdown
      filter.specialty = { $regex: specialty, $options: "i" }
    }

    const doctors = await User.find(filter)
      .select("name specialty image _id bio doctorProfile")
      .lean()

    // Mock price/location/rating for now as they are not on User model yet
    // In future, these should optionally be added to User or a DoctorProfile model
    const doctorsWithExtras = doctors.map(doc => ({
      ...doc,
      id: doc._id.toString(),
      rating: 5.0, // Default for now
      reviews: 0,
      price: (doc as any).doctorProfile?.price || 50,
      location: "Online",
      availability: "Available Today"
    }))

    return serialize(doctorsWithExtras)

  } catch (error) {
    console.error("Error searching doctors:", error)
    return []
  }
}

// Get a single doctor by ID
export async function getDoctorById(doctorId: string) {
  try {
    await connectToDatabase()

    const doctor = await User.findById(doctorId)
      .select("name specialty image bio email")
      .lean()

    if (!doctor || (doctor as any).role === "patient") {
      return null
    }

    // Add extra fields
    const doctorProfile = (doctor as any).doctorProfile || {}

    // Calculate rating from appointments later, for now mock or simple aggregation if available
    // For MVP we can still use mock rating until review system is fully connected

    const doctorWithExtras = {
      ...doctor,
      id: (doctor as any)._id.toString(),
      rating: 5.0,
      reviews: 0,
      price: doctorProfile.price || 50,
      consultationDuration: doctorProfile.consultationDuration || 30,
      qualifications: doctorProfile.qualifications || [],
      experience: doctorProfile.experience || 0,
      location: "Online", // Or add to profile
      availability: doctorProfile.availability || { days: [], startTime: "09:00", endTime: "17:00" }
    }

    return serialize(doctorWithExtras)
  } catch (error) {
    console.error("Error fetching doctor:", error)
    return null
  }
}

// Get all specialties for filtering
export async function getSpecialties() {
  try {
    await connectToDatabase()

    const specialties = await User.distinct("specialty", { role: "doctor" })
    return specialties.filter(Boolean) // Remove null/undefined
  } catch (error) {
    console.error("Error fetching specialties:", error)
    return []
  }
}
