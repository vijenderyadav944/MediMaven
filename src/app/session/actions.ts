"use server"

import { auth } from "@/lib/auth"
import { Appointment } from "@/lib/models/Appointment"
import { User } from "@/lib/models/User"
import connectToDatabase from "@/lib/mongoose"

// Generate a unique room ID
function generateRoomId(): string {
  return `mm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get session details for a video call
export async function getSessionDetails(sessionId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Please log in to access this session" }
    }

    await connectToDatabase()

    // Check if sessionId is an appointment ID or a room ID
    let appointment = null
    
    // Try to find by appointment ID first (must be 24 char hex string for ObjectId)
    const isValidObjectId = sessionId.length === 24 && /^[0-9a-fA-F]{24}$/.test(sessionId)
    if (isValidObjectId) {
      appointment = await Appointment.findById(sessionId)
        .populate("doctorId", "name email image specialty")
        .populate("patientId", "name email image healthProfile")
        .lean()
    }
    
    // If not found, try finding by meetingLink
    if (!appointment) {
      appointment = await Appointment.findOne({ meetingLink: { $regex: sessionId } })
        .populate("doctorId", "name email image specialty")
        .populate("patientId", "name email image healthProfile")
        .lean()
    }

    // If still not found, return demo session data
    if (!appointment) {
      return {
        roomUrl: `demo-room-${sessionId}`,
        sessionId: sessionId,
        userName: session.user.name || "User",
        duration: 30,
        isDemo: true
      }
    }

    const userId = session.user.id
    // Handle both populated and non-populated cases
    const doctorIdStr = (appointment.doctorId as any)?._id?.toString() || appointment.doctorId?.toString()
    const patientIdStr = (appointment.patientId as any)?._id?.toString() || appointment.patientId?.toString()
    const isDoctor = doctorIdStr === userId
    const isPatient = patientIdStr === userId

    // Verify user is part of this appointment
    if (!isDoctor && !isPatient) {
      return { error: "You do not have access to this session" }
    }

    // Check appointment status
    if (appointment.status === "cancelled") {
      return { error: "This appointment has been cancelled" }
    }

    return {
      roomUrl: appointment.meetingLink || `room-${appointment._id}`,
      sessionId: appointment._id.toString(),
      appointmentId: appointment._id.toString(),
      userId: userId,
      userName: session.user.name || "User",
      doctorName: (appointment.doctorId as any)?.name || "Doctor",
      patientName: (appointment.patientId as any)?.name || "Patient",
      patientHealthProfile: isDoctor ? (appointment.patientId as any)?.healthProfile : undefined,
      specialty: (appointment.doctorId as any)?.specialty,
      duration: appointment.duration || 30,
      scheduledDate: appointment.date,
      isDoctor,
      isPatient
    }
  } catch (error) {
    console.error("Error getting session details:", error)
    return { error: "Failed to load session details" }
  }
}

// Create a new meeting room for an appointment
export async function createMeetingRoom(appointmentId: string) {
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

    // Generate meeting link if not exists
    if (!appointment.meetingLink) {
      const roomId = generateRoomId()
      appointment.meetingLink = `/session/${roomId}`
      await appointment.save()
    }

    return {
      meetingLink: appointment.meetingLink,
      roomId: appointment.meetingLink.split("/").pop()
    }
  } catch (error) {
    console.error("Error creating meeting room:", error)
    return { error: "Failed to create meeting room" }
  }
}

// Update appointment status when session ends
export async function endSession(appointmentId: string, notes?: string) {
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

    appointment.status = "completed"
    if (notes) {
      appointment.notes = notes
    }
    await appointment.save()

    return { success: true }
  } catch (error) {
    console.error("Error ending session:", error)
    return { error: "Failed to end session" }
  }
}

// Legacy function for backward compatibility
export async function createDailyRoom() {
  const roomId = generateRoomId()
  return {
    url: `/session/${roomId}`,
    name: roomId
  }
}
