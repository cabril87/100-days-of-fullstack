/*
 * Calendar Conflict Detection Service
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Enterprise-grade conflict detection and resolution service
 * Following clean architecture patterns and explicit typing
 */

import { 
  ConflictingEventDTO, 
  ConflictResolutionDTO, 
  ConflictDetectionRequestDTO, 
  ConflictDetectionResponseDTO,
  CalendarEventDTO 
} from '@/lib/types/calendar';
import { FamilyTaskItemDTO } from '@/lib/types/task';

export class ConflictDetectionService {
  private static instance: ConflictDetectionService;

  public static getInstance(): ConflictDetectionService {
    if (!ConflictDetectionService.instance) {
      ConflictDetectionService.instance = new ConflictDetectionService();
    }
    return ConflictDetectionService.instance;
  }

  /**
   * Detect time conflicts between new event and existing items
   */
  public detectConflicts(request: ConflictDetectionRequestDTO): ConflictDetectionResponseDTO {
    const conflicts: ConflictingEventDTO[] = [];
    
    // Check event conflicts
    request.existingEvents.forEach(event => {
      if (request.excludeId && event.id.toString() === request.excludeId.toString()) {
        return;
      }
      
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate || event.startDate);
      
      if (this.isTimeOverlapping(request.newEventStart, request.newEventEnd, eventStart, eventEnd)) {
        conflicts.push({
          id: event.id,
          title: event.title,
          startTime: eventStart,
          endTime: eventEnd,
          type: 'event',
          conflictSeverity: this.calculateConflictSeverity(request.newEventStart, request.newEventEnd, eventStart, eventEnd)
        });
      }
    });
    
    // Check task conflicts
    request.existingTasks.forEach(task => {
      if (request.excludeId && task.id.toString() === request.excludeId.toString()) {
        return;
      }
      
      if (!task.dueDate) return;
      
      const taskTime = new Date(task.dueDate);
      // Estimate task duration (default 1 hour if not specified)
      const estimatedHours = 1; // Default since estimatedHours may not exist on FamilyTaskItemDTO
      const taskEnd = new Date(taskTime.getTime() + estimatedHours * 60 * 60 * 1000);
      
      if (this.isTimeOverlapping(request.newEventStart, request.newEventEnd, taskTime, taskEnd)) {
        conflicts.push({
          id: task.id,
          title: task.title,
          startTime: taskTime,
          endTime: taskEnd,
          type: 'task',
          priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
          conflictSeverity: this.calculateConflictSeverity(request.newEventStart, request.newEventEnd, taskTime, taskEnd)
        });
      }
    });
    
    const hasConflicts = conflicts.length > 0;
    const severity = this.calculateOverallSeverity(conflicts);
    const suggestedResolutions = hasConflicts 
      ? this.generateResolutions(conflicts, request.newEventStart, request.newEventEnd)
      : [];
    
    return {
      hasConflicts,
      conflicts,
      suggestedResolutions,
      severity,
      canProceed: !hasConflicts || request.userPreferences?.allowOverlapping || false
    };
  }

  /**
   * Check if two time ranges overlap
   */
  private isTimeOverlapping(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Calculate conflict severity based on overlap duration
   */
  private calculateConflictSeverity(
    newStart: Date, 
    newEnd: Date, 
    existingStart: Date, 
    existingEnd: Date
  ): 'low' | 'medium' | 'high' {
    const overlapStart = new Date(Math.max(newStart.getTime(), existingStart.getTime()));
    const overlapEnd = new Date(Math.min(newEnd.getTime(), existingEnd.getTime()));
    const overlapDuration = overlapEnd.getTime() - overlapStart.getTime();
    const newEventDuration = newEnd.getTime() - newStart.getTime();
    
    const overlapPercentage = overlapDuration / newEventDuration;
    
    if (overlapPercentage >= 0.8) return 'high';
    if (overlapPercentage >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Calculate overall conflict severity
   */
  private calculateOverallSeverity(conflicts: ConflictingEventDTO[]): 'none' | 'low' | 'medium' | 'high' {
    if (conflicts.length === 0) return 'none';
    
    const highSeverityCount = conflicts.filter(c => c.conflictSeverity === 'high').length;
    const mediumSeverityCount = conflicts.filter(c => c.conflictSeverity === 'medium').length;
    
    if (highSeverityCount > 0) return 'high';
    if (mediumSeverityCount > 0) return 'medium';
    return 'low';
  }

  /**
   * Generate smart resolution suggestions
   */
  private generateResolutions(
    conflicts: ConflictingEventDTO[],
    originalStart: Date,
    originalEnd: Date
  ): ConflictResolutionDTO[] {
    const resolutions: ConflictResolutionDTO[] = [];
    const duration = originalEnd.getTime() - originalStart.getTime();
    
    // Option 1: Move to next available time
    const bufferMinutes = 30;
    const nextAvailableTime = this.findNextAvailableSlot(conflicts, originalEnd, duration, bufferMinutes);
    
    if (nextAvailableTime) {
      resolutions.push({
        type: 'move',
        suggestedTime: {
          start: nextAvailableTime.toTimeString().slice(0, 5),
          end: new Date(nextAvailableTime.getTime() + duration).toTimeString().slice(0, 5)
        },
        message: `Move to ${nextAvailableTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}`,
        severity: 'info',
        autoApply: false
      });
    }
    
    // Option 2: Shorten if event is longer than 30 minutes
    if (duration > 30 * 60 * 1000) {
      const earliestConflict = Math.min(...conflicts.map(c => c.startTime.getTime()));
      if (earliestConflict > originalStart.getTime()) {
        resolutions.push({
          type: 'shorten',
          suggestedTime: {
            start: originalStart.toTimeString().slice(0, 5),
            end: new Date(earliestConflict - 5 * 60 * 1000).toTimeString().slice(0, 5) // 5 min buffer
          },
          message: 'Shorten to fit before first conflict',
          severity: 'warning',
          autoApply: false
        });
      }
    }
    
    // Option 3: Create anyway (ignore conflicts)
    resolutions.push({
      type: 'ignore',
      message: `Create anyway (${conflicts.length} conflict${conflicts.length > 1 ? 's' : ''})`,
      severity: conflicts.some(c => c.conflictSeverity === 'high') ? 'error' : 'warning',
      autoApply: false
    });
    
    // Option 4: Cancel and reschedule
    resolutions.push({
      type: 'cancel',
      message: 'Cancel and choose different time',
      severity: 'info',
      autoApply: false
    });
    
    return resolutions;
  }

  /**
   * Find next available time slot
   */
  private findNextAvailableSlot(
    conflicts: ConflictingEventDTO[],
    preferredStart: Date,
    duration: number,
    bufferMinutes: number
  ): Date | null {
    // Simple implementation: add buffer after the latest conflicting event
    const latestConflictEnd = Math.max(...conflicts.map(c => c.endTime.getTime()));
    const nextSlot = new Date(latestConflictEnd + bufferMinutes * 60 * 1000);
    
    // Check if the suggested time is within reasonable business hours (8 AM - 8 PM)
    const suggestedHour = nextSlot.getHours();
    if (suggestedHour >= 8 && suggestedHour <= 20) {
      return nextSlot;
    }
    
    return null;
  }
}

// Export singleton instance
export const conflictDetectionService = ConflictDetectionService.getInstance(); 