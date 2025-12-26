"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getSessionDetails } from "@/app/session/actions"
import { VideoRoom } from "@/components/video/VideoRoom"
import { ChatPanel } from "@/components/video/ChatPanel"
import { PatientHealthCard } from "@/components/video/PatientHealthCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Shield, Video, Clock, User, MessageCircle, FileHeart } from "lucide-react"

export default function SessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  
  const [sessionData, setSessionData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasJoined, setHasJoined] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [isHealthPanelOpen, setIsHealthPanelOpen] = React.useState(false)

  React.useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await getSessionDetails(sessionId)
        if (data.error) {
          setError(data.error)
        } else {
          setSessionData(data)
        }
      } catch (err) {
        setError("Failed to load session details")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSession()
  }, [sessionId])

  const handleLeave = React.useCallback(() => {
    router.push("/dashboard")
  }, [router])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-white">Loading session details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-black p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Session Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Pre-call lobby
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-neutral-700 bg-neutral-900/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-white">Ready to Join?</CardTitle>
            <CardDescription className="text-neutral-400">
              Your secure video consultation is ready
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Session Info */}
            <div className="space-y-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
              {sessionData?.doctorName && (
                <div className="flex items-center gap-3 text-neutral-300">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {sessionData.isDoctor ? `Patient: ${sessionData.patientName}` : `Doctor: ${sessionData.doctorName}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-neutral-300">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">Session Duration: {sessionData?.duration || 30} minutes</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm">End-to-end encrypted</span>
              </div>
            </div>
            
            {/* Privacy Notice */}
            <div className="text-xs text-neutral-500 text-center space-y-1">
              <p>By joining, you agree to our telehealth terms of service.</p>
              <p>This session may be recorded for medical records.</p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className="w-full h-12 text-lg"
                onClick={() => setHasJoined(true)}
              >
                <Video className="mr-2 h-5 w-5" />
                Join Session
              </Button>
              <Button 
                variant="ghost" 
                className="text-neutral-400 hover:text-white"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Video Room
  return (
    <div className="min-h-screen bg-black flex">
      {/* Patient Health Panel - Only visible for doctors */}
      {sessionData?.isDoctor && isHealthPanelOpen && (
        <div className="w-80 h-screen p-4 border-r border-neutral-700 overflow-y-auto">
          <PatientHealthCard
            patientName={sessionData?.patientName || "Patient"}
            healthProfile={sessionData?.patientHealthProfile}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="mb-4 flex items-center justify-between text-white">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white/80" 
              onClick={() => setHasJoined(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lobby
            </Button>
            <div className="flex items-center gap-3">
              {/* Patient Health button - only for doctors */}
              {sessionData?.isDoctor && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700"
                  onClick={() => setIsHealthPanelOpen(!isHealthPanelOpen)}
                >
                  <FileHeart className="h-4 w-4 mr-2" />
                  Patient Info
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-neutral-600 bg-neutral-800 text-white hover:bg-neutral-700"
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Secure Connection
              </Badge>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-mono text-sm">LIVE</span>
              </div>
            </div>
          </div>

          <VideoRoom
            url={sessionData?.roomUrl || `room-${sessionId}`}
            roomId={sessionId}
            userName={sessionData?.userName || "User"}
            appointmentId={sessionData?.appointmentId}
            onLeave={handleLeave}
          />
        </div>
      </div>
      
      {/* Chat Panel */}
      <ChatPanel
        appointmentId={sessionData?.appointmentId || sessionId}
        currentUserId={sessionData?.userId || ""}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  )
}
