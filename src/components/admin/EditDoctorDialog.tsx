'use client'

import { useState } from "react"
import { updateDoctor, deleteDoctor } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Loader2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface EditDoctorDialogProps {
  doctor: {
    id: string;
    name: string;
    email: string;
    specialty: string;
    bio?: string;
    image?: string;
    doctorProfile?: {
      price: number;
      consultationDuration: number;
      qualifications: string[];
      experience: number;
      availability?: {
        days: string[];
        startTime: string;
        endTime: string;
      };
    };
  };
}

export function EditDoctorDialog({ doctor }: EditDoctorDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: doctor.name,
    email: doctor.email,
    specialty: doctor.specialty,
    bio: doctor.bio || "",
    image: doctor.image || "",
    price: doctor.doctorProfile?.price || 500,
    consultationDuration: doctor.doctorProfile?.consultationDuration || 30,
    qualifications: doctor.doctorProfile?.qualifications?.join(", ") || "",
    experience: doctor.doctorProfile?.experience || 0,
    startTime: doctor.doctorProfile?.availability?.startTime || "09:00",
    endTime: doctor.doctorProfile?.availability?.endTime || "17:00",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateDoctor(doctor.id, {
      name: formData.name,
      email: formData.email,
      specialty: formData.specialty,
      bio: formData.bio,
      image: formData.image,
      price: Number(formData.price),
      consultationDuration: Number(formData.consultationDuration),
      qualifications: formData.qualifications.split(",").map(q => q.trim()).filter(Boolean),
      experience: Number(formData.experience),
      availability: {
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        startTime: formData.startTime,
        endTime: formData.endTime,
      }
    })

    setLoading(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error || "Failed to update doctor")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    const result = await deleteDoctor(doctor.id)
    setDeleting(false)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error || "Failed to delete doctor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Doctor Profile</DialogTitle>
          <DialogDescription>
            Update doctor information, pricing, and availability.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={e => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={e => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Profile Image URL</Label>
            <Input
              id="image"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Doctor's biography..."
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications (comma separated)</Label>
            <Input
              id="qualifications"
              placeholder="MBBS, MD, DNB..."
              value={formData.qualifications}
              onChange={e => setFormData(prev => ({ ...prev, qualifications: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Consultation Fee (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Session Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.consultationDuration}
                onChange={e => setFormData(prev => ({ ...prev, consultationDuration: parseInt(e.target.value) || 30 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || loading}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button type="submit" disabled={loading || deleting}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
