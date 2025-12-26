'use server'

import { auth } from "@/lib/auth"
import { Appointment } from "@/lib/models/Appointment"
import connectToDatabase from "@/lib/mongoose"
import { revalidatePath } from "next/cache"
import { User } from "@/lib/models/User"

// Helper to serialize mongo objects
function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

// Generate a unique room ID for meeting links
function generateRoomId(): string {
  return `mm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function getPatientAppointments() {
  try {
    const session = await auth()
    if (!session?.user) return []

    await connectToDatabase()

    // Find appointments where patientId matches current user
    const appointments = await Appointment.find({ patientId: session.user.id })
      .populate("doctorId", "name email specialty image")
      .sort({ date: 1 }) // Upcoming first
      .lean()

    return serialize(appointments)
  } catch (error) {
    console.error("Failed to fetch patient appointments:", error)
    return []
  }
}

export async function getDoctorAppointments() {
  try {
    const session = await auth()
    if (!session?.user) return []

    await connectToDatabase()

    const appointments = await Appointment.find({ doctorId: session.user.id })
      .populate("patientId", "name email image gender dob healthProfile")
      .sort({ date: 1 })
      .lean()

    return serialize(appointments)
  } catch (error) {
    console.error("Failed to fetch doctor appointments:", error)
    return []
  }
}

export async function getDoctorStats() {
  try {
    const session = await auth()
    if (!session?.user) return { patients: 0, appointments: 0, revenue: 0, rating: 0 }

    await connectToDatabase()

    const appointments = await Appointment.find({ doctorId: session.user.id }).lean()

    const uniquePatients = new Set(appointments.map(a => a.patientId.toString())).size
    const totalAppointments = appointments.length
    const revenue = appointments.reduce((sum, a) => sum + (a.amount || 0), 0)

    // Calculate ratings from completed appointments
    const ratedAppointments = await Appointment.find({
      doctorId: session.user.id,
      status: "completed",
      rating: { $exists: true }
    }).lean()

    const averageRating = ratedAppointments.length > 0
      ? ratedAppointments.reduce((sum, a) => sum + (a.rating || 0), 0) / ratedAppointments.length
      : 0

    return {
      patients: uniquePatients,
      appointments: totalAppointments,
      revenue: revenue,
      rating: Number(averageRating.toFixed(1))
    }
  } catch (error) {
    console.error("Failed to fetch doctor stats:", error)
    return { patients: 0, appointments: 0, revenue: 0, rating: 0 }
  }
}

// Create a new appointment with meeting link
export async function createAppointment(data: {
  doctorId: string
  date: Date
  amount: number
  duration?: number
  notes?: string
}) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    // Verify doctor exists
    const doctor = await User.findById(data.doctorId)
    if (!doctor || doctor.role !== "doctor") {
      return { error: "Doctor not found" }
    }

    // Generate meeting link
    const roomId = generateRoomId()
    const meetingLink = `/session/${roomId}`

    const appointment = await Appointment.create({
      patientId: session.user.id,
      doctorId: data.doctorId,
      date: data.date,
      amount: data.amount,
      duration: data.duration || 30,
      status: "scheduled",
      paymentStatus: "pending",
      meetingLink,
      notes: data.notes
    })

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return {
      success: true,
      appointmentId: appointment._id.toString(),
      meetingLink
    }
  } catch (error) {
    console.error("Failed to create appointment:", error)
    return { error: "Failed to create appointment" }
  }
}

// Update appointment payment status
export async function updatePaymentStatus(appointmentId: string, transactionId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Verify user is the patient
    if (appointment.patientId.toString() !== session.user.id) {
      return { error: "Unauthorized" }
    }

    appointment.paymentStatus = "paid"
    await appointment.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to update payment:", error)
    return { error: "Failed to update payment" }
  }
}

// Cancel an appointment
export async function cancelAppointment(appointmentId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Verify user is part of the appointment
    const userId = session.user.id
    if (
      appointment.patientId.toString() !== userId &&
      appointment.doctorId.toString() !== userId
    ) {
      return { error: "Unauthorized" }
    }

    appointment.status = "cancelled"
    await appointment.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to cancel appointment:", error)
    return { error: "Failed to cancel appointment" }
  }
}

// Complete an appointment (for doctors)
export async function completeAppointment(appointmentId: string, notes?: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Verify user is the doctor
    if (appointment.doctorId.toString() !== session.user.id) {
      return { error: "Only the doctor can complete this appointment" }
    }

    appointment.status = "completed"
    if (notes) {
      appointment.notes = notes
    }
    await appointment.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to complete appointment:", error)
    return { error: "Failed to complete appointment" }
  }
}

// Rate an appointment (for patients)
export async function rateAppointment(appointmentId: string, rating: number, review?: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" }
    }

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Verify user is the patient
    if (appointment.patientId.toString() !== session.user.id) {
      return { error: "Only the patient can rate this appointment" }
    }

    // Must be completed to rate
    if (appointment.status !== "completed") {
      return { error: "Can only rate completed appointments" }
    }

    appointment.rating = rating
    if (review) {
      appointment.review = review
    }
    await appointment.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to rate appointment:", error)
    return { error: "Failed to rate appointment" }
  }
}

// For testing purposes - Seed some data if needed
export async function seedTestAppointment(doctorId: string) {
  const session = await auth()
  if (!session?.user) return { error: "Not logged in" }

  await connectToDatabase()

  // Create an appointment for tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  const roomId = generateRoomId()

  await Appointment.create({
    patientId: session.user.id,
    doctorId: doctorId,
    date: tomorrow,
    amount: 50,
    status: "scheduled",
    paymentStatus: "paid",
    meetingLink: `/session/${roomId}`
  })

  revalidatePath("/patient/dashboard")
  revalidatePath("/doctor/dashboard")
  return { success: true }
}

// Helper to check overlaps
function isOverlapping(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB
}

export async function getAvailableSlots(doctorId: string, dateStr: string) {
  try {
    await connectToDatabase()

    // 1. Get Doctor's settings
    const doctor = await User.findById(doctorId).select("doctorProfile").lean()
    if (!doctor || !doctor.doctorProfile) return []

    // Default to strict availability if not set
    const availability = doctor.doctorProfile.availability || {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      startTime: "09:00",
      endTime: "17:00"
    }
    const consultationDuration = doctor.doctorProfile.consultationDuration || 30

    // 2. Parse Date
    const selectedDate = new Date(dateStr)
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' })

    // Check if working day
    if (!availability.days.includes(dayName)) {
      return []
    }

    // 3. Get Existing Appointments
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await Appointment.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" }
    }).select("date duration").lean()

    // 4. Generate All Possible Slots
    const slots = []
    const now = new Date()

    const [startHour, startMin] = availability.startTime.split(':').map(Number)
    const [endHour, endMin] = availability.endTime.split(':').map(Number)

    let currentSlot = new Date(selectedDate)
    currentSlot.setHours(startHour, startMin, 0, 0)

    const endTime = new Date(selectedDate)
    endTime.setHours(endHour, endMin, 0, 0)

    const durationMs = consultationDuration * 60 * 1000

    while (currentSlot.getTime() + durationMs <= endTime.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + durationMs)

      // Skip past time slots - only show future slots (with 15 min buffer)
      const isInPast = currentSlot.getTime() < now.getTime() + 15 * 60 * 1000

      // Check Overlap with existing appointments
      const isBlocked = existingAppointments.some((appt) => {
        const apptStart = new Date(appt.date)
        const apptEnd = new Date(apptStart.getTime() + (appt.duration * 60 * 1000))
        return isOverlapping(currentSlot, slotEnd, apptStart, apptEnd)
      })

      if (!isBlocked && !isInPast) {
        slots.push(currentSlot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
      }

      currentSlot = new Date(currentSlot.getTime() + durationMs)
    }

    return slots

  } catch (error) {
    console.error("Error getting slots:", error)
    return []
  }
}

// Get patient health profile for doctor view
export async function getPatientHealthProfile(patientId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return null
    }

    await connectToDatabase()

    // Verify the requester is a doctor who has an appointment with this patient
    const hasAppointment = await Appointment.findOne({
      doctorId: session.user.id,
      patientId: patientId
    })

    if (!hasAppointment && (session.user as any).role !== "admin") {
      return null
    }

    const patient = await User.findById(patientId)
      .select("name email gender dob healthProfile medicalHistory image")
      .lean()

    if (!patient) return null

    return serialize(patient)
  } catch (error) {
    console.error("Error fetching patient profile:", error)
    return null
  }
}

// Submit review for an appointment
export async function submitReview(appointmentId: string, rating: number, review: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Only the patient can submit a review
    if (appointment.patientId.toString() !== session.user.id) {
      return { error: "Only the patient can submit a review" }
    }

    // Only completed appointments can be reviewed
    if (appointment.status !== "completed") {
      return { error: "Only completed appointments can be reviewed" }
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" }
    }

    appointment.rating = rating
    appointment.review = review
    await appointment.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")
    revalidatePath(`/doctors/${appointment.doctorId}`)

    return { success: true }
  } catch (error) {
    console.error("Failed to submit review:", error)
    return { error: "Failed to submit review" }
  }
}

// Get appointment by ID
export async function getAppointmentById(appointmentId: string) {
  try {
    const session = await auth()
    if (!session?.user) return null

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId", "name email image healthProfile gender dob")
      .populate("doctorId", "name email specialty image")
      .lean()

    if (!appointment) return null

    // Verify user is part of this appointment - handle both populated and non-populated cases
    const userId = session.user.id
    const patientIdStr = (appointment.patientId as any)?._id?.toString() || appointment.patientId?.toString()
    const doctorIdStr = (appointment.doctorId as any)?._id?.toString() || appointment.doctorId?.toString()
    
    if (
      patientIdStr !== userId &&
      doctorIdStr !== userId &&
      (session.user as any).role !== "admin"
    ) {
      return null
    }

    return serialize(appointment)
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return null
  }
}
