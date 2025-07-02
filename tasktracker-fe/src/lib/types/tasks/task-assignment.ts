/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 */

/**
 * Types of task assignments
 */
export enum TaskAssignmentType {
  Individual = 0,
  FamilyMember = 1,
  FamilyGroup = 2
}

/**
 * Status of task assignments
 */
export enum TaskAssignmentStatus {
  Pending = 0,
  Accepted = 1,
  Declined = 2,
  Completed = 3,
  Approved = 4,
  Rejected = 5
}

/**
 * Flexible DTO for task assignments - handles both individual and family assignments
 */
export interface TaskAssignmentDTO {
  /** Unique identifier for the assignment */
  id: number;
  
  /** Task ID being assigned */
  taskId: number;
  
  /** User ID the task is assigned to */
  assignedToUserId: number;
  
  /** User ID of who assigned the task */
  assignedByUserId: number;
  
  /** Date when the task was assigned */
  assignedAt: string;
  
  /** Notes about the assignment */
  notes?: string;
  
  /** Whether the assignment has been accepted */
  isAccepted: boolean;
  
  /** Date when the assignment was accepted */
  acceptedAt?: string;
  
  // Enhanced properties for family collaboration
  familyId?: number;
  familyMemberId?: number;
  assignedToUserName?: string;
  assignedByUserName?: string;
  taskTitle?: string;
  taskDescription?: string;
  taskDueDate?: string;
  taskPriority?: string;
  requiresApproval: boolean;
  approvedByUserId?: number;
  approvedAt?: string;
  approvalNotes?: string;
  
  /** Assignment type for flexibility */
  assignmentType: TaskAssignmentType;
  
  /** Status tracking */
  status: TaskAssignmentStatus;
}

/**
 * DTO for creating task assignments
 */
export interface CreateTaskAssignmentDTO {
  /** Task ID to assign */
  taskId: number;
  
  /** User ID to assign the task to */
  assignedToUserId: number;
  
  /** Optional notes about the assignment */
  notes?: string;
  
  requiresApproval?: boolean;
  
  // Family context (optional)
  familyId?: number;
  familyMemberId?: number;
  
  assignmentType?: TaskAssignmentType;
}

/**
 * DTO for batch task assignments
 */
export interface BatchAssignmentRequestDTO {
  /** List of task IDs to assign */
  taskIds: number[];
  
  /** User ID to assign the tasks to */
  assignedToUserId: number;
  
  /** Optional notes about the batch assignment */
  notes?: string;
  
  requiresApproval?: boolean;
  
  // Family context (optional)
  familyId?: number;
  familyMemberId?: number;
  
  assignmentType?: TaskAssignmentType;
} 