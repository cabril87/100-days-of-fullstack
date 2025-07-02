/*
 * Board Core Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Core board-related types following .cursorrules standards
 */

// ================================
// BOARD CORE TYPES
// ================================

export type BoardType = 'kanban' | 'scrum' | 'personal' | 'family' | 'project';

export type BoardVisibility = 'private' | 'family' | 'public';

export type BoardStatus = 'active' | 'archived' | 'deleted';

// ================================
// BOARD LAYOUT TYPES
// ================================

export type BoardLayout = 'columns' | 'timeline' | 'calendar' | 'list';

export type ColumnLayout = 'standard' | 'compact' | 'detailed';

// ================================
// BOARD PERMISSION TYPES
// ================================

export type BoardPermission = 'view' | 'edit' | 'admin' | 'owner';

export type BoardRole = 'owner' | 'admin' | 'member' | 'viewer';

// ================================
// BOARD TEMPLATE TYPES
// ================================

export type BoardTemplate = 
  | 'personal_tasks'
  | 'family_chores'
  | 'project_management'
  | 'habit_tracker'
  | 'meal_planning'
  | 'homework_tracker'
  | 'event_planning'
  | 'goal_tracking'
  | 'custom';

// ================================
// BOARD OPERATION TYPES
// ================================

export type BoardOperation = 'create' | 'update' | 'delete' | 'archive' | 'duplicate' | 'share';

export type ColumnOperation = 'create' | 'update' | 'delete' | 'reorder' | 'move_tasks';

// ================================
// BOARD FILTER TYPES
// ================================

export type BoardFilterType = 'all' | 'my_boards' | 'family_boards' | 'archived' | 'templates';

export type BoardSortType = 'name' | 'created_date' | 'updated_date' | 'task_count' | 'activity';

// ================================
// BOARD ANALYTICS TYPES
// ================================

export type BoardMetricType = 'task_completion' | 'member_activity' | 'productivity_trend' | 'goal_progress';

export type BoardReportType = 'summary' | 'detailed' | 'productivity' | 'family_overview'; 