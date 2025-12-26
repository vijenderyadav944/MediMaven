"use client"

import * as React from "react"
import { useDeepgramTranscription } from "@/hooks/useDeepgramTranscription"
import { saveTranscription } from "@/app/actions/ai-summary"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  MicOff, 
  FileText, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

interface TranscriptionPanelProps {
  appointmentId: string
  isOpen: boolean
  onClose: () => void
}

export function TranscriptionPanel({ appointmentId, isOpen, onClose }: TranscriptionPanelProps) {
  const [savedSegments, setSavedSegments] = React.useState<string[]>([])
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("idle")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const {
    isTranscribing,
    fullTranscript,
    interimTranscript,
    error,
    startTranscription,
    stopTranscription
  } = useDeepgramTranscription({
    onTranscript: async (result) => {
      if (result.isFinal && result.transcript) {
        // Auto-save transcription segments periodically
        setSavedSegments(prev => [...prev, result.transcript])
      }
    }
  })

  // Auto-save transcription every 30 seconds
  React.useEffect(() => {
    if (!isTranscribing || !fullTranscript) return

    const interval = setInterval(async () => {
      if (fullTranscript.length > 100) {
        setSaveStatus("saving")
        const result = await saveTranscription(appointmentId, fullTranscript)
        setSaveStatus(result.success ? "saved" : "error")
        
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isTranscribing, fullTranscript, appointmentId])

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [fullTranscript, interimTranscript])

  // Save on stop
  const handleStopTranscription = async () => {
    stopTranscription()
    
    if (fullTranscript) {
      setSaveStatus("saving")
      const result = await saveTranscription(appointmentId, fullTranscript)
      setSaveStatus(result.success ? "saved" : "error")
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-80 h-full border-l border-neutral-700 bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-white">Transcription</h3>
          {isTranscribing && (
            <Badge variant="outline" className="text-red-400 border-red-500 animate-pulse">
              <span className="h-2 w-2 bg-red-500 rounded-full mr-1" />
              Live
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-neutral-400 hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
              <span className="text-xs text-blue-400">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400">Saved</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="h-3 w-3 text-red-400" />
              <span className="text-xs text-red-400">Save failed</span>
            </>
          )}
        </div>
        
        <Button
          variant={isTranscribing ? "destructive" : "default"}
          size="sm"
          onClick={isTranscribing ? handleStopTranscription : startTranscription}
          className="gap-1"
        >
          {isTranscribing ? (
            <>
              <MicOff className="h-3 w-3" />
              Stop
            </>
          ) : (
            <>
              <Mic className="h-3 w-3" />
              Start
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-900/30 border-b border-red-900/50">
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        </div>
      )}

      {/* Transcription Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {!fullTranscript && !interimTranscript && !isTranscribing ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">
              Click &quot;Start&quot; to begin transcribing the conversation.
            </p>
            <p className="text-neutral-600 text-xs mt-2">
              Transcription will be saved and used to generate a summary.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Final transcript */}
            {fullTranscript && (
              <p className="text-neutral-200 text-sm leading-relaxed">
                {fullTranscript}
              </p>
            )}
            
            {/* Interim transcript (live typing) */}
            {interimTranscript && (
              <p className="text-neutral-400 text-sm italic">
                {interimTranscript}
              </p>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-700 bg-neutral-800/50">
        <p className="text-xs text-neutral-500 text-center">
          Powered by Deepgram • Auto-saves every 30s
        </p>
      </div>
    </div>
  )
}
