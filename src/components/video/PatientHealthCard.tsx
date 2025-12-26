"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Heart, 
  AlertCircle, 
  Pill, 
  Phone, 
  Droplets,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface HealthProfile {
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

interface PatientHealthCardProps {
  patientName: string
  healthProfile?: HealthProfile
}

export function PatientHealthCard({ patientName, healthProfile }: PatientHealthCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  
  if (!healthProfile) {
    return (
      <Card className="bg-neutral-900/80 border-neutral-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-neutral-300 flex items-center gap-2">
            <User className="h-4 w-4" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500 text-sm">No health profile available</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="bg-neutral-900/80 border-neutral-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-neutral-300 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {patientName}&apos;s Health Profile
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-neutral-400 hover:text-white h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Blood Group - Always visible */}
        {healthProfile.bloodGroup && (
          <div className="flex items-center gap-3">
            <Droplets className="h-4 w-4 text-red-400" />
            <span className="text-neutral-400 text-sm">Blood Group:</span>
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              {healthProfile.bloodGroup}
            </Badge>
          </div>
        )}
        
        {isExpanded && (
          <>
            {/* Allergies */}
            {healthProfile.allergies && healthProfile.allergies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Allergies:
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {healthProfile.allergies.map((allergy, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="border-amber-500/50 text-amber-400 text-xs"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Chronic Conditions */}
            {healthProfile.chronicConditions && healthProfile.chronicConditions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <Heart className="h-4 w-4 text-pink-400" />
                  Chronic Conditions:
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {healthProfile.chronicConditions.map((condition, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="border-pink-500/50 text-pink-400 text-xs"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Medications */}
            {healthProfile.medications && healthProfile.medications.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <Pill className="h-4 w-4 text-blue-400" />
                  Current Medications:
                </div>
                <div className="flex flex-wrap gap-1 pl-6">
                  {healthProfile.medications.map((med, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="border-blue-500/50 text-blue-400 text-xs"
                    >
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Emergency Contact */}
            {healthProfile.emergencyContact?.name && (
              <div className="pt-2 border-t border-neutral-700">
                <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                  <Phone className="h-4 w-4 text-green-400" />
                  Emergency Contact:
                </div>
                <div className="pl-6 text-sm text-neutral-300">
                  <p>{healthProfile.emergencyContact.name}</p>
                  {healthProfile.emergencyContact.relationship && (
                    <p className="text-neutral-500 text-xs">
                      ({healthProfile.emergencyContact.relationship})
                    </p>
                  )}
                  {healthProfile.emergencyContact.phone && (
                    <p className="text-neutral-400">{healthProfile.emergencyContact.phone}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {!isExpanded && (
          <p className="text-neutral-500 text-xs">Click to expand for full details</p>
        )}
      </CardContent>
    </Card>
  )
}
