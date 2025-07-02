/*
 * Task Core Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Core task-related types following .cursorrules standards
 */

// ================================
// CORE TASK TYPES
// ================================

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory = 'work' | 'personal' | 'family' | 'health' | 'education' | 'other';

// ================================
// TASK STATE TYPES
// ================================

export type TaskFilterType = 'all' | 'pending' | 'completed' | 'overdue' | 'assigned_to_me';

export type TaskSortType = 'due_date' | 'priority' | 'created_date' | 'title' | 'status';

export type TaskViewType = 'list' | 'kanban' | 'calendar' | 'timeline';

// ================================
// TASK OPERATION TYPES
// ================================

export type TaskOperation = 'create' | 'update' | 'delete' | 'complete' | 'assign' | 'duplicate';

export type TaskBulkOperation = 'complete' | 'delete' | 'assign' | 'change_status' | 'change_priority';

// ================================
// TASK ANALYTICS TYPES
// ================================

export type TaskMetricType = 'completion_rate' | 'average_completion_time' | 'overdue_rate' | 'productivity_score';

export type TaskTimeframe = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// ================================
// TASK ATTACHMENT TYPES
// ================================

export type AttachmentType = 'image' | 'document' | 'video' | 'audio' | 'link' | 'other';

export type AttachmentStatus = 'uploading' | 'uploaded' | 'failed' | 'processing' | 'ready';

// ================================
// TASK NOTIFICATION TYPES
// ================================

export type TaskNotificationType = 'due_soon' | 'overdue' | 'completed' | 'assigned' | 'commented' | 'updated';

export type NotificationFrequency = 'immediate' | 'daily' | 'weekly' | 'never';

// ================================
// TASK PERMISSION TYPES
// ================================

export type TaskPermission = 'view' | 'edit' | 'delete' | 'assign' | 'complete' | 'comment';

export type TaskPermissionLevel = 'owner' | 'editor' | 'viewer' | 'assignee'; 