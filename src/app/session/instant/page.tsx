"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  Clock, 
  Shield, 
  CreditCard, 
  Loader2, 
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SecurePaymentForm } from "@/components/booking/PaymentForm"
import { getSpecialties } from "@/app/actions/doctor"
import { 
  createInstantMeetingRequest, 
  updateInstantMeetingPayment 
} from "@/app/actions/instant-meeting"

// Fixed price for instant meetings (in rupees)
const INSTANT_MEETING_PRICE = 1500

const steps = [
  { id: 1, title: "Select Specialty", icon: Stethoscope },
  { id: 2, title: "Make Payment", icon: CreditCard },
  { id: 3, title: "Find Doctor", icon: Zap },
]

export default function InstantMeetingPage() {
  const router = useRouter()
  const [specialties, setSpecialties] = React.useState<string[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = React.useState("")
  const [step, setStep] = React.useState(1)
  const [instantMeetingId, setInstantMeetingId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch specialties on mount
  React.useEffect(() => {
    async function fetchSpecialties() {
      try {
        const specs = await getSpecialties()
        setSpecialties(specs)
      } catch (error) {
        console.error("Failed to fetch specialties:", error)
      }
    }
    fetchSpecialties()
  }, [])

  const handleSpecialtySelect = async () => {
    if (!selectedSpecialty) {
      setError("Please select a specialty")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await createInstantMeetingRequest(selectedSpecialty)
      
      if (result.error) {
        if (result.existingId) {
          // Redirect to existing waiting room
          router.push(`/session/instant/waiting/${result.existingId}`)
          return
        }
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.instantMeetingId) {
        setInstantMeetingId(result.instantMeetingId)
        setStep(2)
      }
    } catch (err) {
      setError("Failed to create request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    if (!instantMeetingId) return

    setLoading(true)
    try {
      const result = await updateInstantMeetingPayment(instantMeetingId, transactionId)
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      // Redirect to waiting room
      router.push(`/session/instant/waiting/${instantMeetingId}`)
    } catch (err) {
      setError("Failed to process payment. Please contact support.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4"
          >
            <Zap className="h-4 w-4" />
            <span className="font-medium">Instant Consultation</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight mb-4"
          >
            Get Help Right Now
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Connect with an available doctor in minutes. No appointment needed.
            Just select your specialty and a qualified doctor will join you shortly.
          </motion.p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                      step >= s.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <s.icon className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${step >= s.id ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 md:w-20 h-0.5 ${step > s.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Select Medical Specialty
                  </CardTitle>
                  <CardDescription>
                    Choose the type of doctor you need. An available specialist will connect with you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Choose a specialty..." />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec} value={spec} className="py-3">
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Pricing Info */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="text-2xl font-bold text-primary">₹{INSTANT_MEETING_PRICE}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>30-minute video consultation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Secure & confidential session</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-12 text-lg gap-2" 
                    onClick={handleSpecialtySelect}
                    disabled={!selectedSpecialty || loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Continue to Payment
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Complete Payment
                  </CardTitle>
                  <CardDescription>
                    Secure payment for your instant consultation with a {selectedSpecialty}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Instant Consultation</p>
                        <p className="text-sm text-muted-foreground">{selectedSpecialty}</p>
                      </div>
                      <Badge variant="secondary">₹{INSTANT_MEETING_PRICE}</Badge>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-primary">₹{INSTANT_MEETING_PRICE}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  {/* Payment Form */}
                  <SecurePaymentForm 
                    amount={INSTANT_MEETING_PRICE} 
                    onSuccess={handlePaymentSuccess}
                  />

                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    ← Change Specialty
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          <Card className="bg-muted/30 border-muted">
            <CardContent className="pt-6">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Quick Connect</h3>
              <p className="text-sm text-muted-foreground">
                Get connected with an available doctor within minutes.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-muted">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Verified Doctors</h3>
              <p className="text-sm text-muted-foreground">
                All our doctors are verified and experienced professionals.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30 border-muted">
            <CardContent className="pt-6">
              <CreditCard className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Fixed Price</h3>
              <p className="text-sm text-muted-foreground">
                Transparent pricing at ₹{INSTANT_MEETING_PRICE} per consultation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
