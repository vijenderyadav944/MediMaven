import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, DollarSign, Activity, Users, Star, Clock, Edit } from "lucide-react"
import { CreateDoctorDialog } from "@/components/admin/CreateDoctorDialog"
import { EditDoctorDialog } from "@/components/admin/EditDoctorDialog"
import { getAdminStats, getAllDoctors } from "@/app/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
            Manage Doctors ({doctors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {doctors.length > 0 ? (
              doctors.map((doctor: any) => (
                <div 
                  key={doctor.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doctor.image} alt={doctor.name} />
                      <AvatarFallback>{doctor.name?.[0] || "D"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{doctor.name}</h4>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-primary">₹{doctor.doctorProfile?.price || 500}</p>
                      <p className="text-xs text-muted-foreground">{doctor.doctorProfile?.consultationDuration || 30} min</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">5.0</span>
                    </div>
                    <EditDoctorDialog doctor={doctor} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No doctors registered yet. Click "Add New Doctor" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
