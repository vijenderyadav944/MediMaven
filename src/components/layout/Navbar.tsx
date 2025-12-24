"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Stethoscope } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle" // I need to create this too, or just inline it? I'll assume I'll create it or omit for now. I'll omit ThemeToggle for this specific file until I create it.

// Mock Links
const navigation = [
  { name: "Features", href: "/features" },
  { name: "Doctors", href: "/doctors" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
]

export function Navbar() {
  const pathname = usePathname()
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
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
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
                  <Link href="/auth/login" className="w-full">
                    <Button variant="outline" className="w-full justify-center">Log in</Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button className="w-full justify-center">Get Started</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
