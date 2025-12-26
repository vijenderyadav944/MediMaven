"use server"

import { auth } from "@/lib/auth"
import connectToDatabase from "@/lib/mongoose"
import { Transaction } from "@/lib/models/Transaction"
import { SquareClient, SquareEnvironment } from "square"
import { randomUUID } from "crypto"

// Initialize Square Client for SDK v43+
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Sandbox, // Change to SquareEnvironment.Production for real payments
});

export async function processPayment(amount: number, sourceId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  if (!process.env.SQUARE_ACCESS_TOKEN) {
    console.error("Missing SQUARE_ACCESS_TOKEN");
    return { error: "Server configuration error: Missing Payment credentials" };
  }

  try {
    await connectToDatabase()

    // 1. Create Payment with Square API
    // Square Sandbox only supports USD, so we convert INR to USD
    // Using approximate exchange rate: 1 USD = 83 INR
    const INR_TO_USD_RATE = 83;
    const amountInUSD = amount / INR_TO_USD_RATE;
    
    // Amount is in cents for USD
    const amountMoney = BigInt(Math.round(amountInUSD * 100));

    const result = await squareClient.payments.create({
      sourceId: sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: amountMoney,
        currency: "USD", // Square Sandbox requires USD
      },
    });

    if (!result.payment || result.payment.status !== "COMPLETED") {
      console.error("Square Payment failed:", result.errors);
      return { error: "Payment declined by provider" };
    }

    // 2. Record Transaction
    const transaction = new Transaction({
      userId: session.user.id,
      amount: amount, // Storing original amount
      status: "completed",
      provider: "square",
      transactionId: result.payment.id // Store Square Payment ID
    })

    await transaction.save()

    return { success: true, transactionId: transaction._id.toString() }

  } catch (error: unknown) {
    console.error("Payment processing error:", error)
    // Detailed error logging for debugging
    if (error && typeof error === 'object' && 'errors' in error) {
      const sqError = error as { errors: Array<{ detail: string }> };
      console.error("Square API Errors:", sqError.errors);
      return { error: `Payment failed: ${sqError.errors[0]?.detail || 'Unknown error'}` };
    }
    return { error: "Payment processing failed" }
  }
}
