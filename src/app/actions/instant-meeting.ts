'use server'

import { auth } from "@/lib/auth"
import { InstantMeeting } from "@/lib/models/InstantMeeting"
import { User } from "@/lib/models/User"
import connectToDatabase from "@/lib/mongoose"
import { revalidatePath } from "next/cache"

// Fixed price for instant meetings (internal use only, not exported)
const INSTANT_MEETING_PRICE = 1500

// Helper to serialize mongo objects
function serialize(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

// Generate a unique room ID for meeting links
function generateRoomId(): string {
  return `im-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Create a new instant meeting request
export async function createInstantMeetingRequest(specialty: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    if ((session.user as any).role !== "patient") {
      return { error: "Only patients can request instant meetings" }
    }

    await connectToDatabase()

    // Check if patient already has a pending instant meeting
    const existingRequest = await InstantMeeting.findOne({
      patientId: session.user.id,
      status: { $in: ["waiting", "matched", "in-progress"] }
    })

    if (existingRequest) {
      return { 
        error: "You already have an active instant meeting request",
        existingId: existingRequest._id.toString()
      }
    }

    // Generate meeting link
    const roomId = generateRoomId()
    const meetingLink = `/session/instant/${roomId}`

    const instantMeeting = await InstantMeeting.create({
      patientId: session.user.id,
      specialty,
      status: "waiting",
      paymentStatus: "pending",
      amount: INSTANT_MEETING_PRICE,
      meetingLink
    })

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return {
      success: true,
      instantMeetingId: instantMeeting._id.toString(),
      meetingLink
    }
  } catch (error) {
    console.error("Failed to create instant meeting request:", error)
    return { error: "Failed to create instant meeting request" }
  }
}

// Update instant meeting payment status
export async function updateInstantMeetingPayment(instantMeetingId: string, transactionId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findById(instantMeetingId)
    if (!instantMeeting) {
      return { error: "Instant meeting request not found" }
    }

    // Verify user is the patient
    if (instantMeeting.patientId.toString() !== session.user.id) {
      return { error: "Unauthorized" }
    }

    instantMeeting.paymentStatus = "paid"
    await instantMeeting.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to update instant meeting payment:", error)
    return { error: "Failed to update payment" }
  }
}

// Get pending instant meeting requests for a specialty (for doctors)
export async function getPendingInstantMeetings(specialty?: string) {
  try {
    const session = await auth()
    if (!session?.user) return []

    if ((session.user as any).role !== "doctor") {
      return []
    }

    await connectToDatabase()

    // Get doctor's specialty if not provided
    let targetSpecialty = specialty
    if (!targetSpecialty) {
      const doctor = await User.findById(session.user.id).select("specialty").lean()
      targetSpecialty = doctor?.specialty
    }

    if (!targetSpecialty) return []

    const pendingRequests = await InstantMeeting.find({
      specialty: { $regex: targetSpecialty, $options: "i" },
      status: "waiting",
      paymentStatus: "paid"
    })
      .populate("patientId", "name email image gender dob")
      .sort({ createdAt: 1 }) // Oldest first (FIFO)
      .lean()

    return serialize(pendingRequests)
  } catch (error) {
    console.error("Failed to fetch pending instant meetings:", error)
    return []
  }
}

// Doctor accepts an instant meeting request
export async function acceptInstantMeeting(instantMeetingId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    if ((session.user as any).role !== "doctor") {
      return { error: "Only doctors can accept instant meetings" }
    }

    await connectToDatabase()

    // Use findOneAndUpdate with status check to handle race condition
    const instantMeeting = await InstantMeeting.findOneAndUpdate(
      {
        _id: instantMeetingId,
        status: "waiting",
        paymentStatus: "paid"
      },
      {
        doctorId: session.user.id,
        status: "matched",
        matchedAt: new Date()
      },
      { new: true }
    )

    if (!instantMeeting) {
      return { error: "This request is no longer available" }
    }

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return {
      success: true,
      meetingLink: instantMeeting.meetingLink,
      instantMeetingId: instantMeeting._id.toString()
    }
  } catch (error) {
    console.error("Failed to accept instant meeting:", error)
    return { error: "Failed to accept instant meeting" }
  }
}

// Check instant meeting status (for patient polling)
export async function getInstantMeetingStatus(instantMeetingId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findById(instantMeetingId)
      .populate("doctorId", "name specialty image")
      .lean()

    if (!instantMeeting) {
      return { error: "Instant meeting not found" }
    }

    // Verify user is part of this meeting
    const isPatient = instantMeeting.patientId.toString() === session.user.id
    const isDoctor = instantMeeting.doctorId?.toString() === session.user.id

    if (!isPatient && !isDoctor) {
      return { error: "Unauthorized" }
    }

    return serialize({
      status: instantMeeting.status,
      doctorId: instantMeeting.doctorId,
      doctorName: (instantMeeting.doctorId as any)?.name,
      doctorSpecialty: (instantMeeting.doctorId as any)?.specialty,
      doctorImage: (instantMeeting.doctorId as any)?.image,
      meetingLink: instantMeeting.meetingLink,
      matchedAt: instantMeeting.matchedAt
    })
  } catch (error) {
    console.error("Failed to get instant meeting status:", error)
    return { error: "Failed to check status" }
  }
}

// Get instant meeting details for session page
export async function getInstantMeetingDetails(roomId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Please log in to access this session" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findOne({
      meetingLink: { $regex: roomId }
    })
      .populate("doctorId", "name email image specialty")
      .populate("patientId", "name email image healthProfile gender dob")
      .lean()

    if (!instantMeeting) {
      return { error: "Instant meeting not found" }
    }

    const userId = session.user.id
    const doctorIdStr = (instantMeeting.doctorId as any)?._id?.toString() || instantMeeting.doctorId?.toString()
    const patientIdStr = (instantMeeting.patientId as any)?._id?.toString() || instantMeeting.patientId?.toString()
    const isDoctor = doctorIdStr === userId
    const isPatient = patientIdStr === userId

    if (!isDoctor && !isPatient) {
      return { error: "You do not have access to this session" }
    }

    if (instantMeeting.status === "cancelled") {
      return { error: "This instant meeting has been cancelled" }
    }

    return serialize({
      roomUrl: instantMeeting.meetingLink,
      roomName: instantMeeting.meetingLink?.split("/").pop() || `room-${instantMeeting._id}`,
      sessionId: instantMeeting._id.toString(),
      instantMeetingId: instantMeeting._id.toString(),
      userId: userId,
      userName: session.user.name || "User",
      userImage: session.user.image,
      doctorName: (instantMeeting.doctorId as any)?.name || "Doctor",
      patientName: (instantMeeting.patientId as any)?.name || "Patient",
      patientHealthProfile: isDoctor ? (instantMeeting.patientId as any)?.healthProfile : undefined,
      specialty: (instantMeeting.doctorId as any)?.specialty || instantMeeting.specialty,
      status: instantMeeting.status,
      isCompleted: instantMeeting.status === "completed",
      isDoctor,
      isPatient,
      isInstantMeeting: true
    })
  } catch (error) {
    console.error("Error getting instant meeting details:", error)
    return { error: "Failed to load session details" }
  }
}

// Start instant meeting (mark as in-progress)
export async function startInstantMeeting(instantMeetingId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findById(instantMeetingId)
    if (!instantMeeting) {
      return { error: "Instant meeting not found" }
    }

    if (instantMeeting.status === "matched") {
      instantMeeting.status = "in-progress"
      await instantMeeting.save()
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to start instant meeting:", error)
    return { error: "Failed to start meeting" }
  }
}

// End instant meeting
export async function endInstantMeeting(instantMeetingId: string, notes?: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findById(instantMeetingId)
    if (!instantMeeting) {
      return { error: "Instant meeting not found" }
    }

    instantMeeting.status = "completed"
    instantMeeting.completedAt = new Date()
    if (notes) {
      instantMeeting.notes = notes
    }
    await instantMeeting.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to end instant meeting:", error)
    return { error: "Failed to end meeting" }
  }
}

// Rate instant meeting
export async function rateInstantMeeting(instantMeetingId: string, rating: number, review?: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findById(instantMeetingId)
    if (!instantMeeting) {
      return { error: "Instant meeting not found" }
    }

    if (instantMeeting.patientId.toString() !== session.user.id) {
      return { error: "Only the patient can rate this meeting" }
    }

    if (instantMeeting.status !== "completed") {
      return { error: "Can only rate completed meetings" }
    }

    instantMeeting.rating = rating
    if (review) {
      instantMeeting.review = review
    }
    await instantMeeting.save()

    revalidatePath("/patient/dashboard")
    revalidatePath("/doctor/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to rate instant meeting:", error)
    return { error: "Failed to rate meeting" }
  }
}

// Cancel instant meeting request (before being matched)
export async function cancelInstantMeetingRequest(instantMeetingId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const instantMeeting = await InstantMeeting.findById(instantMeetingId)
    if (!instantMeeting) {
      return { error: "Instant meeting not found" }
    }

    if (instantMeeting.patientId.toString() !== session.user.id) {
      return { error: "Unauthorized" }
    }

    if (instantMeeting.status !== "waiting") {
      return { error: "Cannot cancel - a doctor has already accepted" }
    }

    instantMeeting.status = "cancelled"
    await instantMeeting.save()

    // TODO: Trigger refund if payment was made

    revalidatePath("/patient/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Failed to cancel instant meeting:", error)
    return { error: "Failed to cancel request" }
  }
}

// Get patient's instant meetings
export async function getPatientInstantMeetings() {
  try {
    const session = await auth()
    if (!session?.user) return []

    await connectToDatabase()

    const meetings = await InstantMeeting.find({ patientId: session.user.id })
      .populate("doctorId", "name email specialty image")
      .sort({ createdAt: -1 })
      .lean()

    return serialize(meetings)
  } catch (error) {
    console.error("Failed to fetch patient instant meetings:", error)
    return []
  }
}

// Get doctor's instant meetings
export async function getDoctorInstantMeetings() {
  try {
    const session = await auth()
    if (!session?.user) return []

    await connectToDatabase()

    const meetings = await InstantMeeting.find({ doctorId: session.user.id })
      .populate("patientId", "name email image gender dob healthProfile")
      .sort({ createdAt: -1 })
      .lean()

    return serialize(meetings)
  } catch (error) {
    console.error("Failed to fetch doctor instant meetings:", error)
    return []
  }
}

// Get instant meeting by ID
export async function getInstantMeetingById(instantMeetingId: string) {
  try {
    const session = await auth()
    if (!session?.user) return null

    await connectToDatabase()

    const meeting = await InstantMeeting.findById(instantMeetingId)
      .populate("patientId", "name email image healthProfile gender dob")
      .populate("doctorId", "name email specialty image")
      .lean()

    if (!meeting) return null

    // Verify user is part of this meeting
    const userId = session.user.id
    const patientIdStr = (meeting.patientId as any)?._id?.toString() || meeting.patientId?.toString()
    const doctorIdStr = (meeting.doctorId as any)?._id?.toString() || meeting.doctorId?.toString()
    
    if (
      patientIdStr !== userId &&
      doctorIdStr !== userId &&
      (session.user as any).role !== "admin"
    ) {
      return null
    }

    return serialize(meeting)
  } catch (error) {
    console.error("Error fetching instant meeting:", error)
    return null
  }
}

// Save transcription for instant meeting
export async function saveInstantMeetingTranscription(instantMeetingId: string, transcription: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const meeting = await InstantMeeting.findById(instantMeetingId)
    if (!meeting) {
      return { error: "Meeting not found" }
    }

    meeting.transcription = transcription
    await meeting.save()

    return { success: true }
  } catch (error) {
    console.error("Failed to save transcription:", error)
    return { error: "Failed to save transcription" }
  }
}
