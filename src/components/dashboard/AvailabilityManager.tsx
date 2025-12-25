"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12;
  const ampm = i < 12 ? "AM" : "PM";
  return `${hour}:00 ${ampm}`;
})

export function AvailabilityManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>Set your available hours for video consultations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center justify-between pb-4 border-b last:border-0">
            <div className="flex items-center gap-4">
              <Switch id={`switch-${day}`} defaultChecked={day !== "Sunday" && day !== "Saturday"} />
              <Label htmlFor={`switch-${day}`} className="w-24 font-medium">{day}</Label>
            </div>
            <div className="flex items-center gap-2">
              <TimeSelect defaultValue="09:00 AM" />
              <span className="text-muted-foreground">-</span>
              <TimeSelect defaultValue="05:00 PM" />
            </div>
          </div>
        ))}
      </CardContent>
      <div className="p-6 pt-0 flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </Card>
  )
}

function TimeSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger className="w-27.5">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {HOURS.map(h => (
          <SelectItem key={h} value={h}>{h}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
