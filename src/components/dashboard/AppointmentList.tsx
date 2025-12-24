"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Clock } from "lucide-react"

// Mock Data
const APPOINTMENTS = [
  {
    id: "1",
    patient: "Alice Smith",
    time: "10:30 AM",
    date: "Today",
    type: "Video Consultation",
    status: "upcoming",
    image: "https://i.pravatar.cc/150?u=alice"
  },
  {
    id: "2",
    patient: "Bob Jones",
    time: "02:00 PM",
    date: "Today",
    type: "Video Consultation",
    status: "upcoming",
    image: "https://i.pravatar.cc/150?u=bob"
  },
  {
    id: "3",
    patient: "Charlie Day",
    time: "11:00 AM",
    date: "Tomorrow",
    type: "Follow-up",
    status: "confirmed",
    image: "https://i.pravatar.cc/150?u=charlie"
  }
]

export function AppointmentList() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Appointments</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {APPOINTMENTS.map((apt) => (
          <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={apt.image} />
                <AvatarFallback>{apt.patient[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">{apt.patient}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {apt.date}
                  <Clock className="h-3 w-3 ml-2" /> {apt.time}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {apt.status === "upcoming" && apt.date === "Today" && (
                <Link href={`/session/demo-${apt.id}`}>
                  <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                    <Video className="h-3 w-3" /> Join Call
                  </Button>
                </Link>
              )}
              <Badge variant="secondary">{apt.type}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
