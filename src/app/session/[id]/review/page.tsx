"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { rateAppointment, getAppointmentById } from "@/app/actions/appointment"
import { getAppointmentSummary, generateMeetingSummary } from "@/app/actions/ai-summary"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Loader2, 
  FileText, 
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react"

export default function ReviewPage(props: { params: Promise<{ id: string }> }) {
  const [rating, setRating] = React.useState(0)
  const [review, setReview] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [pageLoading, setPageLoading] = React.useState(true)
  const [summaryLoading, setSummaryLoading] = React.useState(false)
  const [appointmentData, setAppointmentData] = React.useState<any>(null)
  const [summary, setSummary] = React.useState<{ english: string; hindi: string } | null>(null)
  const [isPatient, setIsPatient] = React.useState(false)
  const [showHindi, setShowHindi] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const params = await props.params
        const appointmentId = params.id

        // Get appointment details
        const appointment = await getAppointmentById(appointmentId)
        if (!appointment) {
          setError("Appointment not found")
          setPageLoading(false)
          return
        }

        setAppointmentData(appointment)

        // Check if current user is patient by trying to get summary (only patients can)
        const summaryResult = await getAppointmentSummary(appointmentId)
        
        if (summaryResult.success) {
          setIsPatient(true)
          if (summaryResult.summary) {
            setSummary({
              english: summaryResult.summary.english || "",
              hindi: summaryResult.summary.hindi || ""
            })
          }
        } else if (summaryResult.error === "Only patients can view the consultation summary") {
          // User is doctor
          setIsPatient(false)
        } else {
          setIsPatient(true) // Assume patient if other error
        }

        setPageLoading(false)
      } catch (err) {
        console.error("Error loading review page:", err)
        setError("Failed to load review page")
        setPageLoading(false)
      }
    }

    loadData()
  }, [props.params])

  const handleGenerateSummary = async () => {
    if (!appointmentData?.transcription) {
      alert("No transcription available to generate summary")
      return
    }

    setSummaryLoading(true)
    try {
      const params = await props.params
      const result = await generateMeetingSummary(params.id, appointmentData.transcription)
      
      if (result.success && result.summary) {
        setSummary(result.summary)
      } else {
        alert(result.error || "Failed to generate summary")
      }
    } catch (err) {
      console.error("Error generating summary:", err)
      alert("Failed to generate summary")
    } finally {
      setSummaryLoading(false)
    }
  }

  async function handleSubmit() {
    const params = await props.params
    const appointmentId = params.id

    setLoading(true)
    const result = await rateAppointment(appointmentId, rating, review)
    setLoading(false)

    if (result.success) {
      router.push("/patient/dashboard")
    } else {
      alert("Failed to submit review: " + result.error)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
      </div>
    )
  }

  // If user is a doctor, show different message and redirect
  if (!isPatient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold text-center">Session Completed</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Thank you for completing the consultation. The patient will be asked to provide their feedback.
        </p>
        <Button onClick={() => router.push("/doctor/dashboard")} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10 px-4 mx-auto">
      {/* Summary Section - Only for patients */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Consultation Summary</CardTitle>
            </div>
            {appointmentData?.transcription && !summary && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                className="gap-2"
              >
                {summaryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Summary
              </Button>
            )}
          </div>
          <CardDescription>
            AI-generated summary of your consultation with the doctor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-6">
              {/* English Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">English</Badge>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                  {summary.english}
                </div>
              </div>

              <Separator />

              {/* Hindi Summary Toggle */}
              <div>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setShowHindi(!showHindi)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">हिंदी</Badge>
                    <span className="text-sm">Hindi Translation</span>
                  </div>
                  {showHindi ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                
                {showHindi && (
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                    {summary.hindi}
                  </div>
                )}
              </div>
            </div>
          ) : appointmentData?.transcription ? (
            <div className="text-center py-6">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Click &quot;Generate Summary&quot; to create an AI-powered summary of your consultation.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No transcription was recorded for this session.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Enable transcription during your next session to get a summary.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Section */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>How was your session?</CardTitle>
          <CardDescription>
            Please rate your experience with the doctor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-all duration-200 ${
                  rating >= star 
                    ? "text-yellow-400 scale-110" 
                    : "text-gray-300 hover:text-yellow-200 hover:scale-105"
                }`}
              >
                <Star className="h-10 w-10 fill-current" />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <p className="text-center text-sm text-muted-foreground">
              {rating === 1 && "Poor experience"}
              {rating === 2 && "Below average"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good experience"}
              {rating === 5 && "Excellent experience!"}
            </p>
          )}

          <Textarea
            placeholder="Share your experience with the doctor (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-30 resize-none"
          />

          <Button
            className="w-full"
            size="lg"
            disabled={rating === 0 || loading}
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground" 
            onClick={() => router.push("/patient/dashboard")}
          >
            Skip for now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
