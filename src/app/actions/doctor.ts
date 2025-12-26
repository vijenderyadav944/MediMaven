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
      filter.specialty = { $regex: specialty, $options: "i" }
    }

    const doctors = await User.find(filter)
      .select("name specialty image _id bio doctorProfile")
      .lean()

    // Get ratings for all doctors
    const doctorIds = doctors.map(d => d._id)
    const { Appointment } = await import("@/lib/models/Appointment")
    const mongoose = await import("mongoose")
    
    const ratingsData = await Appointment.aggregate([
      { $match: { doctorId: { $in: doctorIds }, rating: { $exists: true, $ne: null } } },
      { $group: { _id: "$doctorId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])
    
    const ratingsMap = new Map(ratingsData.map(r => [r._id.toString(), { rating: r.avgRating, count: r.count }]))

    const doctorsWithExtras = doctors.map(doc => {
      const ratingInfo = ratingsMap.get(doc._id.toString()) || { rating: 5.0, count: 0 }
      return {
        ...doc,
        id: doc._id.toString(),
        rating: Number(ratingInfo.rating.toFixed(1)),
        reviews: ratingInfo.count,
        price: (doc as any).doctorProfile?.price || 500,
        consultationDuration: (doc as any).doctorProfile?.consultationDuration || 30,
        location: "Online",
        availability: "Available Today"
      }
    })

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
      .select("name specialty image bio email doctorProfile role")
      .lean()

    if (!doctor || (doctor as any).role === "patient") {
      return null
    }

    // Add extra fields from doctorProfile
    const doctorProfile = (doctor as any).doctorProfile || {}

    // Calculate average rating from completed appointments with ratings
    const ratingResult = await (await import("@/lib/models/Appointment")).Appointment.aggregate([
      { $match: { doctorId: new (await import("mongoose")).default.Types.ObjectId(doctorId), rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])
    
    const averageRating = ratingResult[0]?.avgRating || 0
    const reviewCount = ratingResult[0]?.count || 0

    const doctorWithExtras = {
      ...doctor,
      id: (doctor as any)._id.toString(),
      rating: Number(averageRating.toFixed(1)) || 5.0,
      reviews: reviewCount,
      price: doctorProfile.price || 500,
      consultationDuration: doctorProfile.consultationDuration || 30,
      qualifications: doctorProfile.qualifications || [],
      experience: doctorProfile.experience || 0,
      location: "Online",
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

// Get price ranges for all specialties (dynamic, from actual doctor data)
export async function getSpecialtyPriceRanges(): Promise<{ name: string; minPrice: number; maxPrice: number }[]> {
  try {
    await connectToDatabase()

    // Aggregate to get min/max prices per specialty
    const priceRanges = await User.aggregate([
      { $match: { role: "doctor", specialty: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$specialty",
          minPrice: { $min: { $ifNull: ["$doctorProfile.price", 500] } },
          maxPrice: { $max: { $ifNull: ["$doctorProfile.price", 500] } }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          minPrice: 1,
          maxPrice: 1
        }
      },
      { $sort: { name: 1 } }
    ])

    return priceRanges
  } catch (error) {
    console.error("Error fetching specialty price ranges:", error)
    return []
  }
}

// Get booked slots for a doctor on a specific date
export async function getBookedSlots(doctorId: string, date: Date) {
  try {
    await connectToDatabase()
    const { Appointment } = await import("@/lib/models/Appointment")

    // Get start and end of the selected day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Find all appointments for this doctor on this date that are not cancelled or failed
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
      paymentStatus: { $ne: "failed" }
    }).lean()

    // Extract booked time slots
    const bookedSlots = appointments.map(apt => {
      const aptDate = new Date(apt.date)
      const hours = aptDate.getHours()
      const minutes = aptDate.getMinutes()
      const period = hours >= 12 ? "PM" : "AM"
      const hour12 = hours % 12 || 12
      return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`
    })

    return bookedSlots
  } catch (error) {
    console.error("Error fetching booked slots:", error)
    return []
  }
}
