import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, CreditCard, History, User, Video, Star, MessageSquare, Zap } from "lucide-react"
import { getPatientAppointments } from "@/app/actions/appointment"
import { format, isAfter, isBefore, addMinutes } from "date-fns"
import { CancelAppointmentBtn } from "@/components/dashboard/CancelAppointmentBtn"

export default async function PatientDashboard() {
  const session = await auth()

  if (!session?.user || (session.user as any).role !== "patient") {
    redirect("/dashboard")
  }

  const appointments = await getPatientAppointments()
  const now = new Date()

  // Filter appointments
  const upcomingAppointments = appointments.filter((a: any) =>
    new Date(a.date) > now && a.status !== "cancelled"
  )
  const historyAppointments = appointments.filter((a: any) =>
    new Date(a.date) <= now || a.status === "completed"
  )

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
        <h1 className="text-3xl font-bold tracking-tight">My Health Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled consultations with doctors.</CardDescription>
              </div>
              <Link href="/doctors">
                <Button>Book New</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {upcomingAppointments.map((apt: any) => {
                  const canJoin = isJoinable(apt)
                  const meetingLink = apt.meetingLink || `/session/${apt._id}`

                  return (
                    <div
                      key={apt._id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{apt.doctorId?.name || 'Dr. Unknown'}</h4>
                          <p className="text-sm text-muted-foreground">{apt.doctorId?.specialty || 'Specialist'}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(apt.date), "PPP p")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CancelAppointmentBtn
                          appointmentId={apt._id}
                          isPast={new Date(apt.date) < new Date()}
                        />
                        {apt.paymentStatus === "pending" && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Payment Pending
                          </Badge>
                        )}
                        {canJoin ? (
                          <Link href={meetingLink}>
                            <Button className="gap-2 bg-green-600 hover:bg-green-700">
                              <Video className="h-4 w-4" />
                              Join Call
                            </Button>
                          </Link>
                        ) : (
                          <Badge variant="secondary">
                            {format(new Date(apt.date), "MMM d, h:mm a")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming appointments.</p>
                <Link href="/doctors">
                  <Button variant="link" className="mt-2">Book a consultation</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Stats */}
        <div className="space-y-6">
          {/* Instant Consultation Card */}
          <Card className="border-amber-500/30 bg-linear-to-br from-amber-500/10 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Need Help Now?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with an available doctor in minutes.
              </p>
              <Link href="/session/instant" className="block">
                <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600">
                  <Zap className="h-4 w-4" />
                  Instant Consultation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/doctors" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Find a Doctor
                </Button>
              </Link>
              <Link href="/patient/onboarding" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Update Health Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyAppointments.length > 0 ? (
                historyAppointments.slice(0, 3).map((apt: any) => (
                  <div key={apt._id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      <span>{format(new Date(apt.date), "MM/dd/yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.rating ? (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs">{apt.rating}</span>
                        </div>
                      ) : apt.status === "completed" ? (
                        <Badge variant="secondary" className="text-xs">Rate</Badge>
                      ) : null}
                      <span className="text-muted-foreground capitalize">{apt.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No history available.</p>
              )}
              <div className="flex justify-between items-center text-sm pt-4 border-t">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Total Spent
                </span>
                <span className="text-muted-foreground font-medium">
                  ₹{appointments.reduce((sum: number, a: any) => {
                    if (a.status === 'cancelled') return sum;
                    return sum + (a.amount || 0);
                  }, 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
