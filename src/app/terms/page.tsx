export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: December 27, 2025</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Agreement to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using our website and services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Medical Advice Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            MediMaven facilitates connections between patients and healthcare providers. While our providers are licensed professionals, the content on our site is for informational purposes only and does not constitute medical advice. For medical emergencies, call your local emergency number immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Use of Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to use our services only for lawful purposes. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. User Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            You must be at least 18 years old to create an account. You agree to provide accurate, current, and complete information during the registration process.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>
      </div>
    </div>
  )
}
