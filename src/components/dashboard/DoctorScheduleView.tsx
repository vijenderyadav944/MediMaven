"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, ChevronLeft, ChevronRight, User } from "lucide-react"
import { format, addDays, startOfWeek, isSameDay, isAfter, isBefore, addMinutes } from "date-fns"
import Link from "next/link"

interface Appointment {
  _id: string
  date: string
  duration: number
  status: string
  patientId?: {
    name: string
    email: string
  }
  meetingLink?: string
}

interface DoctorScheduleViewProps {
  appointments: Appointment[]
  availability?: {
    startTime: string
    endTime: string
  }[]
}

export function DoctorScheduleView({ appointments, availability = [] }: DoctorScheduleViewProps) {
  const [selectedDate, setSelectedDate] = React.useState(new Date())
  const now = new Date()
  
  // Get the week start (Sunday)
  const weekStart = startOfWeek(selectedDate)
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  
  // Time slots for the day (8 AM to 8 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8 // 8 AM start
    return `${hour.toString().padStart(2, "0")}:00`
  })
  
  // Get appointments for selected date
  const dayAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.date), selectedDate) && apt.status !== "cancelled"
  )
  
  // Check if a time slot has an appointment
  const getAppointmentAtTime = (timeSlot: string) => {
    const [hour] = timeSlot.split(":").map(Number)
    return dayAppointments.find(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getHours() === hour
    })
  }
  
  // Check if appointment is joinable
  const isJoinable = (apt: Appointment) => {
    const aptDate = new Date(apt.date)
    const joinWindowStart = addMinutes(aptDate, -10)
    const joinWindowEnd = addMinutes(aptDate, apt.duration || 30)
    return isAfter(now, joinWindowStart) && isBefore(now, joinWindowEnd) && apt.status === "scheduled"
  }
  
  // Navigate weeks
  const goToPreviousWeek = () => setSelectedDate(addDays(selectedDate, -7))
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7))
  const goToToday = () => setSelectedDate(new Date())
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>View and manage your appointments</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Week Day Selector */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day, index) => {
            const isSelected = isSameDay(day, selectedDate)
            const isToday = isSameDay(day, now)
            const hasAppointments = appointments.some(
              apt => isSameDay(new Date(apt.date), day) && apt.status !== "cancelled"
            )
            
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-lg text-center transition-colors relative ${
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : isToday 
                      ? "bg-primary/10 text-primary border border-primary"
                      : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="text-xs font-medium opacity-70">{format(day, "EEE")}</div>
                <div className="text-lg font-semibold">{format(day, "d")}</div>
                {hasAppointments && (
                  <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  }`} />
                )}
              </button>
            )
          })}
        </div>
        
        {/* Selected Date Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <Badge variant="secondary">
            {dayAppointments.length} appointment{dayAppointments.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        
        {/* Time Slots Grid */}
        <div className="space-y-2 max-h-100 overflow-y-auto pr-2">
          {timeSlots.map((timeSlot) => {
            const appointment = getAppointmentAtTime(timeSlot)
            const [hour] = timeSlot.split(":").map(Number)
            const isPast = isSameDay(selectedDate, now) && hour < now.getHours()
            
            return (
              <div 
                key={timeSlot}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  appointment 
                    ? "bg-primary/5 border-primary/30" 
                    : isPast 
                      ? "bg-muted/30 opacity-50"
                      : "bg-background border-border"
                }`}
              >
                {/* Time */}
                <div className="w-20 text-sm font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date().setHours(hour, 0), "h:mm a")}
                </div>
                
                {/* Appointment or Free */}
                <div className="flex-1">
                  {appointment ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {appointment.patientId?.name || "Patient"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.duration || 30} min consultation
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={appointment.status === "completed" ? "secondary" : "outline"}
                          className="capitalize"
                        >
                          {appointment.status}
                        </Badge>
                        
                        {isJoinable(appointment) && (
                          <Link href={appointment.meetingLink || `/session/${appointment._id}`}>
                            <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                              <Video className="h-3 w-3" />
                              Join
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className={`text-sm ${isPast ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
                      {isPast ? "Past" : "Available"}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Summary */}
        {dayAppointments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total scheduled time: {dayAppointments.reduce((acc, apt) => acc + (apt.duration || 30), 0)} minutes</span>
              <span>Next available: {
                timeSlots.find(slot => {
                  const [hour] = slot.split(":").map(Number)
                  const slotDate = new Date(selectedDate)
                  slotDate.setHours(hour, 0, 0, 0)
                  return !getAppointmentAtTime(slot) && isAfter(slotDate, now)
                }) || "No slots today"
              }</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
