"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Video,
  Clock
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "patient" | "doctor" | "admin";
}

export function Sidebar({ className, role = "doctor" }: SidebarProps) {
  const pathname = usePathname()

  const doctorLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
    { href: "/dashboard/availability", label: "Availability", icon: Clock },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const patientLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/doctors", label: "Find Doctors", icon: Users },
    { href: "/dashboard/history", label: "My Health", icon: Users },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  const links = role === "patient" ? patientLinks : doctorLinks

  return (
    <div className={cn("pb-12 h-full border-r bg-muted/10", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Button
                key={link.href}
                variant={pathname === link.href ? "secondary" : "ghost"}
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

      <div className="px-3">
        <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
