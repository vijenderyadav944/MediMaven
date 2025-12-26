"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import DailyIframe, { DailyCall, DailyParticipant, DailyEventObjectParticipant, DailyEventObjectParticipantLeft } from "@daily-co/daily-js"
import {
  Loader2,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Users,
  Copy,
  Check,
  MonitorUp,
  MonitorOff,
  Maximize2,
  Minimize2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"
import { endSession } from "@/app/session/actions"

interface DailyVideoRoomProps {
  roomName: string
  userName: string
  appointmentId?: string
  isDoctor: boolean
  onLeave: () => void
}

export function DailyVideoRoom({ 
  roomName, 
  userName, 
  appointmentId, 
  isDoctor,
  onLeave 
}: DailyVideoRoomProps) {
  const router = useRouter()
  const callRef = useRef<DailyCall | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State
  const [isConnecting, setIsConnecting] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [participants, setParticipants] = useState<Map<string, DailyParticipant>>(new Map())
  const [callDuration, setCallDuration] = useState("00:00")
  const [showEndDialog, setShowEndDialog] = useState(false)
  
  const callDurationRef = useRef<number>(0)

  // Initialize Daily call
  useEffect(() => {
    const initCall = async () => {
      try {
        // First, create/get the room via API
        const roomResponse = await fetch("/api/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName }),
        })
        
        if (!roomResponse.ok) {
          throw new Error("Failed to create video room")
        }
        
        const roomData = await roomResponse.json()
        const roomUrl = roomData.url
        
        // Create Daily call instance
        const call = DailyIframe.createCallObject({
          videoSource: true,
          audioSource: true,
        })
        callRef.current = call

        // Set up event listeners
        call.on("joined-meeting", handleJoined)
        call.on("participant-joined", handleParticipantJoined)
        call.on("participant-updated", handleParticipantUpdated)
        call.on("participant-left", handleParticipantLeft)
        call.on("error", handleError)
        call.on("left-meeting", handleLeftMeeting)
        
        await call.join({
          url: roomUrl,
          userName: userName,
        })

      } catch (err: any) {
        console.error("Failed to initialize Daily call:", err)
        setError(err.message || "Failed to connect to video room")
        setIsConnecting(false)
      }
    }

    initCall()

    return () => {
      if (callRef.current) {
        callRef.current.destroy()
      }
    }
  }, [roomName, userName])

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isConnected) {
      interval = setInterval(() => {
        callDurationRef.current += 1
        const minutes = Math.floor(callDurationRef.current / 60)
        const seconds = callDurationRef.current % 60
        setCallDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isConnected])

  // Event handlers
  const handleJoined = useCallback((event: any) => {
    setIsConnecting(false)
    setIsConnected(true)
    
    // Update local video
    if (callRef.current && localVideoRef.current) {
      const localParticipant = callRef.current.participants().local
      if (localParticipant?.tracks?.video?.persistentTrack) {
        const stream = new MediaStream([localParticipant.tracks.video.persistentTrack])
        localVideoRef.current.srcObject = stream
      }
    }
  }, [])

  const handleParticipantJoined = useCallback((event: DailyEventObjectParticipant) => {
    if (!event.participant.local) {
      setParticipants(prev => {
        const updated = new Map(prev)
        updated.set(event.participant.session_id, event.participant)
        return updated
      })
      updateRemoteVideo(event.participant)
    }
  }, [])

  const handleParticipantUpdated = useCallback((event: DailyEventObjectParticipant) => {
    if (!event.participant.local) {
      setParticipants(prev => {
        const updated = new Map(prev)
        updated.set(event.participant.session_id, event.participant)
        return updated
      })
      updateRemoteVideo(event.participant)
    } else {
      // Update local video
      if (callRef.current && localVideoRef.current) {
        const localParticipant = callRef.current.participants().local
        if (localParticipant?.tracks?.video?.persistentTrack) {
          const stream = new MediaStream([localParticipant.tracks.video.persistentTrack])
          localVideoRef.current.srcObject = stream
        }
      }
    }
  }, [])

  const handleParticipantLeft = useCallback((event: DailyEventObjectParticipantLeft) => {
    setParticipants(prev => {
      const updated = new Map(prev)
      updated.delete(event.participant.session_id)
      return updated
    })
    
    // Clear remote video if no participants
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [])

  const handleError = useCallback((event: any) => {
    console.error("Daily error:", event)
    setError(event.errorMsg || "Connection error occurred")
  }, [])

  const handleLeftMeeting = useCallback(() => {
    setIsConnected(false)
  }, [])

  const updateRemoteVideo = (participant: DailyParticipant) => {
    if (remoteVideoRef.current && participant.tracks?.video?.persistentTrack) {
      const stream = new MediaStream([participant.tracks.video.persistentTrack])
      remoteVideoRef.current.srcObject = stream
      
      // Also add audio
      if (participant.tracks?.audio?.persistentTrack) {
        stream.addTrack(participant.tracks.audio.persistentTrack)
      }
    }
  }

  // Controls
  const toggleVideo = useCallback(() => {
    if (callRef.current) {
      callRef.current.setLocalVideo(!isVideoEnabled)
      setIsVideoEnabled(!isVideoEnabled)
    }
  }, [isVideoEnabled])

  const toggleAudio = useCallback(() => {
    if (callRef.current) {
      callRef.current.setLocalAudio(!isAudioEnabled)
      setIsAudioEnabled(!isAudioEnabled)
    }
  }, [isAudioEnabled])

  const toggleScreenShare = useCallback(async () => {
    if (callRef.current) {
      if (isScreenSharing) {
        await callRef.current.stopScreenShare()
        setIsScreenSharing(false)
      } else {
        await callRef.current.startScreenShare()
        setIsScreenSharing(true)
      }
    }
  }, [isScreenSharing])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const copyMeetingLink = useCallback(async () => {
    const link = window.location.href
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Leave call - show dialog for patient
  const handleLeaveClick = () => {
    if (!isDoctor) {
      // Patient - ask if meeting is over
      setShowEndDialog(true)
    } else {
      // Doctor - just leave without ending
      leaveCall(false)
    }
  }

  const leaveCall = async (markAsCompleted: boolean) => {
    if (callRef.current) {
      await callRef.current.leave()
      callRef.current.destroy()
    }

    if (markAsCompleted && appointmentId) {
      // Mark session as completed and go to review
      await endSession(appointmentId)
      router.push(`/session/${appointmentId}/review`)
    } else if (!markAsCompleted && !isDoctor) {
      // Patient leaving without ending - just go to dashboard
      router.push("/patient/dashboard")
    } else {
      onLeave()
    }
  }

  const handleEndMeeting = async () => {
    setShowEndDialog(false)
    await leaveCall(true)
  }

  const handleJustLeave = async () => {
    setShowEndDialog(false)
    await leaveCall(false)
  }

  // Get remote participant
  const remoteParticipant = Array.from(participants.values())[0]

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-neutral-900 text-white rounded-xl border border-white/10 p-8">
        <div className="bg-red-500/10 text-red-400 p-6 rounded-lg max-w-md text-center border border-red-500/20">
          <VideoOff className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs text-neutral-400 mb-4">
            Make sure the Daily.co room exists and you have permission to join.
          </p>
          <Button onClick={() => router.push("/dashboard")} variant="secondary">
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Loading state
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-neutral-900 text-white rounded-xl border border-white/10">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2">Connecting to Secure Room</h3>
        <p className="text-neutral-400 mb-2">Setting up your video consultation...</p>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Joining room: {roomName}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-neutral-900 text-white rounded-xl border border-white/10 overflow-hidden",
          isFullscreen ? "fixed inset-0 z-50 rounded-none" : "min-h-[600px]"
        )}
      >
        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono text-sm font-medium">{callDuration}</span>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-0">
                <Users className="h-3 w-3 mr-1" />
                {participants.size + 1} in call
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={copyMeetingLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1 hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Remote Video (Main) */}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
            {remoteParticipant ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-neutral-700 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-16 w-16 text-neutral-500" />
                </div>
                <p className="text-neutral-400 text-lg">Waiting for others to join...</p>
                <p className="text-neutral-500 text-sm mt-2">Share the meeting link to invite participants</p>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl bg-neutral-800 z-10">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {userName[0]?.toUpperCase() || "Y"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-black/60 text-white text-xs border-0">
                You {!isAudioEnabled && "🔇"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center gap-3">
            <Button
              size="lg"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className="rounded-full h-14 w-14"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant={isVideoEnabled ? "secondary" : "destructive"}
              className="rounded-full h-14 w-14"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <VideoIcon className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant={isScreenSharing ? "default" : "secondary"}
              className="rounded-full h-14 w-14"
              onClick={toggleScreenShare}
            >
              {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <MonitorUp className="h-6 w-6" />}
            </Button>

            <Button
              size="lg"
              variant="destructive"
              className="rounded-full h-14 w-14"
              onClick={handleLeaveClick}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* End Meeting Dialog - Only for patients */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Is the consultation over?</AlertDialogTitle>
            <AlertDialogDescription>
              If the consultation is complete, you'll be taken to the review page to rate your experience and view the summary.
              If you just want to leave temporarily, you can rejoin later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowEndDialog(false)}>
              Stay in Call
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleJustLeave}>
              Leave (Rejoin Later)
            </Button>
            <AlertDialogAction onClick={handleEndMeeting} className="bg-primary">
              Yes, End Consultation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
