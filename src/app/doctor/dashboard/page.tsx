import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Activity, Star, Video, Clock, CheckCircle2 } from "lucide-react"
import { getDoctorStats, getDoctorAppointments } from "@/app/actions/appointment"
import { format, isAfter, isBefore, addMinutes } from "date-fns"
import { DoctorScheduleView } from "@/components/dashboard/DoctorScheduleView"
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments"
import { InstantMeetingRequests } from "@/components/dashboard/InstantMeetingRequests"

export default async function DoctorDashboard() {
  const session = await auth()

  if (!session?.user || (session.user as any).role !== "doctor") {
    redirect("/dashboard")
  }

  const stats = await getDoctorStats()
  const allAppointments = await getDoctorAppointments()
  
  const now = new Date()
  
  // Filter for upcoming appointments only
  const upcomingAppointments = allAppointments.filter((apt: any) => 
    new Date(apt.date) > addMinutes(now, -30) && apt.status !== "cancelled" && apt.status !== "completed"
  )
  
  // Today's appointments
  const todayAppointments = allAppointments.filter((apt: any) => {
    const aptDate = new Date(apt.date)
    return aptDate.toDateString() === now.toDateString() && apt.status !== "cancelled"
  })
  
  // Check if appointment is joinable (within 10 min before to 30 min after scheduled time)
  const isJoinable = (apt: any) => {
    const aptDate = new Date(apt.date)
    const joinWindowStart = addMinutes(aptDate, -10)
    const joinWindowEnd = addMinutes(aptDate, apt.duration || 30)
    return isAfter(now, joinWindowStart) && isBefore(now, joinWindowEnd) && apt.status === "scheduled"
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Overview of your practice and appointments.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.patients}</div>
            <p className="text-xs text-muted-foreground">Unique patients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments}</div>
            <p className="text-xs text-muted-foreground">Total sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>{format(now, "EEEE, MMMM d")}</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((apt: any) => {
                  const canJoin = isJoinable(apt)
                  const meetingLink = apt.meetingLink || `/session/${apt._id}`
                  
                  return (
                    <div 
                      key={apt._id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                    >
                      <div>
                        <p className="font-medium text-sm">{apt.patientId?.name || "Patient"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(apt.date), "h:mm a")}
                        </p>
                      </div>
                      {canJoin ? (
                        <Link href={meetingLink}>
                          <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700">
                            <Video className="h-3 w-3" />
                            Join
                          </Button>
                        </Link>
                      ) : apt.status === "completed" ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Done
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {format(new Date(apt.date), "h:mm a")}
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-sm text-center">
                No appointments scheduled for today.
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Appointments */}
        <UpcomingAppointments appointments={upcomingAppointments} />
      </div>

      {/* Instant Meeting Requests - Prominent Section */}
      <InstantMeetingRequests />

      {/* Weekly Schedule View */}
      <DoctorScheduleView appointments={allAppointments} />
    </div>
  )
}
