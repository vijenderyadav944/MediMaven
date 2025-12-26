"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { getSessionDetails } from "@/app/session/actions"
import { DailyVideoRoom } from "@/components/video/DailyVideoRoom"
import { ChatPanel } from "@/components/video/ChatPanel"
import { PatientHealthCard } from "@/components/video/PatientHealthCard"
import { TranscriptionPanel } from "@/components/video/TranscriptionPanel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Shield, User, MessageCircle, FileHeart, FileText, CheckCircle2 } from "lucide-react"

export default function SessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string
  
  const [sessionData, setSessionData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [isHealthPanelOpen, setIsHealthPanelOpen] = React.useState(false)
  const [isTranscriptionOpen, setIsTranscriptionOpen] = React.useState(false)

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

  // Session already completed
  if (sessionData?.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-black flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-neutral-700 bg-neutral-900/80 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-white">Session Completed</CardTitle>
            <CardDescription className="text-neutral-400">
              This consultation has already been completed.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
              {sessionData?.doctorName && (
                <div className="flex items-center gap-3 text-neutral-300">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {sessionData.isDoctor ? `Patient: ${sessionData.patientName}` : `Doctor: ${sessionData.doctorName}`}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {sessionData?.isPatient && (
                <Button 
                  size="lg" 
                  className="w-full h-12"
                  onClick={() => router.push(`/session/${sessionData.appointmentId}/review`)}
                >
                  View Review & Summary
                </Button>
              )}
              <Button 
                variant="ghost" 
                className="text-neutral-400 hover:text-white"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Video Room - with pre-join lobby built into the component
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
      
      <div className="flex-1 flex flex-col">
        {/* Top bar with tools */}
        <div className="flex items-center justify-between p-4 bg-black/90 border-b border-neutral-800">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80" 
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            {/* Patient Health button - only for doctors */}
            {sessionData?.isDoctor && (
              <Button
                variant="outline"
                size="sm"
                className={`border-neutral-600 text-white hover:bg-neutral-700 ${isHealthPanelOpen ? 'bg-primary/20 border-primary' : 'bg-neutral-800'}`}
                onClick={() => setIsHealthPanelOpen(!isHealthPanelOpen)}
              >
                <FileHeart className="h-4 w-4 mr-2" />
                Patient Info
              </Button>
            )}
            {/* Transcription button */}
            <Button
              variant="outline"
              size="sm"
              className={`border-neutral-600 text-white hover:bg-neutral-700 ${isTranscriptionOpen ? 'bg-primary/20 border-primary' : 'bg-neutral-800'}`}
              onClick={() => setIsTranscriptionOpen(!isTranscriptionOpen)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Transcribe
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`border-neutral-600 text-white hover:bg-neutral-700 ${isChatOpen ? 'bg-primary/20 border-primary' : 'bg-neutral-800'}`}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 hidden md:flex">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </div>

        {/* Video Room */}
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl">
            <DailyVideoRoom
              roomName={sessionData?.roomName || sessionId}
              userName={sessionData?.userName || "User"}
              userImage={sessionData?.userImage}
              appointmentId={sessionData?.appointmentId}
              isDoctor={sessionData?.isDoctor || false}
              doctorName={sessionData?.doctorName}
              patientName={sessionData?.patientName}
              onLeave={handleLeave}
            />
          </div>
        </div>
      </div>
      
      {/* Chat Panel */}
      <ChatPanel
        appointmentId={sessionData?.appointmentId || sessionId}
        currentUserId={sessionData?.userId || ""}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      
      {/* Transcription Panel */}
      <TranscriptionPanel
        appointmentId={sessionData?.appointmentId || sessionId}
        isOpen={isTranscriptionOpen}
        onClose={() => setIsTranscriptionOpen(false)}
      />
    </div>
  )
}
