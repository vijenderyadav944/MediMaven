"use client"

import React, { useEffect, useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getUserProfile, updateDoctorProfile, updateHealthProfile } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("professional")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    } else if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  async function fetchProfile() {
    try {
      const data = await getUserProfile()
      setProfile(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDoctorSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)

    startTransition(async () => {
      const result = await updateDoctorProfile(data)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        fetchProfile()
      }
    })
  }

  async function handlePatientSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)

    startTransition(async () => {
      const result = await updateHealthProfile(data)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Health profile updated successfully' })
        fetchProfile()
      }
    })
  }

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  if (!profile) return null

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      {profile.role === "doctor" ? (
        <div className="space-y-6">
          <div className="flex space-x-2 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("professional")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "professional" ? "bg-white shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              Professional Details
            </button>
            <button
              onClick={() => setActiveTab("availability")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "availability" ? "bg-white shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              Availability
            </button>
          </div>

          {activeTab === "professional" && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Manage your public profile information visible to patients.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDoctorSubmit} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" defaultValue={profile.bio} placeholder="Tell patients about yourself..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" name="specialty" defaultValue={profile.specialty} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="experience">Experience (Years)</Label>
                      <Input id="experience" name="experience" type="number" defaultValue={profile.doctorProfile?.experience || 0} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Consultation Price ($)</Label>
                      <Input id="price" name="price" type="number" defaultValue={profile.doctorProfile?.price || 50} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="consultationDuration">Duration (Minutes)</Label>
                      <Input id="consultationDuration" name="consultationDuration" type="number" defaultValue={profile.doctorProfile?.consultationDuration || 30} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
                    <Input id="qualifications" name="qualifications" defaultValue={profile.doctorProfile?.qualifications?.join(", ")} placeholder="MD, phD" />
                  </div>

                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "availability" && (
            <Card>
              <CardHeader>
                <CardTitle>Availability Settings</CardTitle>
                <CardDescription>Set your working hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDoctorSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input id="startTime" name="startTime" type="time" defaultValue={profile.doctorProfile?.availability?.startTime || "09:00"} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input id="endTime" name="endTime" type="time" defaultValue={profile.doctorProfile?.availability?.endTime || "17:00"} />
                    </div>
                  </div>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Availability
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
            <CardDescription>Update your health information for better care.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePatientSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" name="gender" defaultValue={profile.gender} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" defaultValue={profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input id="bloodGroup" name="bloodGroup" defaultValue={profile.healthProfile?.bloodGroup} placeholder="e.g. O+" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="allergies">Allergies (comma separated)</Label>
                <Textarea id="allergies" name="allergies" defaultValue={profile.healthProfile?.allergies?.join(", ")} placeholder="Peanuts, Penicillin..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="chronicConditions">Chronic Conditions (comma separated)</Label>
                <Textarea id="chronicConditions" name="chronicConditions" defaultValue={profile.healthProfile?.chronicConditions?.join(", ")} placeholder="Diabetes, Hypertension..." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="medications">Current Medications (comma separated)</Label>
                <Textarea id="medications" name="medications" defaultValue={profile.healthProfile?.medications?.join(", ")} />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Emergency Contact</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="emergencyName">Name</Label>
                    <Input id="emergencyName" name="emergencyName" defaultValue={profile.healthProfile?.emergencyContact?.name} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="emergencyRelation">Relation</Label>
                      <Input id="emergencyRelation" name="emergencyRelation" defaultValue={profile.healthProfile?.emergencyContact?.relation} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input id="emergencyPhone" name="emergencyPhone" defaultValue={profile.healthProfile?.emergencyContact?.phone} />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Health Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
