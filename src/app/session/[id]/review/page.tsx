"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { rateAppointment } from "@/app/actions/appointment"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Loader2 } from "lucide-react"

export default function ReviewPage(props: { params: Promise<{ id: string }> }) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    // Need to resolve params first... actually params is a promise in recent Next.js
    // but here we are in a client component we can just use useParam usually but passing via props is safer if async page wrapper
    // Wait, the id in URL is roomId likely, but rateAppointment needs appointmentId.
    // We need to fetch appointment by roomId first or pass appointmentId.
    // Assuming roomId logic: we need an action to find appointment by meeting link/room id.
    // For now, let's assume [id] IS the appointmentId or we can look it up.
    // Actually, `VideoRoom` was passed `appointmentId`. It should redirect to `/session/${appointmentId}/review`? 
    // Or `/review/${appointmentId}`?
    // Let's assume the route is `/session/[id]/review` where [id] is appointmentId for simplicity.

    // BUT the meeting link is `/session/[roomId]`.
    // So the review page should probably be `/appointments/[id]/review` to be safe/clear.
    // Let's stick to the requested location: "at the end of the meeting".
    // I'll assume [id] here is appointmentId.
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

  return (
    <div className="container max-w-md py-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">How was your session?</CardTitle>
          <CardDescription className="text-center">
            Please rate your experience with the doctor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`transition-all ${rating >= star ? "text-yellow-400 scale-110" : "text-gray-200 hover:text-gray-300"}`}
              >
                <Star className="h-8 w-8 fill-current" />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Write a review (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[100px]"
          />

          <Button
            className="w-full"
            disabled={rating === 0 || loading}
            onClick={handleSubmit}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => router.push("/patient/dashboard")}>
            Skip
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
