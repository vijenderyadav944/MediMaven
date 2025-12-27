import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, MapPin, Clock } from "lucide-react"

export default function CareersPage() {
  const positions = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
    },
    {
      title: "Medical Lead",
      department: "Medical",
      location: "New York, NY",
      type: "Full-time",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Contract",
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Bengaluru, India",
      type: "Full-time",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="container px-4 mx-auto relative z-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-6 lg:text-6xl">
            Join our mission to <br />
            <span className="text-primary">heal the world.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            We're looking for passionate individuals who want to make a tangible difference in people's lives through healthcare innovation.
          </p>
          <Button size="lg" className="rounded-full px-8 bg-white text-slate-900 hover:bg-slate-100">
            View Open Positions
          </Button>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Open Positions</h2>
            <Button variant="outline">View All</Button>
          </div>

          <div className="grid gap-6">
            {positions.map((job, index) => (
              <div key={index} className="group p-6 rounded-xl border bg-card hover:border-primary/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.department}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.type}</span>
                  </div>
                </div>
                <Button className="shrink-0 rounded-full" variant="secondary">
                  Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Perks & Benefits</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Competitive Salary",
              "Remote-First Culture",
              "Health Insurance",
              "Unlimited PTO",
              "Learning Budget",
              "Mental Health Support",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background border shadow-sm">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  ✓
                </div>
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
