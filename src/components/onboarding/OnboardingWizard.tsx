"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { completeOnboarding } from "@/app/patient/onboarding/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"

// Types
type FormData = {
  gender: string
  dob: string
  bloodGroup: string
  allergies: string
  medications: string
  chronicConditions: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
  symptoms: string[]
}

const INITIAL_DATA: FormData = {
  gender: "",
  dob: "",
  bloodGroup: "",
  allergies: "",
  medications: "",
  chronicConditions: "",
  emergencyContactName: "",
  emergencyContactRelation: "",
  emergencyContactPhone: "",
  symptoms: [],
}

const SYMPTOMS_LIST = [
  "Fever", "Cough", "Headache", "Fatigue",
  "Sore Throat", "Shortness of Breath", "Body Aches", "Nausea"
]

export function OnboardingWizard() {
  const [step, setStep] = React.useState(1)
  const [data, setData] = React.useState(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  const updateFields = (fields: Partial<FormData>) => {
    setData(prev => ({ ...prev, ...fields }))
  }

  const handleNext = async () => {
    if (step < 3) {
      setStep(prev => prev + 1)
    } else {
      // Submit with structured health profile
      setIsSubmitting(true)
      const res = await completeOnboarding({
        gender: data.gender,
        dob: new Date(data.dob),
        healthProfile: {
          bloodGroup: data.bloodGroup,
          allergies: data.allergies.split(',').map(s => s.trim()).filter(Boolean),
          chronicConditions: data.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
          medications: data.medications.split(',').map(s => s.trim()).filter(Boolean),
          emergencyContact: {
            name: data.emergencyContactName,
            relation: data.emergencyContactRelation,
            phone: data.emergencyContactPhone
          }
        },
        medicalHistory: data.symptoms // Current symptoms as medical history
      })

      if (res.success) {
        router.push("/dashboard")
      } else {
        alert("Something went wrong. Please try again.")
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-secondary"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs font-medium text-muted-foreground">
          <span className={step >= 1 ? "text-primary" : ""}>Basic Info</span>
          <span className={step >= 2 ? "text-primary" : ""}>History</span>
          <span className={step >= 3 ? "text-primary" : ""}>Symptoms</span>
        </div>
      </div>

      <Card className="min-h-100 shadow-lg border-border/50 relative overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepOne key="step1" data={data} updateFields={updateFields} />
            )}
            {step === 2 && (
              <StepTwo key="step2" data={data} updateFields={updateFields} />
            )}
            {step === 3 && (
              <StepThree key="step3" data={data} updateFields={updateFields} />
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="gap-2 min-w-30"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {step === 3 ? "Complete" : "Continue"}
              {step !== 3 && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StepOne({ data, updateFields }: { data: FormData, updateFields: (f: Partial<FormData>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <p className="text-muted-foreground">Help us understand your demographic.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={data.dob}
            onChange={e => updateFields({ dob: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Blood Group</Label>
          <RadioGroup
            value={data.bloodGroup}
            onValueChange={val => updateFields({ bloodGroup: val })}
            className="grid grid-cols-4 gap-2"
          >
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
              <div key={bg}>
                <RadioGroupItem value={bg} id={bg} className="peer sr-only" />
                <Label
                  htmlFor={bg}
                  className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer text-sm"
                >
                  {bg}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={data.gender}
            onValueChange={val => updateFields({ gender: val })}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem value="male" id="male" className="peer sr-only" />
              <Label
                htmlFor="male"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
              >
                Male
              </Label>
            </div>
            <div>
              <RadioGroupItem value="female" id="female" className="peer sr-only" />
              <Label
                htmlFor="female"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all cursor-pointer"
              >
                Female
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  )
}

function StepTwo({ data, updateFields }: { data: FormData, updateFields: (f: Partial<FormData>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Medical History</h2>
        <p className="text-muted-foreground">Any existing conditions or allergies?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Known Allergies (comma separated)</Label>
          <Textarea
            placeholder="Peanuts, Penicillin, Dust, etc. (Leave blank if none)"
            value={data.allergies}
            onChange={e => updateFields({ allergies: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Chronic Conditions (comma separated)</Label>
          <Textarea
            placeholder="Diabetes, Hypertension, Asthma, etc. (Leave blank if none)"
            value={data.chronicConditions}
            onChange={e => updateFields({ chronicConditions: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Current Medications (comma separated)</Label>
          <Textarea
            placeholder="Metformin, Amlodipine, etc. (Leave blank if none)"
            value={data.medications}
            onChange={e => updateFields({ medications: e.target.value })}
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="Contact name"
                value={data.emergencyContactName}
                onChange={e => updateFields({ emergencyContactName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Relation</Label>
              <Input
                placeholder="e.g., Spouse, Parent"
                value={data.emergencyContactRelation}
                onChange={e => updateFields({ emergencyContactRelation: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone</Label>
              <Input
                type="tel"
                placeholder="+91 9876543210"
                value={data.emergencyContactPhone}
                onChange={e => updateFields({ emergencyContactPhone: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function StepThree({ data, updateFields }: { data: FormData, updateFields: (f: Partial<FormData>) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Current Symptoms</h2>
        <p className="text-muted-foreground">What brings you here today?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SYMPTOMS_LIST.map((symptom) => (
          <div key={symptom} className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent transition-colors">
            <Checkbox
              id={symptom}
              checked={data.symptoms.includes(symptom)}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateFields({ symptoms: [...data.symptoms, symptom] })
                } else {
                  updateFields({ symptoms: data.symptoms.filter(s => s !== symptom) })
                }
              }}
            />
            <Label htmlFor={symptom} className="flex-1 cursor-pointer">{symptom}</Label>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
