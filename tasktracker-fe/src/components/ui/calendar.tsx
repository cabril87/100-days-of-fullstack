"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("w-full", className)}
        classNames={{
          months: "flex flex-col sm:flex-row gap-4",
          month: "flex flex-col gap-4",
          caption: "flex justify-center pt-2 relative items-center w-full mb-4",
          caption_label: "text-lg font-semibold text-gray-900 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
          nav: "flex items-center gap-2",
          nav_button: cn(
            "size-9 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-0 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "flex mb-2",
          head_cell: "text-gray-600 rounded-lg w-10 h-10 font-semibold text-sm flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 mx-0.5",
          row: "flex w-full mt-1",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 mx-0.5",
            props.mode === "range"
              ? "[&:has(>.day-range-end)]:rounded-r-lg [&:has(>.day-range-start)]:rounded-l-lg first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
              : "[&:has([aria-selected])]:rounded-lg"
          ),
          day: cn(
            "size-10 p-0 font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md border border-transparent hover:border-purple-200"
          ),
          day_range_start:
            "day-range-start aria-selected:bg-gradient-to-r aria-selected:from-purple-500 aria-selected:to-purple-600 aria-selected:text-white aria-selected:shadow-lg",
          day_range_end:
            "day-range-end aria-selected:bg-gradient-to-r aria-selected:from-purple-500 aria-selected:to-purple-600 aria-selected:text-white aria-selected:shadow-lg",
          day_selected:
            "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 focus:from-purple-600 focus:to-purple-700 shadow-lg border-purple-300",
          day_today: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 font-bold border-blue-300 shadow-sm",
          day_outside:
            "day-outside text-gray-400 hover:text-gray-600 hover:bg-gray-50",
          day_disabled: "text-gray-300 opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
          day_range_middle:
            "aria-selected:bg-gradient-to-r aria-selected:from-purple-100 aria-selected:to-purple-200 aria-selected:text-purple-800",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          Chevron: ({ orientation, ...props }) => {
            const Icon = orientation === "left" ? ChevronLeft : ChevronRight
            return <Icon className="size-5" {...props} />
          },
        }}
        {...props}
      />
    </div>
  )
}

export { Calendar }