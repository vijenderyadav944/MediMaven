"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface TimeSlotPickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  slot: string | null;
  setSlot: (slot: string) => void;
}

const MORNING_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"]
const AFTERNOON_SLOTS = ["12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM"]

export function TimeSlotPicker({ date, setDate, slot, setSlot }: TimeSlotPickerProps) {
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
            disabled={(date) => date < new Date()}
          />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold mb-3">Available Slots</h3>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {date ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Morning</h4>
                <div className="grid grid-cols-2 gap-2">
                  {MORNING_SLOTS.map(time => (
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
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Afternoon</h4>
                <div className="grid grid-cols-2 gap-2">
                  {AFTERNOON_SLOTS.map(time => (
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
            </div>
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
