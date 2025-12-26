import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Info, Zap } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSpecialtyPriceRanges } from "@/app/actions/doctor"

// Fixed price for instant meetings (in rupees)
const INSTANT_MEETING_PRICE = 1500

// Fallback specialties with default prices (in rupees)
const fallbackSpecialties = [
  { name: "General Physician", minPrice: 300, maxPrice: 800 },
  { name: "Dermatologist", minPrice: 500, maxPrice: 1200 },
  { name: "Therapist / Psychologist", minPrice: 800, maxPrice: 2000 },
  { name: "Cardiologist", minPrice: 700, maxPrice: 2500 },
  { name: "Pediatrician", minPrice: 400, maxPrice: 1000 },
  { name: "Nutritionist", minPrice: 400, maxPrice: 900 },
]

export default async function PricingPage() {
  // Fetch dynamic price ranges from database
  let specialties = await getSpecialtyPriceRanges()
  
  // Use fallback if no data
  if (!specialties || specialties.length === 0) {
    specialties = fallbackSpecialties
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Transparent, Pay-Per-Visit Pricing</h1>
        <p className="text-xl text-muted-foreground">
          No subscriptions, no hidden fees. You only pay for the consultation you book.
          Prices are set directly by the specialists.
        </p>
      </div>

      {/* Instant Consultation Card */}
      <div className="max-w-3xl mx-auto mb-16">
        <Card className="border-amber-500/30 bg-linear-to-br from-amber-500/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Instant Consultation
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 border-0">
                    New
                  </Badge>
                </CardTitle>
                <CardDescription>Need a doctor right now? Skip the wait!</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Connect with a doctor in minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>Choose any medical specialty</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>30-minute video consultation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>AI-powered consultation summary</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-background rounded-xl p-6 border">
                <span className="text-sm text-muted-foreground mb-1">Fixed Price</span>
                <span className="text-4xl font-bold text-primary">₹{INSTANT_MEETING_PRICE}</span>
                <span className="text-sm text-muted-foreground mt-1">per session</span>
                <Link href="/session/instant" className="mt-4 w-full">
                  <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600">
                    <Zap className="h-4 w-4" />
                    Get Instant Help
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mb-24">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">How it Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">1</div>
              <div>
                <h3 className="font-semibold">Browse Specialists</h3>
                <p className="text-muted-foreground">Search for a doctor by specialty. Each profile clearly displays their consultation fee.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">2</div>
              <div>
                <h3 className="font-semibold">Book & Pay</h3>
                <p className="text-muted-foreground">Select a time slot and pay securely online to confirm your appointment.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">3</div>
              <div>
                <h3 className="font-semibold">Get Care</h3>
                <p className="text-muted-foreground">Join the video call at the scheduled time. Follow-ups can be booked as needed.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link href="/doctors">
              <Button size="lg" className="gap-2">
                Find a Doctor <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-muted/30 border-muted">
          <CardHeader>
            <CardTitle>Consultation Price Ranges</CardTitle>
            <CardDescription>
              Real-time prices from our specialists. Varies by experience and session duration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {specialties.map((s) => (
                <div key={s.name} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-bold text-primary">
                    ₹{s.minPrice.toLocaleString()} - ₹{s.maxPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md text-blue-600 dark:text-blue-300">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Most appointments are 30 minutes. Payment is held securely and only released to the doctor after the visit.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center bg-primary/5 rounded-2xl p-12">
        <h2 className="text-2xl font-bold mb-4">Ready to feel better?</h2>
        <p className="text-muted-foreground mb-8">Find the right specialist for your needs and budget today.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/doctors">
            <Button variant="default" size="lg">Browse Doctors</Button>
          </Link>
          <Link href="/session/instant">
            <Button variant="outline" size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Instant Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
