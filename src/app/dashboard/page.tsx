import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const role = (session.user as any).role || "patient"

  if (role === "admin") {
    redirect("/admin/dashboard")
  } else if (role === "doctor") {
    redirect("/doctor/dashboard")
  } else {
    redirect("/patient/dashboard")
  }
}
