"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
  MonitorUp,
  MonitorOff,
  Users,
  Maximize2,
  Minimize2,
  Send,
  X,
  Copy,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface VideoRoomProps {
  url: string
  token?: string
  roomId?: string
  userName?: string
  appointmentId?: string
  onLeave: () => void
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
  isLocal: boolean
}

interface Participant {
  id: string
  name: string
  stream: MediaStream | null
  audioEnabled: boolean
  videoEnabled: boolean
}

export function VideoRoom({ url, token, roomId, userName = "You", appointmentId, onLeave }: VideoRoomProps) {
  const router = useRouter()

  // Media State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // UI State
  const [isConnecting, setIsConnecting] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")

  // Participants (for demo/simulation)
  const [participants, setParticipants] = useState<Participant[]>([])

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const callDurationRef = useRef<number>(0)
  const [callDuration, setCallDuration] = useState("00:00")

  const handleLeave = () => {
    // Clean up media
    localStream?.getTracks().forEach(track => track.stop())
    screenStream?.getTracks().forEach(track => track.stop())

    // Redirect to review if appointmentId exists
    if (appointmentId) {
      router.push(`/session/${appointmentId}/review`)
    } else {
      onLeave()
    }
  }

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Simulate connection delay
      await new Promise(r => setTimeout(r, 1500))
      setIsConnecting(false)
      setIsConnected(true)

      // Add system message
      setMessages([{
        id: "system-1",
        sender: "System",
        message: "You have joined the secure video session. Waiting for the other participant...",
        timestamp: new Date(),
        isLocal: false
      }])

    } catch (err: any) {
      console.error("Media access error:", err)
      if (err.name === "NotAllowedError") {
        setError("Camera and microphone access denied. Please allow access to join the call.")
      } else if (err.name === "NotFoundError") {
        setError("No camera or microphone found. Please connect a device and try again.")
      } else {
        setError("Failed to access media devices. Please check your camera and microphone.")
      }
      setIsConnecting(false)
    }
  }, [])

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

  // Initialize on mount
  useEffect(() => {
    initializeMedia()

    return () => {
      // Cleanup
      localStream?.getTracks().forEach(track => track.stop())
      screenStream?.getTracks().forEach(track => track.stop())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [localStream])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [localStream])

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach(track => track.stop())
      setScreenStream(null)
      setIsScreenSharing(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })

        setScreenStream(stream)
        setIsScreenSharing(true)

        // Handle stream ending (user clicks "Stop sharing")
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null)
          setIsScreenSharing(false)
        }

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Screen share error:", err)
      }
    }
  }, [isScreenSharing, screenStream])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Send chat message
  const sendMessage = useCallback(() => {
    if (newMessage.trim()) {
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: userName,
        message: newMessage.trim(),
        timestamp: new Date(),
        isLocal: true
      }
      setMessages(prev => [...prev, msg])
      setNewMessage("")
    }
  }, [newMessage, userName])

  // Copy meeting link
  const copyMeetingLink = useCallback(async () => {
    const link = window.location.href
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-150 w-full bg-neutral-900 text-white rounded-xl border border-white/10 p-8">
        <div className="bg-red-500/10 text-red-400 p-6 rounded-lg max-w-md text-center border border-red-500/20">
          <VideoOff className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={initializeMedia} variant="outline" className="border-red-500/30">
              Try Again
            </Button>
            <Button onClick={handleLeave} variant="secondary">
              Leave
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-150 w-full bg-neutral-900 text-white rounded-xl border border-white/10">
        <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2">Connecting to Secure Room</h3>
        <p className="text-neutral-400 mb-2">Setting up your video consultation...</p>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          Initializing camera and microphone
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-neutral-900 text-white rounded-xl border border-white/10 overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "h-175"
      )}
    >
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-linear-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-sm font-medium">{callDuration}</span>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-white border-0">
              <Users className="h-3 w-3 mr-1" />
              {participants.length + 1} in call
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
      <div className="absolute inset-0 flex">
        {/* Main Video Area */}
        <div className={cn("flex-1 relative", (showChat || showParticipants) && "mr-80")}>
          {/* Remote/Screen Share Video (Main) */}
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
            {isScreenSharing && screenStream ? (
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : participants.length > 0 && participants[0].stream ? (
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
          <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl bg-neutral-800">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
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
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <Badge variant="secondary" className="bg-black/60 text-white text-xs border-0">
                {userName}
              </Badge>
              {!isAudioEnabled && (
                <div className="bg-red-500 rounded-full p-1">
                  <MicOff className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panel (Chat/Participants) */}
        {(showChat || showParticipants) && (
          <div className="absolute top-0 right-0 w-80 h-full bg-neutral-800/95 backdrop-blur border-l border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-semibold">
                {showChat ? "In-call Messages" : "Participants"}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 h-8 w-8 p-0"
                onClick={() => { setShowChat(false); setShowParticipants(false) }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {showChat ? (
              <div className="flex flex-col h-[calc(100%-60px)]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          "text-sm",
                          msg.sender === "System" && "text-center text-neutral-400 italic"
                        )}
                      >
                        {msg.sender !== "System" && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "font-medium",
                              msg.isLocal ? "text-primary" : "text-white"
                            )}>
                              {msg.sender}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                        <p className={cn(
                          msg.sender === "System" ? "text-xs" : "text-neutral-300"
                        )}>
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 bg-neutral-700 border-0 text-white placeholder:text-neutral-400"
                    />
                    <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100%-60px)] p-4">
                <div className="space-y-3">
                  {/* Local user */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white">
                        {userName[0]?.toUpperCase() || "Y"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{userName} (You)</p>
                      <p className="text-xs text-neutral-400">Host</p>
                    </div>
                    <div className="flex gap-1">
                      {isAudioEnabled ? (
                        <Mic className="h-4 w-4 text-green-400" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-400" />
                      )}
                      {isVideoEnabled ? (
                        <VideoIcon className="h-4 w-4 text-green-400" />
                      ) : (
                        <VideoOff className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>

                  {/* Other participants would be listed here */}
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{p.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{p.name}</p>
                      </div>
                      <div className="flex gap-1">
                        {p.audioEnabled ? (
                          <Mic className="h-4 w-4 text-green-400" />
                        ) : (
                          <MicOff className="h-4 w-4 text-red-400" />
                        )}
                        {p.videoEnabled ? (
                          <VideoIcon className="h-4 w-4 text-green-400" />
                        ) : (
                          <VideoOff className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center gap-3">
          {/* Audio Toggle */}
          <Button
            size="lg"
            variant={isAudioEnabled ? "secondary" : "destructive"}
            className={cn(
              "rounded-full h-14 w-14",
              isAudioEnabled ? "bg-white/10 hover:bg-white/20" : ""
            )}
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            size="lg"
            variant={isVideoEnabled ? "secondary" : "destructive"}
            className={cn(
              "rounded-full h-14 w-14",
              isVideoEnabled ? "bg-white/10 hover:bg-white/20" : ""
            )}
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            size="lg"
            variant="secondary"
            className={cn(
              "rounded-full h-14 w-14",
              isScreenSharing ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 hover:bg-white/20"
            )}
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <MonitorUp className="h-5 w-5" />}
          </Button>

          {/* Chat */}
          <Button
            size="lg"
            variant="secondary"
            className={cn(
              "rounded-full h-14 w-14",
              showChat ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 hover:bg-white/20"
            )}
            onClick={() => { setShowChat(!showChat); setShowParticipants(false) }}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* Participants */}
          <Button
            size="lg"
            variant="secondary"
            className={cn(
              "rounded-full h-14 w-14",
              showParticipants ? "bg-primary text-white hover:bg-primary/90" : "bg-white/10 hover:bg-white/20"
            )}
            onClick={() => { setShowParticipants(!showParticipants); setShowChat(false) }}
          >
            <Users className="h-5 w-5" />
          </Button>

          {/* End Call */}
          <Button
            size="lg"
            variant="destructive"
            className="rounded-full h-14 w-14 ml-4"
            onClick={handleLeave}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
