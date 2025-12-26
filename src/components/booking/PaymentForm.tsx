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

// Sandbox Application ID
// Must be set in .env.local
const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

export function SecurePaymentForm({ amount, onSuccess }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  if (!SQUARE_APP_ID || !SQUARE_LOCATION_ID) {
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50 text-red-700">
        Configuration Error: Square Application ID or Location ID is missing.
      </div>
    );
  }

  // MOCK MODE: If Env vars are missing, render a simulation button
  // (We removed mock mode fallback above, so now we strictly enforce keys)

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
          Simulate Pay ₹{amount}
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-md">
      <PaymentForm
        applicationId={SQUARE_APP_ID!}
        cardTokenizeResponseReceived={async (tokenResult) => {
          if (tokenResult.status !== 'OK' || !tokenResult.token) {
            alert("Card tokenization failed. Please try again.");
            return;
          }
          
          setIsProcessing(true);
          const res = await processPayment(amount, tokenResult.token);
          setIsProcessing(false);
          if (res.success && res.transactionId) {
            onSuccess(res.transactionId);
          } else {
            alert("Payment failed: " + res.error);
          }
        }}
        locationId={SQUARE_LOCATION_ID!}
      >
        <CreditCard />
      </PaymentForm>
    </div>
  )
}
