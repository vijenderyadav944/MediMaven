import { Sidebar } from "@/components/dashboard/Sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar role={session.user.role as any} className="fixed w-64 h-screen" />
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
