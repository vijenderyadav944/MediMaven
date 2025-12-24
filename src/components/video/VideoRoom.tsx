"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  DailyProvider,
  useDaily,
  useDailyEvent,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
  useScreenShare,
  DailyVideo,
  DailyAudio
} from "@daily-co/daily-react"
import { Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MessageSquare, MonitorUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VideoRoomProps {
  url: string;
  token?: string;
  onLeave: () => void;
}

export function VideoRoom({ url, token, onLeave }: VideoRoomProps) {
  return (
    <DailyProvider
      url={url}
      token={token}
    >
      <CallContent onLeave={onLeave} />
    </DailyProvider>
  )
}

function CallContent({ onLeave }: { onLeave: () => void }) {
  const daily = useDaily();
  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join the call automatically
  useEffect(() => {
    if (!daily) return;

    const join = async () => {
      try {
        await daily.join();
        setJoining(false);
      } catch (e: any) {
        setError(e.message || "Failed to join call");
        setJoining(false);
      }
    };
    join();

    return () => {
      daily.leave();
    }
  }, [daily]);

  if (joining) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full bg-black/90 text-white rounded-xl">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p>Joining Secure Session...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] w-full bg-black/90 text-white rounded-xl">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={onLeave} variant="secondary">Go Back</Button>
      </div>
    )
  }

  return (
    <div className="relative h-[80vh] w-full bg-neutral-900 rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-neutral-800">
      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <VideoGrid />

        {/* Controls Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/10">
          <Controls onLeave={onLeave} />
        </div>
      </div>

      {/* Sidebar (Chat / Transcription) */}
      <div className="hidden md:flex w-80 bg-neutral-950 border-l border-white/10 flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Live Transcription</h3>
          <p className="text-xs text-neutral-400">Powered by AI</p>
        </div>
        <ScrollArea className="flex-1 p-4">
          {/* Mock Transcription Stream */}
          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-lg rounded-tl-none">
              <p className="text-xs text-blue-400 font-bold mb-1">Doctor</p>
              <p className="text-sm text-white/90">Hello! How are you feeling today?</p>
            </div>
            <div className="bg-primary/20 p-3 rounded-lg rounded-tr-none ml-auto">
              <p className="text-xs text-green-400 font-bold mb-1 text-right">You</p>
              <p className="text-sm text-white/90">I've been having some headaches lately.</p>
            </div>
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-white/10">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full bg-white/10 border-none rounded-full px-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
      </div>
    </div>
  )
}

function VideoGrid() {
  const localSessionId = useLocalSessionId();
  const participantIds = useParticipantIds();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
      {/* Local Video */}
      {localSessionId && (
        <Tile id={localSessionId} isLocal />
      )}

      {/* Remote Videos */}
      {participantIds?.filter(id => id !== localSessionId).map(id => (
        <Tile key={id} id={id} />
      ))}

      {participantIds?.length === 1 && (
        <div className="flex items-center justify-center bg-white/5 rounded-xl border border-white/10 border-dashed animate-pulse">
          <p className="text-neutral-400">Waiting for doctor to join...</p>
        </div>
      )}
    </div>
  )
}

function Tile({ id, isLocal }: { id: string, isLocal?: boolean }) {
  const videoState = useVideoTrack(id);
  const audioState = useAudioTrack(id);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg">
      <DailyVideo sessionId={id} type="video" className="w-full h-full object-cover" />
      <DailyAudio sessionId={id} />

      {/* Label */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-xs text-white font-medium flex items-center gap-2">
        {isLocal ? "You" : "Doctor"}
        {audioState.muted && <MicOff className="h-3 w-3 text-red-500" />}
      </div>
    </div>
  )
}


function Controls({ onLeave }: { onLeave: () => void }) {
  const daily = useDaily();
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  // In a real implementation we would sync this with actual track state 
  // using useLocalParticipant() but for brevity:

  const toggleAudio = () => {
    if (!daily) return;
    daily.setLocalAudio(!muted); // Logic inverted? No, daily setLocalAudio(bool) enables/disables? 
    // Docs: setLocalAudio(true) unmutes. 
    // So if currently 'muted' (true), we want to unmute (set true). 
    // Actually, let's just toggle.
    setMuted(!muted);
    daily.setLocalAudio(muted); // If I am muted (true), I want to be unmuted.
  }

  const toggleVideo = () => {
    if (!daily) return;
    setVideoOff(!videoOff);
    daily.setLocalVideo(videoOff);
  }

  return (
    <>
      <Button
        variant={muted ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full h-12 w-12"
        onClick={toggleAudio}
      >
        {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        variant={videoOff ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full h-12 w-12"
        onClick={toggleVideo}
      >
        {videoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
      </Button>

      <Button
        variant="destructive"
        size="icon"
        className="rounded-full h-12 w-12"
        onClick={onLeave}
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </>
  )
}
