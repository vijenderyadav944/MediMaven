"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Zap, 
  Clock, 
  User, 
  Loader2,
  PhoneCall,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  getPendingInstantMeetings, 
  acceptInstantMeeting 
} from "@/app/actions/instant-meeting"

// Fixed price for instant meetings (in rupees)
const INSTANT_MEETING_PRICE = 1500

interface InstantMeetingRequest {
  _id: string
  patientId: {
    _id: string
    name: string
    email: string
    image?: string
    gender?: string
  }
  specialty: string
  createdAt: string
  amount: number
}

export function InstantMeetingRequests() {
  const router = useRouter()
  const [requests, setRequests] = React.useState<InstantMeetingRequest[]>([])
  const [loading, setLoading] = React.useState(true)
  const [accepting, setAccepting] = React.useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = React.useState<InstantMeetingRequest | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)

  const fetchRequests = React.useCallback(async () => {
    try {
      const data = await getPendingInstantMeetings()
      setRequests(data)
    } catch (err) {
      console.error("Failed to fetch instant meeting requests:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial fetch and polling
  React.useEffect(() => {
    fetchRequests()
    
    // Poll every 10 seconds for new requests
    const interval = setInterval(fetchRequests, 10000)
    
    return () => clearInterval(interval)
  }, [fetchRequests])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRequests()
  }

  const handleAccept = async () => {
    if (!selectedRequest) return

    setAccepting(selectedRequest._id)
    setError(null)

    try {
      const result = await acceptInstantMeeting(selectedRequest._id)
      
      if (result.error) {
        setError(result.error)
        setAccepting(null)
        setSelectedRequest(null)
        // Refresh to get updated list
        fetchRequests()
        return
      }

      // Redirect to the meeting
      if (result.meetingLink) {
        router.push(result.meetingLink)
      }
    } catch (err) {
      setError("Failed to accept request")
      setAccepting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Instant Meeting Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-amber-500/20 bg-linear-to-br from-amber-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Instant Meeting Requests
                {requests.length > 0 && (
                  <Badge variant="secondary" className="bg-amber-500 text-white">
                    {requests.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Patients waiting for immediate consultation
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {requests.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {requests.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.patientId?.image} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {request.patientId?.name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{request.patientId?.name || "Patient"}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Waiting {formatDistanceToNow(new Date(request.createdAt))}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ₹{INSTANT_MEETING_PRICE}
                      </Badge>
                      <Button 
                        size="sm"
                        className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => setSelectedRequest(request)}
                        disabled={accepting === request._id}
                      >
                        {accepting === request._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <PhoneCall className="h-4 w-4" />
                            Accept
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No pending instant meeting requests</p>
              <p className="text-sm mt-1">New requests will appear here automatically</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Accept Instant Consultation?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-muted-foreground text-sm space-y-3">
                <p>
                  You are about to start an instant consultation with{" "}
                  <span className="font-semibold text-foreground">
                    {selectedRequest?.patientId?.name}
                  </span>
                </p>
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Consultation Fee</span>
                    <span className="font-semibold text-green-600">₹{INSTANT_MEETING_PRICE}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Session Duration</span>
                    <span>30 minutes</span>
                  </div>
                </div>
                <p className="text-sm">
                  Once accepted, you&apos;ll be connected immediately with the patient.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!accepting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAccept}
              disabled={!!accepting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Accept & Join
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
