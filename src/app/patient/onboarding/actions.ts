"use server"

import { auth } from "@/lib/auth"
import connectToDatabase from "@/lib/mongoose"
import { User } from "@/lib/models/User"
import { revalidatePath } from "next/cache"

interface HealthProfile {
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}

interface OnboardingData {
  gender: string;
  dob: Date;
  healthProfile?: HealthProfile;
  medicalHistory?: string[];
}

export async function completeOnboarding(data: OnboardingData) {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "Unauthorized" }
  }

  try {
    await connectToDatabase()

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        gender: data.gender,
        dob: data.dob,
        medicalHistory: data.medicalHistory || [],
        healthProfile: data.healthProfile || {},
        onboardingCompleted: true
      }
    )

    revalidatePath("/patient/dashboard")
    return { success: true }

  } catch (error) {
    console.error("Onboarding error:", error)
    return { error: "Failed to save profile" }
  }
}
