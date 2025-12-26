'use server'

import { auth } from "@/lib/auth"
import { Message } from "@/lib/models/Message"
import { Appointment } from "@/lib/models/Appointment"
import connectToDatabase from "@/lib/mongoose"
import { revalidatePath } from "next/cache"

function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

// Get messages for an appointment
export async function getMessages(appointmentId: string) {
  try {
    const session = await auth()
    if (!session?.user) return []

    await connectToDatabase()

    // Verify user is part of this appointment
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) return []

    const userId = session.user.id
    if (
      appointment.patientId.toString() !== userId &&
      appointment.doctorId.toString() !== userId
    ) {
      return []
    }

    const messages = await Message.find({ appointmentId })
      .populate("senderId", "name image")
      .sort({ createdAt: 1 })
      .lean()

    return serialize(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}

// Send a message
export async function sendMessage(appointmentId: string, content: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    // Verify user is part of this appointment
    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return { error: "Appointment not found" }
    }

    const userId = session.user.id
    const isPatient = appointment.patientId.toString() === userId
    const isDoctor = appointment.doctorId.toString() === userId

    if (!isPatient && !isDoctor) {
      return { error: "Unauthorized" }
    }

    const receiverId = isPatient 
      ? appointment.doctorId.toString() 
      : appointment.patientId.toString()

    const message = await Message.create({
      appointmentId,
      senderId: userId,
      receiverId,
      content,
      type: "text"
    })

    revalidatePath(`/session/${appointmentId}`)

    return { success: true, message: serialize(message) }
  } catch (error) {
    console.error("Error sending message:", error)
    return { error: "Failed to send message" }
  }
}

// Mark messages as read
export async function markMessagesAsRead(appointmentId: string) {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Not authenticated" }

    await connectToDatabase()

    await Message.updateMany(
      { 
        appointmentId, 
        receiverId: session.user.id,
        read: false 
      },
      { read: true }
    )

    return { success: true }
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return { error: "Failed to update messages" }
  }
}

// Get unread message count
export async function getUnreadCount(appointmentId?: string) {
  try {
    const session = await auth()
    if (!session?.user) return 0

    await connectToDatabase()

    const query: any = { 
      receiverId: session.user.id,
      read: false 
    }

    if (appointmentId) {
      query.appointmentId = appointmentId
    }

    const count = await Message.countDocuments(query)
    return count
  } catch (error) {
    console.error("Error getting unread count:", error)
    return 0
  }
}
