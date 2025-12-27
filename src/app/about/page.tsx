import { Stethoscope, Users, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-primary/5">
        <div className="container px-4 mx-auto text-center relative z-10">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
            Our Mission
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Reimagining Healthcare <br className="hidden sm:inline" />
            <span className="text-primary">for the Digital Age</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            MediMaven connects you with top-tier medical specialists instantly, securely, and conveniently from the comfort of your home.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                Join MediMaven
              </Button>
            </Link>
            <Link href="/doctors">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View Specialists
              </Button>
            </Link>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-background/50 backdrop-blur-sm">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">500+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Specialists</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">10k+</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Consultations</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">98%</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Satisfaction</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-primary">24/7</h3>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why We Exist</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe quality healthcare should be accessible to everyone, everywhere. Our platform is built on three core pillars.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accessibility</h3>
              <p className="text-muted-foreground">
                Breaking down geographical barriers to connect patients with the best medical expertise available globally.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trust & Privacy</h3>
              <p className="text-muted-foreground">
                Your health data is sacred. We employ enterprise-grade encryption and strict privacy protocols to keep it safe.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Human-Centric</h3>
              <p className="text-muted-foreground">
                Technology should enhance the doctor-patient relationship, not replace it. We focus on real connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">Ready to experience the future of healthcare?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of patients who have already switched to MediMaven for their medical needs.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="rounded-full px-10 h-12 text-base">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
