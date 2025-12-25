import { Button } from "@/components/ui/button"
import { Check, ArrowRight, Info } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const specialties = [
  { name: "General Physician", range: "$20 - $50" },
  { name: "Dermatologist", range: "$40 - $80" },
  { name: "Therapist / Psychologist", range: "$60 - $120" },
  { name: "Cardiologist", range: "$80 - $150" },
  { name: "Pediatrician", range: "$30 - $70" },
  { name: "Nutritionist", range: "$30 - $60" },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Transparent, Pay-Per-Visit Pricing</h1>
        <p className="text-xl text-muted-foreground">
          No subscriptions, no hidden fees. You only pay for the consultation you book.
          Prices are set directly by the specialists.
        </p>
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
            <CardTitle>Typical Consultation Ranges</CardTitle>
            <CardDescription>
              Actual prices vary by doctor experience and session duration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {specialties.map((s) => (
                <div key={s.name} className="flex justify-between items-center p-3 bg-background rounded-lg border">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-bold text-primary">{s.range}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md text-blue-600 dark:text-blue-300">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Most appointments are 30 minutes. Payment is held securely and only released to the doctor after the visit.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center bg-primary/5 rounded-2xl p-12">
        <h2 className="text-2xl font-bold mb-4">Ready to feel better?</h2>
        <p className="text-muted-foreground mb-8">Find the right specialist for your needs and budget today.</p>
        <Link href="/doctors">
          <Button variant="default" size="lg">Browse Doctors</Button>
        </Link>
      </div>
    </div>
  )
}
