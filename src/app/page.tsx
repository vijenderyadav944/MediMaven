"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Video, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-10 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Accepting new patients 24/7
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                Healthcare, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-500">Reimagined.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Connect with world-class specialists in seconds.
                Secure video consultations, AI-powered insights, and prescriptions delivered to your device.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/doctors">
                  <Button size="lg" className="rounded-full shadow-lg hover:shadow-primary/25 transition-all text-base px-8 h-12">
                    Find a Doctor <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-12">
                    How it works
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  <span>HD Crypto-Secure</span>
                </div>
              </div>
            </motion.div>

            {/* Visual Content (Abstract UI Mockup) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative lg:h-[600px] w-full flex items-center justify-center p-6"
            >
              {/* Decorative background blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
              <div className="absolute top-1/4 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>

              {/* Main Card */}
              <div className="relative z-10 w-full max-w-sm bg-card/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-6 overflow-hidden">
                {/* Doctor Video Placeholder */}
                <div className="relative aspect-[4/5] bg-muted rounded-2xl overflow-hidden mb-4">
                  <img
                    src="/images/doctor_call.png"
                    alt="Doctor Video Call"
                    className="w-full h-full object-cover"
                  />

                  {/* UI Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="text-xs font-medium">Dr. Emily Chen</div>
                    </div>
                    <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 transition-colors">
                      <Video className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex -space-x-3">
                    <img src="/images/avatar1.png" alt="Patient 1" className="h-10 w-10 rounded-full border-2 border-background object-cover" />
                    <img src="/images/avatar2.png" alt="Patient 2" className="h-10 w-10 rounded-full border-2 border-background object-cover" />
                    <div className="h-10 w-10 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-xs font-bold">+2k</div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">Top Rated</p>
                    <div className="flex text-yellow-400 text-xs">★★★★★</div>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-20 -left-4 md:-left-12 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-border/50 max-w-[200px]"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-lg font-bold">72 BPM</p>
                    <p className="text-[10px] text-green-500">Normal</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Teaser (Optional, keeping it simple for now) */}
    </div>
  )
}
