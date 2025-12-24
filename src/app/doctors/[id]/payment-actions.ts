"use server"

import { auth } from "@/lib/auth"
import connectToDatabase from "@/lib/mongoose"
import { Transaction } from "@/lib/models/Transaction"
import { revalidatePath } from "next/cache"

// Mock Square Payment Processing (Hackathon Mode)
export async function processPayment(amount: number, token: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await connectToDatabase()

    // 1. In a real app, verify `token` with Square Backend API here.
    // const s = new SquareClient(...)
    // await s.paymentsApi.createPayment(...)

    // For Demo: Assume success if token exists
    const isSuccess = !!token;

    // 2. Record Transaction
    const transaction = new Transaction({
      userId: session.user.id,
      amount: amount,
      status: isSuccess ? "completed" : "failed",
      provider: "square"
    })

    await transaction.save()

    if (!isSuccess) {
      return { error: "Payment declined" }
    }

    return { success: true, transactionId: transaction._id.toString() }

  } catch (error) {
    console.error("Payment error:", error)
    return { error: "Payment processing failed" }
  }
}
