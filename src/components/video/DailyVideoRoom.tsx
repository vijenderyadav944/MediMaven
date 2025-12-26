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
  Minimize2,
  Settings,
  Sparkles,
  Hand,
  RotateCcw,
  Camera,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { endSession } from "@/app/session/actions"

interface DailyVideoRoomProps {
  roomName: string
  userName: string
  userImage?: string
  appointmentId?: string
  isDoctor: boolean
  doctorName?: string
  patientName?: string
  onLeave: () => void
}

type VideoEffect = "none" | "blur" | "gradient"

export function DailyVideoRoom({ 
  roomName, 
  userName, 
  userImage,
  appointmentId, 
  isDoctor,
  doctorName,
  patientName,
  onLeave 
}: DailyVideoRoomProps) {
  const router = useRouter()
  const callRef = useRef<DailyCall | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewStreamRef = useRef<MediaStream | null>(null)

  // Pre-join state
  const [showPreJoin, setShowPreJoin] = useState(true)
  const [previewVideoEnabled, setPreviewVideoEnabled] = useState(true)
  const [previewAudioEnabled, setPreviewAudioEnabled] = useState(true)
  const [isPreviewLoading, setIsPreviewLoading] = useState(true)
  const [deviceError, setDeviceError] = useState<string | null>(null)

  // Call state
  const [isConnecting, setIsConnecting] = useState(false)
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
  const [handRaised, setHandRaised] = useState(false)
  const [videoEffect, setVideoEffect] = useState<VideoEffect>("none")
  const [isMobile, setIsMobile] = useState(false)
  
  const callDurationRef = useRef<number>(0)

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Setup preview camera
  useEffect(() => {
    if (showPreJoin) {
      setupPreview()
    }
    return () => {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [showPreJoin])

  const setupPreview = async () => {
    try {
      setIsPreviewLoading(true)
      setDeviceError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      previewStreamRef.current = stream
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream
      }
      
      setIsPreviewLoading(false)
    } catch (err: any) {
      console.error("Failed to get media devices:", err)
      setDeviceError("Unable to access camera or microphone. Please check permissions.")
      setIsPreviewLoading(false)
    }
  }

  const togglePreviewVideo = () => {
    if (previewStreamRef.current) {
      const videoTrack = previewStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !previewVideoEnabled
        setPreviewVideoEnabled(!previewVideoEnabled)
      }
    }
  }

  const togglePreviewAudio = () => {
    if (previewStreamRef.current) {
      const audioTrack = previewStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !previewAudioEnabled
        setPreviewAudioEnabled(!previewAudioEnabled)
      }
    }
  }

  const joinMeeting = async () => {
    // Stop preview stream
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Set initial states based on preview
    setIsVideoEnabled(previewVideoEnabled)
    setIsAudioEnabled(previewAudioEnabled)
    setShowPreJoin(false)
    setIsConnecting(true)
    
    await initCall()
  }

  // Initialize Daily call
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
        videoSource: previewVideoEnabled,
        audioSource: previewAudioEnabled,
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
  const handleJoined = useCallback(() => {
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
    
    // Clear remote video and audio if no participants
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null
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
    // Handle remote video
    if (remoteVideoRef.current && participant.tracks?.video?.persistentTrack) {
      const videoStream = new MediaStream([participant.tracks.video.persistentTrack])
      remoteVideoRef.current.srcObject = videoStream
    }
    
    // Handle remote audio separately - this is critical for audio to work
    if (remoteAudioRef.current && participant.tracks?.audio?.persistentTrack) {
      const audioStream = new MediaStream([participant.tracks.audio.persistentTrack])
      remoteAudioRef.current.srcObject = audioStream
      // Ensure audio plays
      remoteAudioRef.current.play().catch(err => {
        console.log("Audio autoplay blocked, user interaction needed:", err)
      })
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
      setShowEndDialog(true)
    } else {
      leaveCall(false)
    }
  }

  const leaveCall = async (markAsCompleted: boolean) => {
    if (callRef.current) {
      await callRef.current.leave()
      callRef.current.destroy()
    }

    if (markAsCompleted && appointmentId) {
      await endSession(appointmentId)
      router.push(`/session/${appointmentId}/review`)
    } else if (!markAsCompleted && !isDoctor) {
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
  const otherPersonName = isDoctor ? patientName : doctorName

  // Pre-join Lobby
  if (showPreJoin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ready to join?</h1>
            <p className="text-slate-400">
              {isDoctor ? `Consultation with ${patientName || "Patient"}` : `Consultation with ${doctorName || "Doctor"}`}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Video Preview */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-slate-900">
                  {isPreviewLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : deviceError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <VideoOff className="h-12 w-12 text-slate-500 mb-3" />
                      <p className="text-slate-400 text-sm">{deviceError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={setupPreview}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : previewVideoEnabled ? (
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={cn(
                        "w-full h-full object-cover",
                        videoEffect === "blur" && "blur-sm",
                        videoEffect === "gradient" && "saturate-150 contrast-110"
                      )}
                      style={{ transform: "scaleX(-1)" }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={userImage} />
                        <AvatarFallback className="bg-primary text-white text-3xl">
                          {userName[0]?.toUpperCase() || "Y"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  {/* Preview Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <Button
                      size="lg"
                      variant={previewAudioEnabled ? "secondary" : "destructive"}
                      className="rounded-full h-12 w-12"
                      onClick={togglePreviewAudio}
                    >
                      {previewAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    <Button
                      size="lg"
                      variant={previewVideoEnabled ? "secondary" : "destructive"}
                      className="rounded-full h-12 w-12"
                      onClick={togglePreviewVideo}
                    >
                      {previewVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Pre-join Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="camera" className="text-slate-300 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Camera
                      </Label>
                      <Switch
                        id="camera"
                        checked={previewVideoEnabled}
                        onCheckedChange={togglePreviewVideo}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="microphone" className="text-slate-300 flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Microphone
                      </Label>
                      <Switch
                        id="microphone"
                        checked={previewAudioEnabled}
                        onCheckedChange={togglePreviewAudio}
                      />
                    </div>
                  </div>
                </div>

                {/* Video Effects */}
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Video Effects
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={videoEffect === "none" ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setVideoEffect("none")}
                    >
                      None
                    </Button>
                    <Button
                      variant={videoEffect === "blur" ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setVideoEffect("blur")}
                    >
                      Blur BG
                    </Button>
                    <Button
                      variant={videoEffect === "gradient" ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => setVideoEffect("gradient")}
                    >
                      Vivid
                    </Button>
                  </div>
                </div>

                {/* Join Button */}
                <Button 
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={joinMeeting}
                  disabled={isPreviewLoading}
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Join Consultation
                </Button>

                <p className="text-xs text-center text-slate-500">
                  By joining, you agree to our privacy policy for telemedicine
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-8">
        <div className="bg-red-500/10 text-red-400 p-8 rounded-2xl max-w-md text-center border border-red-500/20 backdrop-blur-sm">
          <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <VideoOff className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Connection Error</h3>
          <p className="text-sm mb-4 text-red-300">{error}</p>
          <p className="text-xs text-slate-400 mb-6">
            Make sure you have a stable internet connection and camera/microphone permissions enabled.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-600">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.push("/dashboard")} variant="secondary">
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-30">
            <div className="h-24 w-24 rounded-full bg-primary" />
          </div>
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        </div>
        <h3 className="text-2xl font-bold mt-8 mb-2">Connecting...</h3>
        <p className="text-slate-400 mb-4">Setting up your secure consultation room</p>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-800/50 px-4 py-2 rounded-full">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <span>Room: {roomName}</span>
        </div>
      </div>
    )
  }

  // Main Video Room UI
  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden",
          isFullscreen ? "fixed inset-0 z-50" : "min-h-[600px] rounded-2xl",
          isMobile && "min-h-screen"
        )}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 via-black/40 to-transparent p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Recording indicator */}
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1.5">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-mono text-sm font-medium">{callDuration}</span>
              </div>
              
              {/* Participants badge */}
              <Badge variant="secondary" className="bg-white/10 text-white border-0 hidden md:flex">
                <Users className="h-3 w-3 mr-1" />
                {participants.size + 1}
              </Badge>

              {/* Connected status */}
              {isConnected && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hidden md:flex">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" />
                  Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Copy link button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 hidden md:flex"
                onClick={copyMeetingLink}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1">{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
              
              {/* Fullscreen button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 h-9 w-9 p-0"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>

              {/* Settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-9 w-9 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Effects</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setVideoEffect("none")}>
                    {videoEffect === "none" && <Check className="h-4 w-4 mr-2" />}
                    No Effect
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVideoEffect("blur")}>
                    {videoEffect === "blur" && <Check className="h-4 w-4 mr-2" />}
                    Blur Background
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVideoEffect("gradient")}>
                    {videoEffect === "gradient" && <Check className="h-4 w-4 mr-2" />}
                    Vivid Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={copyMeetingLink} className="md:hidden">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          isMobile ? "pt-16 pb-28" : "pt-20 pb-24"
        )}>
          {/* Remote Audio - Hidden but essential for audio playback */}
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
          
          {/* Remote Video (Main) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {remoteParticipant ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted  // Video element muted, audio comes from separate audio element
                  className={cn(
                    "w-full h-full object-cover",
                    videoEffect === "blur" && "backdrop-blur-sm"
                  )}
                />
                {/* Remote participant name overlay */}
                <div className="absolute bottom-28 left-4 md:bottom-24 md:left-6">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">{otherPersonName || "Participant"}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center px-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary" />
                  </div>
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border-4 border-slate-600">
                    <Users className="h-16 w-16 md:h-20 md:w-20 text-slate-500" />
                  </div>
                </div>
                <p className="text-slate-300 text-lg md:text-xl mt-6 font-medium">
                  Waiting for {otherPersonName || "participant"}...
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  They will appear here once they join
                </p>
              </div>
            )}
          </div>

          {/* Local Video (PiP) */}
          <div className={cn(
            "absolute rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800 z-10 transition-all duration-300",
            isMobile 
              ? "bottom-32 right-3 w-28 h-36" 
              : "bottom-28 right-6 w-44 h-32 hover:scale-105"
          )}>
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  videoEffect === "blur" && "blur-sm",
                  videoEffect === "gradient" && "saturate-150 contrast-110"
                )}
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                <Avatar className={cn(isMobile ? "h-12 w-12" : "h-14 w-14")}>
                  <AvatarImage src={userImage} />
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {userName[0]?.toUpperCase() || "Y"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-center">
              <Badge variant="secondary" className="bg-black/60 text-white text-[10px] border-0 px-1.5 py-0.5">
                You
              </Badge>
              {!isAudioEnabled && (
                <div className="bg-red-500 rounded-full p-1">
                  <MicOff className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 md:p-6">
          <div className={cn(
            "flex items-center justify-center gap-2 md:gap-3",
            isMobile && "flex-wrap"
          )}>
            {/* Mic */}
            <Button
              size="lg"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className={cn(
                "rounded-full transition-all duration-200",
                isMobile ? "h-12 w-12" : "h-14 w-14 hover:scale-105"
              )}
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5 md:h-6 md:w-6" /> : <MicOff className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>

            {/* Video */}
            <Button
              size="lg"
              variant={isVideoEnabled ? "secondary" : "destructive"}
              className={cn(
                "rounded-full transition-all duration-200",
                isMobile ? "h-12 w-12" : "h-14 w-14 hover:scale-105"
              )}
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <VideoIcon className="h-5 w-5 md:h-6 md:w-6" /> : <VideoOff className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>

            {/* Screen Share - Hide on mobile */}
            {!isMobile && (
              <Button
                size="lg"
                variant={isScreenSharing ? "default" : "secondary"}
                className="rounded-full h-14 w-14 hover:scale-105 transition-all duration-200"
                onClick={toggleScreenShare}
              >
                {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <MonitorUp className="h-6 w-6" />}
              </Button>
            )}

            {/* Hand Raise */}
            <Button
              size="lg"
              variant={handRaised ? "default" : "secondary"}
              className={cn(
                "rounded-full transition-all duration-200",
                isMobile ? "h-12 w-12" : "h-14 w-14 hover:scale-105",
                handRaised && "animate-bounce"
              )}
              onClick={() => setHandRaised(!handRaised)}
            >
              <Hand className={cn("h-5 w-5 md:h-6 md:w-6", handRaised && "text-yellow-300")} />
            </Button>

            {/* End Call */}
            <Button
              size="lg"
              variant="destructive"
              className={cn(
                "rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200",
                isMobile ? "h-12 w-14 px-4" : "h-14 px-6 hover:scale-105"
              )}
              onClick={handleLeaveClick}
            >
              <PhoneOff className="h-5 w-5 md:h-6 md:w-6" />
              {!isMobile && <span className="ml-2 font-medium">Leave</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* End Meeting Dialog - Only for patients */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">End Consultation?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              If the consultation is complete, you&apos;ll be taken to rate your experience and view the AI-generated summary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setShowEndDialog(false)} className="w-full sm:w-auto">
              Stay in Call
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleJustLeave} className="w-full sm:w-auto">
              Leave Temporarily
            </Button>
            <AlertDialogAction onClick={handleEndMeeting} className="bg-primary w-full sm:w-auto">
              End &amp; Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
