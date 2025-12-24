"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker"
import { SecurePaymentForm } from "@/components/booking/PaymentForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon, Clock, CreditCard } from "lucide-react"

// Mock Doctor Data (Normally fetched via API)
const MOCK_DOCTOR = {
  id: "1",
  name: "Dr. Emily Chen",
  specialty: "Cardiologist",
  image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  price: 120
}

export default function BookingPage() {
  const params = useParams()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [slot, setSlot] = React.useState<string | null>(null)
  const [step, setStep] = React.useState(1) // 1: Date/Time, 2: Review/Pay
  const [transactionId, setTransactionId] = React.useState<string | null>(null)

  const handleContinue = () => {
    setStep(2)
  }

  const handleSuccess = (id: string) => {
    setTransactionId(id)
    alert(`Payment Successful! Transaction: ${id}. Redirecting to video room...`)
    // Redirect to /session/[id] in real app
  }

  return (
    <div className="min-h-screen bg-muted/10 py-12 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-md border-border/50">
            <CardHeader>
              <CardTitle>
                {step === 1 ? "Select Appointment Time" : "Secure Checkout"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Choose a date and time for your consultation."
                  : "Complete your payment to confirm the booking."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <TimeSlotPicker
                  date={date}
                  setDate={setDate}
                  slot={slot}
                  setSlot={setSlot}
                />
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Service</span>
                      <span className="text-sm">Video Consultation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Provider</span>
                      <span className="text-sm">{MOCK_DOCTOR.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Time</span>
                      <span className="text-sm text-primary font-bold">
                        {date && slot ? `${format(date, "MMM d")} @ ${slot}` : ""}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <SecurePaymentForm
                    amount={MOCK_DOCTOR.price}
                    onSuccess={handleSuccess}
                  />
                </div>
              )}
            </CardContent>
            {step === 1 && (
              <CardFooter className="flex justify-end border-t p-6">
                <Button
                  size="lg"
                  disabled={!date || !slot}
                  onClick={handleContinue}
                >
                  Continue to Payment
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="md:col-span-1">
          <Card className="shadow-md border-border/50 sticky top-24">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-background">
                  <AvatarImage src={MOCK_DOCTOR.image} />
                  <AvatarFallback>EC</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">{MOCK_DOCTOR.name}</h3>
                  <p className="text-xs text-muted-foreground">{MOCK_DOCTOR.specialty}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-medium">${MOCK_DOCTOR.price}.00</span>
              </div>
              <Separator />

              {date && slot && (
                <div className="space-y-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span>{format(date, "MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{slot}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary">${MOCK_DOCTOR.price}.00</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 text-xs text-muted-foreground text-center">
              <div className="w-full flex items-center justify-center gap-1">
                <CreditCard className="h-3 w-3" /> Secure Payment
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
