/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Dashboard Component Props - .cursorrules compliant
 * 
 * MANDATORY: ALL component props interfaces MUST be in lib/props/
 * NO EXCEPTIONS - ZERO TOLERANCE POLICY
 */

import { ReactNode } from 'react';
import type { 
  FamilyDTO, 
  FamilyActivityItem, 
  UserProgress,
  FamilyMemberDTO,
  FamilyTaskStats 
} from '@/lib/types';
import type { Task } from '@/lib/types/tasks';
import type { UseGamificationEventsReturn } from '@/lib/types/gamification';
import type { FamilyMemberAgeGroup } from '@/lib/types/auth';

// ============================================================================
// DASHBOARD CORE PROPS
// ============================================================================

export interface DashboardStats {
  tasksCompleted: number;
  activeGoals: number;
  focusTime: number;
  totalPoints: number;
  streakDays: number;
  familyMembers: number;
  familyTasks: number;
  familyPoints: number;
  totalFamilies: number;
}

export interface DashboardInitialData {
  stats: DashboardStats;
  family: FamilyDTO | null;
  recentTasks: Task[];
}

export interface DashboardProps {
  user: { 
    id: number; 
    username: string; 
    email: string; 
  };
  initialData?: DashboardInitialData;
}

export interface DashboardContentProps {
  user: { 
    id: number; 
    username: string; 
    email: string; 
    ageGroup?: FamilyMemberAgeGroup;
  };
  initialData?: DashboardInitialData;
}

// ============================================================================
// AGE-SPECIFIC DASHBOARD PROPS
// ============================================================================

export interface TeenDashboardProps extends DashboardContentProps {
  onTaskComplete: (taskId: number) => void;
  onRequestPermission: (action: string, description: string) => void;
}

export interface KidDashboardProps extends DashboardContentProps {
  onTaskComplete: (taskId: number) => void;
  onRequestPermission: (action: string, description: string) => void;
}

// ============================================================================
// DASHBOARD WIDGET PROPS
// ============================================================================

export interface AnalyticsDashboardWidgetProps {
  userId: number;
  className?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  showDetails?: boolean;
  refreshInterval?: number;
}

export interface FocusModeDashboardWidgetProps {
  userId: number;
  className?: string;
  showQuickStart?: boolean;
  compactMode?: boolean;
}

// ============================================================================
// PERMISSION MODAL PROPS
// ============================================================================

export interface PermissionRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  permissionType: 'camera' | 'microphone' | 'location' | 'notifications' | 'storage';
  title: string;
  description: string;
  onGrant: () => void;
  onDeny: () => void;
  showRememberChoice?: boolean;
} 