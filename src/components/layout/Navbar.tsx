"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Stethoscope, User, LayoutDashboard, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react" // Client side session

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
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

// Mock Links
const navigation = [
  { name: "Features", href: "/features" },
  { name: "Doctors", href: "/doctors" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession() // Hook to get session
  const [isScrolled, setIsScrolled] = React.useState(false)

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
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>{session.user.name?.[0]?.toUpperCase()}</AvatarFallback>
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-75 sm:w-100">
              <nav className="flex flex-col gap-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors block py-2 border-b border-border/50"
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="flex flex-col gap-3 mt-4">
                  {session?.user ? (
                    <>
                      <Link href="/dashboard" className="w-full">
                        <Button className="w-full justify-start gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full justify-start gap-2 text-red-500" onClick={() => signOut()}>
                        <LogOut className="h-4 w-4" /> Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="w-full">
                        <Button variant="outline" className="w-full justify-center">Log in</Button>
                      </Link>
                      <Link href="/auth/register" className="w-full">
                        <Button className="w-full justify-center">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
