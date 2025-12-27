export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: December 27, 2025</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            MediMaven ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by MediMaven.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We collect information you provide directly to us, such as when you create an account, update your profile, request a consultation, or communicate with us. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Name, email address, and phone number</li>
            <li>Medical history and symptoms (stored securely and HIPAA compliant)</li>
            <li>Payment information</li>
            <li>Profile photos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the information we collect to operate, maintain, and improve our services, to match you with appropriate doctors, to process transactions, and to communicate with you.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate technical and organizational measures to protect the security of your personal information. Your medical data is encrypted both in transit and at rest.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at privacy@medimaven.com.
          </p>
        </section>
      </div>
    </div>
  )
}
