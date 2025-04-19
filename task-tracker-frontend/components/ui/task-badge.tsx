import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "./badge";
import { TaskPriority, TaskStatus } from "@/context/TaskContext";

// Extended badge props with task-specific properties
export interface TaskBadgeProps extends BadgeProps {
  priority?: TaskPriority;
  status?: TaskStatus;
  type?: "priority" | "status" | "category";
  animated?: boolean;
}

export function TaskBadge({ 
  priority,
  status,
  type = "priority",
  animated = false,
  className,
  variant = "default",
  children,
  ...props 
}: TaskBadgeProps) {
  // Determine the appropriate styling based on the badge type
  const getBadgeStyles = (): string => {
    if (type === "priority" && priority !== undefined) {
      switch (priority) {
        case 1: return "bg-gray-100 text-gray-800 border-gray-300";
        case 2: return "bg-blue-100 text-blue-800 border-blue-300";
        case 3: return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case 4: return "bg-orange-100 text-orange-800 border-orange-300";
        case 5: return "bg-red-100 text-red-800 border-red-300 animate-pulse";
        default: return "bg-gray-100 text-gray-800 border-gray-300";
      }
    } else if (type === "status" && status !== undefined) {
      switch (status) {
        case TaskStatus.ToDo: return "bg-gray-100 text-gray-800 border-gray-300";
        case TaskStatus.InProgress: return "bg-blue-100 text-blue-800 border-blue-300";
        case TaskStatus.Completed: return "bg-green-100 text-green-800 border-green-300";
        default: return "bg-gray-100 text-gray-800 border-gray-300";
      }
    } else if (type === "category") {
      return "bg-purple-100 text-purple-800 border-purple-300";
    }
    
    return "";
  };

  // Get the appropriate content if not provided
  const getContent = (): React.ReactNode => {
    if (children) return children;
    
    if (type === "priority" && priority !== undefined) {
      switch (priority) {
        case 1: return "Very Low";
        case 2: return "Low";
        case 3: return "Medium";
        case 4: return "High";
        case 5: return "Urgent";
        default: return "Unknown";
      }
    } else if (type === "status" && status !== undefined) {
      switch (status) {
        case TaskStatus.ToDo: return "To Do";
        case TaskStatus.InProgress: return "In Progress";
        case TaskStatus.Completed: return "Completed";
        default: return "Unknown";
      }
    }
    
    return children;
  };

  const animationClass = animated && priority === 5 ? "animate-pulse" : "";
  
  return (
    <Badge
      variant="outline"
      className={cn(getBadgeStyles(), animationClass, className)}
      {...props}
    >
      {getContent()}
    </Badge>
  );
} 