"use client"

import * as React from "react"
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk"
import { Button } from "@/components/ui/button"
import { processPayment } from "@/app/doctors/[id]/payment-actions"
import { Loader2 } from "lucide-react"

interface PaymentFormProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
}

// Sandbox Application ID (Public Sandbox Key for Hackathon usage)
// Normally this goes in .env, but for generic hackathon templates we can use a known sandbox ID or placeholders.
// I will use a placeholder that works or requires user input.
// Actually, Square SDK requires a valid App ID to render.
// I will wrap it in an error boundary or provide a clear message if ID is missing.
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID || "sandbox-sq0idb-mock-app-id";
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "L_MOCK";

export function SecurePaymentForm({ amount, onSuccess }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  // MOCK MODE: If Env vars are missing, render a simulation button
  if (SQUARE_APP_ID === "sandbox-sq0idb-mock-app-id") {
    return (
      <div className="space-y-4 border p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
        <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">Sandbox Mode</h3>
        <p className="text-sm text-muted-foreground">
          Square API keys not found. Running in simulation mode.
        </p>
        <Button
          onClick={async () => {
            setIsProcessing(true);
            // Simulate web request delay
            await new Promise(r => setTimeout(r, 2000));
            const res = await processPayment(amount, "mock_token_" + Date.now());
            setIsProcessing(false);
            if (res.success && res.transactionId) {
              onSuccess(res.transactionId);
            } else {
              alert("Simulation failed");
            }
          }}
          className="w-full"
          disabled={isProcessing}
        >
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Simulate Pay ${amount}
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-md">
      <PaymentForm
        applicationId={SQUARE_APP_ID}
        cardTokenizeResponseReceived={async (token: any, verifiedBuyer) => {
          setIsProcessing(true);
          const res = await processPayment(amount, token.token);
          setIsProcessing(false);
          if (res.success && res.transactionId) {
            onSuccess(res.transactionId);
          } else {
            alert("Payment failed: " + res.error);
          }
        }}
        locationId={SQUARE_LOCATION_ID}
      >
        <CreditCard />
      </PaymentForm>
    </div>
  )
}
