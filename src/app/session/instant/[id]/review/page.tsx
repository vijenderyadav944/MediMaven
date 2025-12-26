"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { rateInstantMeeting, getInstantMeetingById } from "@/app/actions/instant-meeting"
import { generateMeetingSummary } from "@/app/actions/ai-summary"
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
  Sparkles,
  Zap
} from "lucide-react"

export default function InstantMeetingReviewPage(props: { params: Promise<{ id: string }> }) {
  const [rating, setRating] = React.useState(0)
  const [review, setReview] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [pageLoading, setPageLoading] = React.useState(true)
  const [summaryLoading, setSummaryLoading] = React.useState(false)
  const [meetingData, setMeetingData] = React.useState<any>(null)
  const [summary, setSummary] = React.useState<{ english: string; hindi: string } | null>(null)
  const [isPatient, setIsPatient] = React.useState(false)
  const [showHindi, setShowHindi] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const params = await props.params
        const meetingId = params.id

        // Get meeting details
        const meeting = await getInstantMeetingById(meetingId)
        if (!meeting) {
          setError("Meeting not found")
          setPageLoading(false)
          return
        }

        setMeetingData(meeting)
        
        // Check if user is patient
        const patientIdStr = meeting.patientId?._id || meeting.patientId
        setIsPatient(true) // Assume patient for now since only patients access review page
        
        if (meeting.summary) {
          setSummary({
            english: meeting.summary.english || "",
            hindi: meeting.summary.hindi || ""
          })
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
    if (!meetingData?.transcription) {
      alert("No transcription available to generate summary")
      return
    }

    setSummaryLoading(true)
    try {
      const params = await props.params
      // Use the same summary generation but for instant meetings
      const result = await generateMeetingSummary(params.id, meetingData.transcription, true)
      
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
    const meetingId = params.id

    setLoading(true)
    const result = await rateInstantMeeting(meetingId, rating, review)
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

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30 py-12 px-4">
      <div className="container max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Zap className="h-3 w-3 mr-1" />
            Instant Consultation Complete
          </Badge>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Session Complete!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for using MediMaven Instant Consultation
          </p>
        </div>

        {/* Doctor Info */}
        {meetingData?.doctorId && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {meetingData.doctorId.name || "Your Doctor"}
                  </CardTitle>
                  <CardDescription>
                    {meetingData.doctorId.specialty || meetingData.specialty}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* AI Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Consultation Summary
            </CardTitle>
            <CardDescription>
              AI-generated summary of your consultation in English and Hindi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">English Summary</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{summary.english}</p>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between"
                  onClick={() => setShowHindi(!showHindi)}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Hindi Summary (हिंदी सारांश)
                  </span>
                  {showHindi ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showHindi && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{summary.hindi}</p>
                  </div>
                )}
              </div>
            ) : meetingData?.transcription ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Summary not yet generated. Click below to create an AI summary.
                </p>
                <Button onClick={handleGenerateSummary} disabled={summaryLoading}>
                  {summaryLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No transcription available for this session.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Rating */}
        {isPatient && !meetingData?.rating && (
          <Card>
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
              <CardDescription>
                Help us improve by sharing your feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Great!" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                </p>
              )}

              <Separator />

              {/* Review Text */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Write a review (optional)
                </label>
                <Textarea
                  placeholder="Share your experience with this consultation..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={rating === 0 || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Already rated */}
        {meetingData?.rating && (
          <Card>
            <CardContent className="py-6 text-center">
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= meetingData.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">You rated this consultation</p>
              {meetingData.review && (
                <p className="mt-2 italic">&ldquo;{meetingData.review}&rdquo;</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push("/patient/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
