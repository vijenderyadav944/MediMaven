"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getDoctorById } from "@/app/actions/doctor"
import { getAvailableSlots, createAppointment } from "@/app/actions/appointment"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"


export default function BookAppointmentPage() {
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

    if (result.success) {
      // Redirect to success or payment
      // For now redirect to dashboard
      router.push("/patient/dashboard?booked=true")
    } else {
      alert("Failed to book: " + result.error)
    }
  }

  if (loadingDoctor) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!doctor) {
    return <div className="text-center py-20">Doctor not found.</div>
  }

  return (
    <div className="container max-w-4xl py-10">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
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
                  <span className="font-bold">${doctor.price}</span>
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

        {/* Selection */}
        <div className="md:col-span-2 space-y-6">
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
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  )
}
