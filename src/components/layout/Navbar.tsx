"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Stethoscope, User, LayoutDashboard, LogOut, Zap } from "lucide-react"
import { useSession, signOut } from "next-auth/react" // Client side session

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Navigation Links
const navigation = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Doctors", href: "/doctors" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false) // State for sidebar

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? "bg-background/80 backdrop-blur-md border-b shadow-sm"
        : "bg-transparent border-transparent"
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-300">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
            MediMaven
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {item.name}
            </Link>
          ))}
          {/* Instant Consultation - Highlighted */}
          <Link href="/session/instant">
            <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600">
              <Zap className="h-3.5 w-3.5" />
              Instant
            </Button>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>
                      {(() => {
                        const name = session.user.name || ""
                        // Skip "Dr." prefix to get the actual first letter
                        const cleanName = name.replace(/^Dr\.?\s*/i, "")
                        return cleanName[0]?.toUpperCase() || name[0]?.toUpperCase() || "U"
                      })()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Mobile Header with Logo */}
                <div className="flex items-center gap-2 mb-8 px-2">
                  <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <SheetTitle className="text-xl font-bold tracking-tight">
                    MediMaven
                  </SheetTitle>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium px-4 py-3 rounded-md transition-colors ${pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Instant Consultation in Mobile Menu */}
                  <Link href="/session/instant" onClick={() => setIsOpen(false)} className="mt-4 px-2">
                    <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md">
                      <Zap className="h-4 w-4" />
                      Instant Consultation
                    </Button>
                  </Link>
                </nav>

                <div className="flex flex-col gap-3 mt-auto mb-6 px-2">
                  {session?.user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback>
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{session.user.email}</p>
                        </div>
                      </div>
                      <Link href="/dashboard" className="w-full" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2 h-11">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Button>
                      </Link>
                      <Button variant="ghost" className="w-full justify-start gap-2 h-11 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => signOut()}>
                        <LogOut className="h-4 w-4" /> Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-center h-11">Log in</Button>
                      </Link>
                      <Link href="/auth/register" className="w-full" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-center h-11 shadow-sm">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
