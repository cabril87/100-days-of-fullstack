"use client"

import * as React from "react"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "./input"

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState(format(value || new Date(), "HH:mm"))

  // Update date/time when value changes
  React.useEffect(() => {
    if (value) {
      setDate(value)
      setTime(format(value, "HH:mm"))
    }
  }, [value])

  // Update the combined date/time when either changes
  React.useEffect(() => {
    if (date) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours || 0)
      newDate.setMinutes(minutes || 0)
      onChange(newDate)
    }
  }, [date, time, onChange])

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white border-gray-300",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="rounded-md border-0"
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center mt-2 sm:mt-0">
        <div className="flex items-center w-full sm:w-auto bg-white border border-gray-300 rounded-md px-3 py-1.5">
          <Clock className="h-4 w-4 text-gray-600 mr-2" />
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full sm:w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
    </div>
  )
} 