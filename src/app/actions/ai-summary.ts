"use server"

import { auth } from "@/lib/auth"
import { Appointment } from "@/lib/models/Appointment"
import { InstantMeeting } from "@/lib/models/InstantMeeting"
import connectToDatabase from "@/lib/mongoose"
import { revalidatePath } from "next/cache"

// List of 7 free OpenRouter models to use as fallback
const FREE_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2-7b-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free",
  "openchat/openchat-7b:free",
]

async function callOpenRouter(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY not configured")
    return null
  }

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "MediMaven Healthcare"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "You are a medical documentation assistant. Generate clear, comprehensive, and easy-to-understand summaries of medical consultations. Be thorough and use simple language that any patient can understand."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        console.log(`Model ${model} failed with status ${response.status}, trying next...`)
        continue
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (content) {
        console.log(`Successfully generated summary using ${model}`)
        return content
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error)
      continue
    }
  }

  return null
}

export async function generateMeetingSummary(appointmentId: string, transcription: string, isInstantMeeting: boolean = false) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    let meeting: any
    let doctorName: string
    let doctorSpecialty: string
    let patientName: string

    if (isInstantMeeting) {
      meeting = await InstantMeeting.findById(appointmentId)
        .populate("doctorId", "name specialty")
        .populate("patientId", "name")

      if (!meeting) {
        return { error: "Instant meeting not found" }
      }

      doctorName = (meeting.doctorId as any)?.name || "Doctor"
      doctorSpecialty = (meeting.doctorId as any)?.specialty || meeting.specialty || "General Medicine"
      patientName = (meeting.patientId as any)?.name || "Patient"
    } else {
      meeting = await Appointment.findById(appointmentId)
        .populate("doctorId", "name specialty")
        .populate("patientId", "name")

      if (!meeting) {
        return { error: "Appointment not found" }
      }

      doctorName = (meeting.doctorId as any)?.name || "Doctor"
      doctorSpecialty = (meeting.doctorId as any)?.specialty || "General Medicine"
      patientName = (meeting.patientId as any)?.name || "Patient"
    }

    // Verify user is part of this meeting
    const userId = session.user.id
    const patientIdStr = (meeting.patientId as any)?._id?.toString()
    const doctorIdStr = (meeting.doctorId as any)?._id?.toString()

    if (patientIdStr !== userId && doctorIdStr !== userId) {
      return { error: "Unauthorized" }
    }

    // Generate English summary
    const englishPrompt = `
You are a medical documentation assistant. Based on the following transcription of a medical consultation between ${doctorName} (${doctorSpecialty}) and ${patientName}, please generate a comprehensive and easy-to-understand summary.

TRANSCRIPTION:
${transcription}

Please provide a detailed summary that includes:

1. **Consultation Overview**: A brief overview of what the consultation was about.

2. **Main Concerns/Symptoms Discussed**: What health issues or symptoms did the patient mention?

3. **Doctor's Assessment**: What did the doctor say about the condition? Include any observations or preliminary assessments.

4. **Recommendations & Advice**: What advice, recommendations, or lifestyle changes did the doctor suggest?

5. **Medications Prescribed** (if any): List any medications mentioned, including dosage and frequency if discussed.

6. **Follow-up Instructions**: Any follow-up appointments, tests, or actions the patient needs to take.

7. **Important Points to Remember**: Key takeaways the patient should remember from this consultation.

Please write in a clear, friendly, and easy-to-understand manner. Avoid medical jargon where possible, and explain any medical terms used.
`

    const englishSummary = await callOpenRouter(englishPrompt)

    if (!englishSummary) {
      return { error: "Failed to generate summary. Please try again later." }
    }

    // Generate Hindi translation
    const hindiPrompt = `
Please translate the following medical consultation summary into Hindi (हिंदी). 
Keep the same structure and formatting. Use simple Hindi that is easy for anyone to understand.
If there are medical terms that don't have common Hindi equivalents, you can keep them in English with Hindi explanation.

ENGLISH SUMMARY:
${englishSummary}

Please provide the complete Hindi translation now:
`

    const hindiSummary = await callOpenRouter(hindiPrompt)

    // Save to meeting/appointment
    meeting.transcription = transcription
    meeting.summary = {
      english: englishSummary,
      hindi: hindiSummary || "हिंदी अनुवाद उपलब्ध नहीं है। कृपया अंग्रेजी सारांश देखें।",
      generatedAt: new Date()
    }
    await meeting.save()

    if (isInstantMeeting) {
      revalidatePath(`/session/instant/${appointmentId}/review`)
    } else {
      revalidatePath(`/session/${appointmentId}/review`)
    }

    return { 
      success: true, 
      summary: {
        english: englishSummary,
        hindi: hindiSummary || "हिंदी अनुवाद उपलब्ध नहीं है। कृपया अंग्रेजी सारांश देखें।"
      }
    }
  } catch (error) {
    console.error("Error generating summary:", error)
    return { error: "Failed to generate summary" }
  }
}

export async function saveTranscription(appointmentId: string, transcription: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    // First try to find as a regular appointment
    const appointment = await Appointment.findById(appointmentId)
    
    if (appointment) {
      // Append to existing transcription
      const existingTranscription = appointment.transcription || ""
      appointment.transcription = existingTranscription + (existingTranscription ? "\n" : "") + transcription
      await appointment.save()
      return { success: true }
    }

    // If not found as appointment, try as instant meeting
    const { InstantMeeting } = await import("@/lib/models/InstantMeeting")
    const instantMeeting = await InstantMeeting.findById(appointmentId)
    
    if (instantMeeting) {
      // Append to existing transcription
      const existingTranscription = instantMeeting.transcription || ""
      instantMeeting.transcription = existingTranscription + (existingTranscription ? "\n" : "") + transcription
      await instantMeeting.save()
      return { success: true }
    }

    return { error: "Appointment or instant meeting not found" }
  } catch (error) {
    console.error("Error saving transcription:", error)
    return { error: "Failed to save transcription" }
  }
}

export async function getAppointmentSummary(appointmentId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: "Not authenticated" }
    }

    await connectToDatabase()

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name specialty")
      .populate("patientId", "name")
      .lean()

    if (!appointment) {
      return { error: "Appointment not found" }
    }

    // Verify user is the patient (only patients should see summary)
    const userId = session.user.id
    const patientIdStr = (appointment.patientId as any)?._id?.toString()

    if (patientIdStr !== userId) {
      return { error: "Only patients can view the consultation summary" }
    }

    return {
      success: true,
      summary: appointment.summary,
      transcription: appointment.transcription,
      doctorName: (appointment.doctorId as any)?.name,
      doctorSpecialty: (appointment.doctorId as any)?.specialty
    }
  } catch (error) {
    console.error("Error fetching summary:", error)
    return { error: "Failed to fetch summary" }
  }
}
