"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Clock, CheckCircle2 } from "lucide-react"
import { isAfter, isBefore, addMinutes } from "date-fns"
import { formatTimeIST, isTodayIST } from "@/lib/date-utils"

interface Appointment {
  _id: string
  date: string
  status: string
  duration?: number
  meetingLink?: string
  patientId?: {
    name?: string
    image?: string
  }
  doctorId?: {
    name?: string
    specialty?: string
    image?: string
  }
}

interface AppointmentListProps {
  appointments: Appointment[]
  userRole: "patient" | "doctor"
}

export function AppointmentList({ appointments, userRole }: AppointmentListProps) {
  const now = new Date()
  
  // Check if appointment is joinable (within 10 min before to 30 min after scheduled time)
  const isJoinable = (apt: Appointment) => {
    const aptDate = new Date(apt.date)
    const joinWindowStart = addMinutes(aptDate, -10)
    const joinWindowEnd = addMinutes(aptDate, apt.duration || 30)
    return isAfter(now, joinWindowStart) && isBefore(now, joinWindowEnd) && apt.status === "scheduled"
  }

  // Filter for today's appointments
  const todayAppointments = appointments.filter((apt) => {
    return isTodayIST(apt.date) && apt.status !== "cancelled"
  })

  if (todayAppointments.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s Appointments</CardTitle>
          <Link href="/doctors">
            <Button variant="outline" size="sm">Book New</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No appointments scheduled for today.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today&apos;s Appointments</CardTitle>
        <Badge variant="secondary">{todayAppointments.length} scheduled</Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        {todayAppointments.map((apt) => {
          const person = userRole === "patient" ? apt.doctorId : apt.patientId
          const personName = person?.name || (userRole === "patient" ? "Doctor" : "Patient")
          const personImage = person?.image
          const canJoin = isJoinable(apt)
          const meetingLink = apt.meetingLink || `/session/${apt._id}`

          return (
            <div 
              key={apt._id} 
              className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={personImage} />
                  <AvatarFallback>{personName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{personName}</h4>
                  {userRole === "patient" && apt.doctorId?.specialty && (
                    <p className="text-xs text-muted-foreground">{apt.doctorId.specialty}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Today
                    <Clock className="h-3 w-3 ml-2" /> {formatTimeIST(apt.date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {apt.status === "completed" ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </Badge>
                ) : canJoin ? (
                  <Link href={meetingLink}>
                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                      <Video className="h-3 w-3" /> Join Call
                    </Button>
                  </Link>
                ) : (
                  <Badge variant="outline">
                    {formatTimeIST(apt.date)}
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
