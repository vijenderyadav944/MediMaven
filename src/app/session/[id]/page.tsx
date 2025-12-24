"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createDailyRoom } from "@/app/session/actions"
import { VideoRoom } from "@/components/video/VideoRoom"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"

export default function SessionPage() {
  const router = useRouter()
  const [url, setUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Create a room on mount
    const init = async () => {
      const res = await createDailyRoom();
      if (res.error) {
        setError(res.error);
        // If demo mode, we might fallback differently, but here we just show error
        if (res.demoMode) {
          // Demo:
          // setUrl("https://demo.daily.co/test"); // Dangerous if not real.
          setError("Demo Mode: Configure DAILY_API_KEY in .env to enable video.");
        }
      } else if (res.url) {
        setUrl(res.url);
      }
    };
    init();
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive font-bold">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Initializing Secure Room...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between text-white">
          <Button variant="ghost" className="text-white hover:text-white/80" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="font-mono text-sm">REC</span>
          </div>
        </div>

        <VideoRoom
          url={url}
          onLeave={() => router.push("/dashboard")}
        />
      </div>
    </div>
  )
}
