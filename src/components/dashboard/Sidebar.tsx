"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Video,
  Clock,
  Stethoscope,
  History,
  UserCircle
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "patient" | "doctor" | "admin";
}

export function Sidebar({ className, role = "doctor" }: SidebarProps) {
  const pathname = usePathname()

  const doctorLinks = [
    { href: "/doctor/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/doctor/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/doctor/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const patientLinks = [
    { href: "/patient/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/doctors", label: "Find Doctors", icon: Stethoscope },
    { href: "/patient/onboarding", label: "Health Profile", icon: UserCircle },
  ]

  const adminLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/dashboard/doctors", label: "Manage Doctors", icon: Users },
    { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const links = role === "admin" ? adminLinks : role === "doctor" ? doctorLinks : patientLinks
  const dashboardBase = role === "admin" ? "/admin/dashboard" : role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"

  return (
    <div className={cn("pb-12 h-full border-r bg-muted/10", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-4 px-4">
            <h2 className="text-lg font-semibold tracking-tight">
              {role === "admin" ? "Admin Panel" : role === "doctor" ? "Doctor Portal" : "My Dashboard"}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">{role} Account</p>
          </div>
          <div className="space-y-1">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href || pathname.startsWith(link.href + "/") ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-3">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
