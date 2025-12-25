import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, UserPlus, DollarSign, Activity } from "lucide-react"
import { CreateDoctorDialog } from "@/components/admin/CreateDoctorDialog"
import { getAdminStats } from "@/app/actions/admin"

export default async function AdminDashboard() {
  const session = await auth()

  // Verify admin access
  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard")
  }

  const stats = await getAdminStats()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">Manage doctors, monitor revenue, and oversee platform activity.</p>
        </div>
        <CreateDoctorDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.growth.revenue}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activeDoctors}</div>
            <p className="text-xs text-muted-foreground">4 pending approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">System logs and recent platform events will appear here.</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Doctor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Top performing doctors and earnings breakdown.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
