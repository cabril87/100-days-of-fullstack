/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

/**
 * DTO for real-time family activity events sent via SignalR
 * Used for family activity streams and notifications
 * MATCHES: TaskTrackerAPI.DTOs.Family.FamilyActivityEventDTO
 */
export interface FamilyActivityEventDTO {
  /** ID of the family this activity belongs to */
  familyId: number;
  
  /** ID of the user who performed the activity */
  userId: number;
  
  /** Type of activity (task_completed, achievement_unlocked, etc.) */
  activityType: string;
  
  /** Human-readable description of the activity */
  description: string;
  
  /** Points earned from this activity (if applicable) */
  pointsEarned?: number;
  
  /** When the activity occurred */
  timestamp: Date;
  
  /** ID of related entity (task, achievement, etc.) */
  relatedEntityId?: number;
  
  /** Type of related entity (task, achievement, challenge, etc.) */
  relatedEntityType?: string;
  
  /** Priority level for activity importance */
  priority?: string;
  
  /** Category for grouping activities */
  category?: string;
  
  /** Display name of the user (for UI) */
  userDisplayName?: string;
  
  /** Icon or emoji to display with the activity */
  activityIcon?: string;
}

/**
 * DTO for real-time family milestone events sent via SignalR
 * Used for celebrating significant family achievements and progress
 * MATCHES: TaskTrackerAPI.DTOs.Family.FamilyMilestoneEventDTO
 */
export interface FamilyMilestoneEventDTO {
  /** ID of the family that achieved the milestone */
  familyId: number;
  
  /** Type of milestone (high_value_task_completion, family_streak, etc.) */
  milestoneType: string;
  
  /** Title of the milestone achievement */
  title: string;
  
  /** Detailed description of what was achieved */
  description: string;
  
  /** Points earned from this milestone (if applicable) */
  pointsEarned?: number;
  
  /** ID of the user who primarily achieved this milestone */
  achievedByUserId?: number;
  
  /** When the milestone was achieved */
  timestamp: Date;
  
  /** Celebration level (1-5, with 5 being the most exciting) */
  celebrationLevel?: number;
  
  /** Icon or emoji to display with the milestone */
  milestoneIcon?: string;
  
  /** Color theme for the milestone celebration */
  colorTheme?: string;
  
  /** Whether this milestone should trigger confetti */
  triggerConfetti?: boolean;
  
  /** Sound effect to play (optional) */
  soundEffect?: string;
}

/**
 * DTO for real-time task completion events sent via SignalR
 * Used for enhanced gamification and family notifications
 * MATCHES: TaskTrackerAPI.DTOs.Tasks.TaskCompletionEventDTO
 */
export interface TaskCompletionEventDTO {
  /** ID of the completed task */
  taskId: number;
  
  /** Title of the completed task */
  taskTitle: string;
  
  /** Display name of the user who completed the task */
  completedBy: string;
  
  /** ID of the user who completed the task */
  completedByUserId: number;
  
  /** Points earned for completing this task */
  pointsEarned: number;
  
  /** When the task was completed */
  completionTime: Date;
  
  /** Family ID if this is a family task */
  familyId?: number;
  
  /** Task category for achievement tracking */
  category: string;
  
  /** Task priority for celebration intensity */
  priority: string;
  
  /** Any achievement unlocked by this completion */
  achievementUnlocked?: string;
  
  /** Whether this completion triggered a level up */
  triggeredLevelUp?: boolean;
  
  /** New level if level up occurred */
  newLevel?: number;
} 