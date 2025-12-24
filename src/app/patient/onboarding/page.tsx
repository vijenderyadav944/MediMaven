import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Let's get to know you</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            We need a few details to connect you with the right specialists.
          </p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  )
}
