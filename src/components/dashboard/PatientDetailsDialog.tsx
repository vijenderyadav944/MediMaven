"use client"

import * as React from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Droplets, 
  AlertCircle, 
  Pill, 
  Heart,
  Phone,
  FileText
} from "lucide-react"
import { format } from "date-fns"

interface PatientDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    _id: string
    date: string
    duration: number
    status: string
    notes?: string
    patientId?: {
      name: string
      email: string
      image?: string
      gender?: string
      dob?: string
      healthProfile?: {
        bloodGroup?: string
        allergies?: string[]
        chronicConditions?: string[]
        medications?: string[]
        emergencyContact?: {
          name?: string
          phone?: string
          relationship?: string
        }
      }
    }
  } | null
}

export function PatientDetailsDialog({ open, onOpenChange, appointment }: PatientDetailsDialogProps) {
  if (!appointment) return null
  
  const patient = appointment.patientId
  const healthProfile = patient?.healthProfile
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Patient Details
          </DialogTitle>
          <DialogDescription>
            Appointment on {format(new Date(appointment.date), "PPP")} at {format(new Date(appointment.date), "h:mm a")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Basic Info */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {patient?.name?.replace(/^Dr\.?\s*/i, "")[0]?.toUpperCase() || "P"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{patient?.name || "Patient"}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {patient?.email || "No email"}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                {patient?.gender && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Gender: </span>
                    <span className="capitalize">{patient.gender}</span>
                  </div>
                )}
                {patient?.dob && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">DOB: </span>
                    <span>{format(new Date(patient.dob), "PP")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Appointment Info */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                Appointment Details
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  {format(new Date(appointment.date), "PPP")}
                </div>
                <div>
                  <span className="text-muted-foreground">Time: </span>
                  {format(new Date(appointment.date), "h:mm a")}
                </div>
                <div>
                  <span className="text-muted-foreground">Duration: </span>
                  {appointment.duration} min
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {appointment.status}
                  </Badge>
                </div>
              </div>
              {appointment.notes && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <FileText className="h-3 w-3" />
                    Patient Notes:
                  </div>
                  <p className="text-sm bg-muted p-2 rounded">{appointment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Health Profile */}
          {healthProfile && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Health Profile
                </h4>
                
                {healthProfile.bloodGroup && (
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">Blood Group:</span>
                    <Badge variant="outline" className="border-red-500/50 text-red-600">
                      {healthProfile.bloodGroup}
                    </Badge>
                  </div>
                )}
                
                {healthProfile.allergies && healthProfile.allergies.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">Allergies:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-6">
                      {healthProfile.allergies.map((allergy, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {healthProfile.chronicConditions && healthProfile.chronicConditions.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span className="text-muted-foreground">Chronic Conditions:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-6">
                      {healthProfile.chronicConditions.map((condition, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {healthProfile.medications && healthProfile.medications.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Pill className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">Current Medications:</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-6">
                      {healthProfile.medications.map((med, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {med}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {healthProfile.emergencyContact?.name && (
                  <div className="pt-2 border-t space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span className="text-muted-foreground">Emergency Contact:</span>
                    </div>
                    <div className="pl-6 text-sm">
                      <p className="font-medium">{healthProfile.emergencyContact.name}</p>
                      {healthProfile.emergencyContact.relationship && (
                        <p className="text-muted-foreground text-xs">
                          ({healthProfile.emergencyContact.relationship})
                        </p>
                      )}
                      {healthProfile.emergencyContact.phone && (
                        <p>{healthProfile.emergencyContact.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {!healthProfile && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No health profile available for this patient.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
