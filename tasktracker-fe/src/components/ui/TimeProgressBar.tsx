import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TimeProgressBarProps {
  dueDate: string | Date;
  isCompleted?: boolean;
  className?: string;
}

export function TimeProgressBar({ dueDate, isCompleted = false, className = '' }: TimeProgressBarProps) {
  const due = new Date(dueDate);
  const now = new Date();
  const createdAt = new Date(due.getTime() - (7 * 24 * 60 * 60 * 1000)); // Assume 7 days from creation to due
  
  // Calculate time metrics
  const totalDuration = due.getTime() - createdAt.getTime();
  const timeElapsed = now.getTime() - createdAt.getTime();
  const timeRemaining = due.getTime() - now.getTime();
  
  const progressPercentage = Math.min(100, Math.max(0, (timeElapsed / totalDuration) * 100));
  const isOverdue = timeRemaining < 0;
  const isDueSoon = timeRemaining > 0 && timeRemaining < (24 * 60 * 60 * 1000); // Due within 24 hours
  
  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const absMs = Math.abs(ms);
    const days = Math.floor(absMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((absMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((absMs % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  // Get status info
  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        label: 'Completed',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-700',
        progressColor: 'bg-gradient-to-r from-green-500 to-green-600',
        icon: CheckCircle2
      };
    }
    
    if (isOverdue) {
      return {
        label: `Overdue by ${formatTimeRemaining(timeRemaining)}`,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-700',
        progressColor: 'bg-gradient-to-r from-red-500 to-red-600',
        icon: AlertTriangle
      };
    }
    
    if (isDueSoon) {
      return {
        label: `Due in ${formatTimeRemaining(timeRemaining)}`,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-700',
        progressColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
        icon: Clock
      };
    }
    
    return {
      label: `${formatTimeRemaining(timeRemaining)} remaining`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      progressColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      icon: Clock
    };
  };
  
  const status = getStatusInfo();
  const IconComponent = status.icon;
  
  return (
    <div className={`p-3 rounded-lg border ${status.bgColor} ${status.borderColor} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${status.color}`} />
          <span className={`font-medium text-sm ${status.color}`}>
            Time Progress
          </span>
        </div>
        <span className={`text-xs ${status.color}`}>
          {status.label}
        </span>
      </div>
      
      <div className="space-y-2">
        <Progress value={isCompleted ? 100 : progressPercentage} className="h-2">
          <div 
            className={`h-full ${status.progressColor} rounded-full transition-all duration-500`}
            style={{ width: `${isCompleted ? 100 : progressPercentage}%` }} 
          />
        </Progress>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Started</span>
          <span className={status.color}>
            Due {due.toLocaleDateString()} at {due.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
} 
