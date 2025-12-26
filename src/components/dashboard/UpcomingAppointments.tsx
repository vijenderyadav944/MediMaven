"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, Eye } from "lucide-react"
import { format, isAfter, isBefore, addMinutes } from "date-fns"
import { PatientDetailsDialog } from "./PatientDetailsDialog"

interface Appointment {
  _id: string
  date: string
  duration: number
  status: string
  meetingLink?: string
  paymentStatus?: string
  notes?: string
  patientId?: {
    _id: string
    name: string
    email: string
    image?: string
    gender?: string
    dob?: string
    healthProfile?: any
  }
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const now = new Date()

  // Check if appointment is joinable (within 10 min before to duration after scheduled time)
  const isJoinable = (apt: Appointment) => {
    const aptDate = new Date(apt.date)
    const joinWindowStart = addMinutes(aptDate, -10)
    const joinWindowEnd = addMinutes(aptDate, apt.duration || 30)
    return isAfter(now, joinWindowStart) && isBefore(now, joinWindowEnd) && apt.status === "scheduled"
  }

  const handleViewPatient = (apt: Appointment) => {
    setSelectedAppointment(apt)
    setDialogOpen(true)
  }

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled patient consultations - Click to view patient details</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((apt) => {
                const canJoin = isJoinable(apt)
                const meetingLink = apt.meetingLink || `/session/${apt._id}`
                
                return (
                  <div 
                    key={apt._id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewPatient(apt)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patientId?.name || "Patient"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.date), "PPP")} at {format(new Date(apt.date), "h:mm a")}
                        </p>
                        {apt.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            Notes: {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => handleViewPatient(apt)}
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {apt.paymentStatus === "pending" && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Unpaid
                        </Badge>
                      )}
                      {canJoin ? (
                        <Link href={meetingLink}>
                          <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                            <Video className="h-4 w-4" />
                            Join Call
                          </Button>
                        </Link>
                      ) : (
                        <Badge variant="secondary" className="capitalize">
                          {apt.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">No upcoming appointments scheduled.</p>
          )}
        </CardContent>
      </Card>
      
      <PatientDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selectedAppointment}
      />
    </>
  )
}
