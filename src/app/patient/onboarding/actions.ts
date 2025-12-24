"use server"

import { auth } from "@/lib/auth"
import connectToDatabase from "@/lib/mongoose"
import { User } from "@/lib/models/User"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function completeOnboarding(data: any) {
  const session = await auth()

  if (!session?.user?.email) {
    return { error: "Unauthorized" }
  }

  try {
    await connectToDatabase()

    await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...data,
        onboardingCompleted: true
      }
    )

    // Refresh session or redirect
    return { success: true }

  } catch (error) {
    console.error("Onboarding error:", error)
    return { error: "Failed to save profile" }
  }
}
