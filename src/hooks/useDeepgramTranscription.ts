"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface TranscriptionResult {
  transcript: string
  isFinal: boolean
  confidence: number
}

interface UseDeepgramTranscriptionOptions {
  onTranscript?: (result: TranscriptionResult) => void
  onError?: (error: string) => void
  language?: string
}

export function useDeepgramTranscription(options: UseDeepgramTranscriptionOptions = {}) {
  const { onTranscript, onError, language = "en-IN" } = options
  
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [fullTranscript, setFullTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startTranscription = useCallback(async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
      
      if (!apiKey) {
        const errorMsg = "Deepgram API key not configured"
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream

      // Connect to Deepgram WebSocket
      const wsUrl = `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&language=${language}&punctuate=true&interim_results=true&smart_format=true&model=nova-2`
      
      const socket = new WebSocket(wsUrl, ["token", apiKey])
      socketRef.current = socket

      socket.onopen = () => {
        console.log("Deepgram WebSocket connected")
        setIsTranscribing(true)
        setError(null)

        // Create audio context for resampling
        const audioContext = new AudioContext({ sampleRate: 16000 })
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(4096, 1, 1)

        source.connect(processor)
        processor.connect(audioContext.destination)

        processor.onaudioprocess = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0)
            const pcmData = new Int16Array(inputData.length)
            
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]))
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
            }
            
            socket.send(pcmData.buffer)
          }
        }
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.channel?.alternatives?.[0]) {
            const alternative = data.channel.alternatives[0]
            const transcript = alternative.transcript || ""
            const isFinal = data.is_final || false
            const confidence = alternative.confidence || 0

            if (transcript) {
              const result: TranscriptionResult = {
                transcript,
                isFinal,
                confidence
              }

              if (isFinal) {
                setFullTranscript(prev => prev + (prev ? " " : "") + transcript)
                setInterimTranscript("")
              } else {
                setInterimTranscript(transcript)
              }

              onTranscript?.(result)
            }
          }
        } catch (err) {
          console.error("Error parsing Deepgram response:", err)
        }
      }

      socket.onerror = (event) => {
        console.error("Deepgram WebSocket error:", event)
        const errorMsg = "Transcription connection error"
        setError(errorMsg)
        onError?.(errorMsg)
      }

      socket.onclose = (event) => {
        console.log("Deepgram WebSocket closed:", event.code, event.reason)
        setIsTranscribing(false)
      }

    } catch (err: any) {
      console.error("Error starting transcription:", err)
      const errorMsg = err.message || "Failed to start transcription"
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [language, onTranscript, onError])

  const stopTranscription = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsTranscribing(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setFullTranscript("")
    setInterimTranscript("")
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription()
    }
  }, [stopTranscription])

  return {
    isTranscribing,
    fullTranscript,
    interimTranscript,
    error,
    startTranscription,
    stopTranscription,
    clearTranscript
  }
}
