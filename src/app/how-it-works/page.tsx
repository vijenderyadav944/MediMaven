import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, UserPlus, Search, Calendar, Video } from "lucide-react"

const steps = [
  {
    id: "01",
    title: "Create your account",
    description: "Sign up in seconds. We'll ask for some basic health history to get you started.",
    icon: UserPlus
  },
  {
    id: "02",
    title: "Find a Specialist",
    description: "Browse our directory of top-rated doctors. Filter by specialty, gender, or availability.",
    icon: Search
  },
  {
    id: "03",
    title: "Book an Appointment",
    description: "Choose a time that works for you. Pay securely online to confirm your slot.",
    icon: Calendar
  },
  {
    id: "04",
    title: "Start the Call",
    description: "Log in at your appointment time and join the secure video room from your dashboard.",
    icon: Video
  }
]

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How MediMaven Works</h1>
        <p className="text-xl text-muted-foreground">Four simple steps to your first consultation.</p>
      </div>

      <div className="relative">
        {/* Connector Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step) => (
            <div key={step.id} className="bg-background border rounded-xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary font-bold text-2xl relative">
                <step.icon className="w-8 h-8" />
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                  {step.id}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link href="/auth/register">
          <Button size="lg" className="rounded-full px-8">
            Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
