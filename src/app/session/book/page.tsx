"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getDoctorById } from "@/app/actions/doctor"
import { getAvailableSlots, createAppointment, updatePaymentStatus } from "@/app/actions/appointment"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, Clock, Calendar as CalendarIcon, CreditCard, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { SecurePaymentForm } from "@/components/booking/PaymentForm"

type BookingStep = "select" | "payment" | "success"

function BookAppointmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctorId")

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [doctor, setDoctor] = useState<any>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingDoctor, setLoadingDoctor] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [step, setStep] = useState<BookingStep>("select")
  const [pendingAppointment, setPendingAppointment] = useState<{ id: string; meetingLink: string } | null>(null)

  // Fetch Doctor
  useEffect(() => {
    if (!doctorId) return

    async function fetchDoctor() {
      const data = await getDoctorById(doctorId!)
      setDoctor(data)
      setLoadingDoctor(false)
    }
    fetchDoctor()
  }, [doctorId])

  // Fetch Slots when Date or Doctor changes
  useEffect(() => {
    if (!doctor || !date) return

    async function fetchSlots() {
      setLoadingSlots(true)
      const dateStr = date!.toISOString()
      const availableSlots = await getAvailableSlots(doctor.id, dateStr)
      setSlots(availableSlots)
      setLoadingSlots(false)
    }
    fetchSlots()
  }, [doctor, date])

  async function handleBook() {
    if (!doctor || !date || !selectedSlot) return

    setBooking(true)

    // Combine date and time
    const [hours, minutes] = selectedSlot.split(':').map(Number)
    const appointmentDate = new Date(date)
    appointmentDate.setHours(hours, minutes, 0, 0)

    const result = await createAppointment({
      doctorId: doctor.id,
      date: appointmentDate,
      amount: doctor.price,
      duration: doctor.consultationDuration || 30,
      notes: "Booked via MediMaven"
    })

    setBooking(false)

    if (result.success && result.appointmentId) {
      // Move to payment step
      setPendingAppointment({ id: result.appointmentId, meetingLink: result.meetingLink || '' })
      setStep("payment")
    } else {
      alert("Failed to book: " + result.error)
    }
  }

  async function handlePaymentSuccess(transactionId: string) {
    if (!pendingAppointment) return

    // Update payment status
    const result = await updatePaymentStatus(pendingAppointment.id, transactionId)
    if (result.success) {
      setStep("success")
    } else {
      alert("Payment recorded but failed to update status. Please contact support.")
    }
  }

  if (loadingDoctor) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!doctor) {
    return <div className="text-center py-20">Doctor not found.</div>
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="container max-w-lg py-20 text-center">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Your appointment with Dr. {doctor.name} has been booked successfully.
          </p>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{date && format(date, 'PPP')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{selectedSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium">₹{doctor.price}</span>
            </div>
          </div>
          <Button onClick={() => router.push("/patient/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10 mx-auto">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => step === "payment" ? setStep("select") : router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {step === "payment" ? "Back to Selection" : "Back"}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Doctor Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.image} />
                  <AvatarFallback>{doctor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{doctor.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee</span>
                  <span className="font-bold">₹{doctor.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{doctor.consultationDuration || 30} mins</span>
                </div>
              </div>

              {date && selectedSlot && (
                <div className="bg-primary/5 p-4 rounded-lg space-y-2 border border-primary/20">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(date, 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Clock className="h-4 w-4" />
                    <span>{selectedSlot}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selection or Payment */}
        <div className="md:col-span-2 space-y-6">
          {step === "select" ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose a suitable slot for your consultation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Calendar */}
                    <div className="p-3 border rounded-md w-fit mx-auto md:mx-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </div>

                    {/* Slots Grid */}
                    <div className="flex-1">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Available Slots
                      </h3>

                      {loadingSlots ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : slots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedSlot === slot ? "default" : "outline"}
                              className={selectedSlot === slot ? "bg-primary text-primary-foreground" : ""}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                          No slots available for this date.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full text-lg py-6"
                disabled={!selectedSlot || booking}
                onClick={handleBook}
              >
                {booking && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Proceed to Payment
              </Button>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>Complete your payment to confirm the booking.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SecurePaymentForm 
                    amount={doctor.price} 
                    onSuccess={handlePaymentSuccess} 
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <BookAppointmentContent />
    </Suspense>
  )
}
