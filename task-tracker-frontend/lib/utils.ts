import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { TaskStatus, TaskPriority } from "@/context/TaskContext"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date string to a readable format
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No date"
  try {
    return format(parseISO(dateStr), "PPP")
  } catch (error) {
    return "Invalid date"
  }
}

// Format duration in hours to a readable format
export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`
  } else if (hours < 24) {
    return `${hours.toFixed(1)} hr${hours === 1 ? '' : 's'}`
  } else {
    const days = hours / 24
    return `${days.toFixed(1)} day${days === 1 ? '' : 's'}`
  }
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

// Get color class for a task status
export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.ToDo:
      return "bg-gray-200 text-gray-800"
    case TaskStatus.InProgress:
      return "bg-blue-100 text-blue-800"
    case TaskStatus.Completed:
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-200 text-gray-800"
  }
}

// Get color class for a task priority
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 1:
      return "bg-gray-100 text-gray-800"
    case 2:
      return "bg-blue-100 text-blue-800"
    case 3:
      return "bg-yellow-100 text-yellow-800"
    case 4:
      return "bg-orange-100 text-orange-800"
    case 5:
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Get label for a task priority
export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 1:
      return "Very Low"
    case 2:
      return "Low"
    case 3:
      return "Medium"
    case 4:
      return "High"
    case 5:
      return "Urgent"
    default:
      return "Unknown"
  }
}
