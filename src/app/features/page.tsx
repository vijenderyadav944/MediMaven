import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Shield, Clock, Stethoscope, Search, Zap } from "lucide-react"

const features = [
  {
    title: "HD Video Consultations",
    description: "Crystal clear video calls with your specialist, powered by Daily.co technology.",
    icon: Video
  },
  {
    title: "Secure & Private",
    description: "End-to-end encryption ensuring your health data remains 100% confidential.",
    icon: Shield
  },
  {
    title: "Instant Booking",
    description: "Real-time availability checking allows you to book appointments in seconds.",
    icon: Clock
  },
  {
    title: "Top Specialists",
    description: "Access a curated network of board-certified doctors across various specialties.",
    icon: Stethoscope
  },
  {
    title: "Smart Search",
    description: "Filter doctors by specialty, price, and availability to find your perfect match.",
    icon: Search
  },
  {
    title: "AI-Powered",
    description: "Future-ready features including live transcription and symptom analysis.",
    icon: Zap
  }
]

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Everything you need for better health
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          MediMaven combines cutting-edge technology with compassionate care to deliver a superior telehealth experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
