"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getBookedSlots } from "@/app/actions/doctor"
import { nowIST, toIST } from "@/lib/date-utils"

interface TimeSlotPickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  slot: string | null;
  setSlot: (slot: string) => void;
  doctorId: string;
}

const MORNING_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
const AFTERNOON_SLOTS = ["12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM"]

// Convert time slot to 24-hour format for comparison
function slotTo24Hour(slot: string): { hours: number; minutes: number } {
  const [time, period] = slot.split(" ")
  const [hourStr, minStr] = time.split(":")
  let hours = parseInt(hourStr, 10)
  const minutes = parseInt(minStr, 10)
  
  if (period === "PM" && hours !== 12) {
    hours += 12
  } else if (period === "AM" && hours === 12) {
    hours = 0
  }
  
  return { hours, minutes }
}

// Check if a slot is in the past for today (using IST timezone)
function isSlotInPast(slot: string, selectedDate: Date): boolean {
  // Get current time in IST
  const nowInIST = nowIST()
  
  // Get today's date in IST (midnight)
  const todayIST = new Date(nowInIST)
  todayIST.setHours(0, 0, 0, 0)
  
  // Convert selected date to IST and get midnight
  const selectedDayIST = toIST(selectedDate)
  selectedDayIST.setHours(0, 0, 0, 0)
  
  // If selected date is not today, slot is not in the past
  if (selectedDayIST.getTime() !== todayIST.getTime()) {
    return false
  }
  
  // For today, check if slot time has passed
  const { hours, minutes } = slotTo24Hour(slot)
  const slotTimeIST = new Date(todayIST)
  slotTimeIST.setHours(hours, minutes, 0, 0)
  
  return slotTimeIST <= nowInIST
}

export function TimeSlotPicker({ date, setDate, slot, setSlot, doctorId }: TimeSlotPickerProps) {
  const [bookedSlots, setBookedSlots] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  // Fetch booked slots when date changes
  React.useEffect(() => {
    async function fetchBookedSlots() {
      if (!date || !doctorId) return
      
      setLoading(true)
      try {
        const slots = await getBookedSlots(doctorId, date)
        setBookedSlots(slots)
      } catch (error) {
        console.error("Failed to fetch booked slots:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookedSlots()
  }, [date, doctorId])

  // Filter available slots
  const getAvailableSlots = (slots: string[]) => {
    if (!date) return slots
    
    return slots.filter(slotTime => {
      // Filter out past slots (for today)
      if (isSlotInPast(slotTime, date)) return false
      
      // Filter out booked slots
      if (bookedSlots.includes(slotTime)) return false
      
      return true
    })
  }

  const availableMorningSlots = getAvailableSlots(MORNING_SLOTS)
  const availableAfternoonSlots = getAvailableSlots(AFTERNOON_SLOTS)

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h3 className="font-semibold mb-3">Select Date</h3>
        <div className="border rounded-md p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-0"
            disabled={(date) => {
              const todayIST = nowIST()
              todayIST.setHours(0, 0, 0, 0)
              return date < todayIST
            }}
          />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold mb-3">Available Slots</h3>
        <ScrollArea className="h-75 w-full rounded-md border p-4">
          {date ? (
            loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Loading available slots...
              </div>
            ) : availableMorningSlots.length === 0 && availableAfternoonSlots.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No available slots for this date. Please select another date.
              </div>
            ) : (
              <div className="space-y-6">
                {availableMorningSlots.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Morning</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableMorningSlots.map(time => (
                        <Button
                          key={time}
                          variant={slot === time ? "default" : "outline"}
                          className="h-9"
                          onClick={() => setSlot(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                {availableAfternoonSlots.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Afternoon</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableAfternoonSlots.map(time => (
                        <Button
                          key={time}
                          variant={slot === time ? "default" : "outline"}
                          className="h-9"
                          onClick={() => setSlot(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a date to view available slots
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
