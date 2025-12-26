import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, DollarSign, Activity, Users, Star, Clock, Edit, TrendingUp, Video, IndianRupee } from "lucide-react"
import { CreateDoctorDialog } from "@/components/admin/CreateDoctorDialog"
import { EditDoctorDialog } from "@/components/admin/EditDoctorDialog"
import { getAdminStats, getAllDoctors } from "@/app/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await auth()

  // Verify admin access
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard")
  }

  const stats = await getAdminStats()
  const doctors = await getAllDoctors()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Manage doctors, monitor revenue, and oversee platform activity.</p>
        </div>
        <CreateDoctorDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.growth.revenue}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDoctors}</div>
            <p className="text-xs text-muted-foreground">Registered doctors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">All time appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Fee</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalSessions > 0 ? Math.round(stats.revenue / stats.totalSessions) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>
      </div>

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Doctor Performance Overview ({doctors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {doctors.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-center">Total Meetings</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead className="text-center">Total Earnings</TableHead>
                    <TableHead className="text-center">Avg. Rating</TableHead>
                    <TableHead className="text-center">Fee/Session</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor: any) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={doctor.image} alt={doctor.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {doctor.name?.replace(/^Dr\.?\s*/i, "")[0] || "D"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{doctor.stats?.totalMeetings || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={doctor.stats?.completedMeetings > 0 ? "default" : "secondary"}>
                          {doctor.stats?.completedMeetings || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                          <IndianRupee className="h-4 w-4" />
                          {(doctor.stats?.totalEarnings || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-medium">
                            {(doctor.stats?.avgRating || 5.0).toFixed(1)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-primary">
                          ₹{doctor.doctorProfile?.price || 500}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <EditDoctorDialog doctor={doctor} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No doctors registered yet.</p>
              <p className="text-sm">Click "Add New Doctor" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
