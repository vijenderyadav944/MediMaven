"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Loader2, 
  Clock, 
  Shield, 
  X,
  CheckCircle2,
  Stethoscope,
  User
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  getInstantMeetingStatus,
  cancelInstantMeetingRequest
} from "@/app/actions/instant-meeting"

export default function WaitingRoomPage() {
  const router = useRouter()
  const params = useParams()
  const instantMeetingId = params.id as string
  
  const [status, setStatus] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [cancelling, setCancelling] = React.useState(false)
  const [waitTime, setWaitTime] = React.useState(0)

  // Poll for status updates
  React.useEffect(() => {
    let pollInterval: NodeJS.Timeout
    let waitInterval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const result = await getInstantMeetingStatus(instantMeetingId)
        
        if (result.error) {
          setError(result.error)
          return
        }

        setStatus(result)

        // If matched or in-progress, redirect to the meeting
        if (result.status === "matched" || result.status === "in-progress") {
          clearInterval(pollInterval)
          clearInterval(waitInterval)
          // Extract room ID from meeting link
          const meetingLink = result.meetingLink || `/session/instant/${instantMeetingId}`
          router.push(meetingLink)
        }

        // If completed or cancelled, show appropriate message
        if (result.status === "completed") {
          router.push(`/session/instant/${instantMeetingId}/review`)
        }

        if (result.status === "cancelled") {
          setError("This request has been cancelled")
        }
      } catch (err) {
        console.error("Error checking status:", err)
      }
    }

    // Initial check
    checkStatus()

    // Poll every 3 seconds
    pollInterval = setInterval(checkStatus, 3000)

    // Update wait time every second
    waitInterval = setInterval(() => {
      setWaitTime(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(waitInterval)
    }
  }, [instantMeetingId, router])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const result = await cancelInstantMeetingRequest(instantMeetingId)
      
      if (result.error) {
        setError(result.error)
        setShowCancelDialog(false)
        setCancelling(false)
        return
      }

      router.push("/patient/dashboard")
    } catch (err) {
      setError("Failed to cancel request")
      setCancelling(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Request Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push("/patient/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If doctor is found
  if (status?.status === "matched") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </motion.div>
            <CardTitle className="text-2xl text-green-600">Doctor Found!</CardTitle>
            <CardDescription>Connecting you now...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={status.doctorImage} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {status.doctorName?.[0] || "D"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-lg">{status.doctorName}</p>
              <p className="text-muted-foreground">{status.doctorSpecialty}</p>
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Waiting state
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-primary/5 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center pb-2">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mx-auto mb-6 relative"
          >
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-32 h-32 rounded-full border-4 border-primary/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-32 h-32 rounded-full border-4 border-primary/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </div>
            <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-12 w-12 text-primary" />
            </div>
          </motion.div>
          
          <CardTitle className="text-2xl">Finding Your Doctor</CardTitle>
          <CardDescription className="text-base mt-2">
            Please wait while we connect you with an available specialist...
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Wait Time */}
          <div className="flex items-center justify-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Waiting time:</span>
            <span className="font-mono font-semibold text-primary">{formatTime(waitTime)}</span>
          </div>

          {/* Status Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm">Looking for available doctors...</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Your session will be secure and private</span>
            </div>
          </div>

          {/* Loading animation */}
          <div className="flex justify-center">
            <motion.div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Cancel Button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel Request
          </Button>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this instant meeting request? 
              Your payment will be refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Waiting</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
