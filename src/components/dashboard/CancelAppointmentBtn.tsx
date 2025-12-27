"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, XCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelAppointment } from "@/app/actions/appointment"

interface CancelAppointmentBtnProps {
  appointmentId: string
  isPast: boolean
}

export function CancelAppointmentBtn({ appointmentId, isPast }: CancelAppointmentBtnProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // Assuming useToast hook exists or I can use basic alert for now if not found, 
  // but standard shadcn setup usually has it. I'll stick to basic alert if toast fails or just use local state.
  // Actually, I'll avoid useToast for now to minimize dependencies unless I verify it exists.

  const handleCancel = async () => {
    setLoading(true)
    try {
      const result = await cancelAppointment(appointmentId)
      if (result.error) {
        alert(result.error) // Fallback
      } else {
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      alert("Failed to cancel appointment")
    } finally {
      setLoading(false)
    }
  }

  if (isPast) return null

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <XCircle className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this appointment?
            This action cannot be undone. If you have already paid, a refund will be processed automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleCancel()
            }}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, Cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
