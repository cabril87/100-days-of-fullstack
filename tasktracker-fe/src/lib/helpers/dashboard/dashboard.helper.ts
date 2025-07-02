/*
 * Dashboard Helper Functions
 * Extracted utility functions from Dashboard component
 * Following .cursorrules compliance standards
 */

import { DashboardStats } from '@/lib/props/components/main.props';

// ================================
// DASHBOARD CALCULATIONS
// ================================

/**
 * Calculates the user's level based on total points
 * Each level requires 100 points more than the previous
 */
export const calculateLevel = (points: number): number => {
  return Math.floor((points || 0) / 100) + 1;
};

/**
 * Calculates progress towards next level
 * Returns percentage (0-100) of progress to next level
 */
export const calculateProgress = (points: number): number => {
  return ((points || 0) % 100);
};

/**
 * Safely gets priority display string from various input types
 * Handles null, undefined, empty string, numbers, and strings
 */
export const getPriorityDisplay = (priority: string | number | undefined | null): string => {
  // Handle null, undefined, empty string - but allow 0 since it's valid (Low priority)
  if (priority === null || priority === undefined || priority === '') return '';

  // Convert to string first, then try to parse as number
  const priorityStr = String(priority).trim();

  // Try to parse as number first (handles "0", "1", "2", "3", 0, 1, 2, 3)
  const numPriority = parseInt(priorityStr, 10);
  if (!isNaN(numPriority) && numPriority >= 0 && numPriority <= 3) {
    return priorityIntToString(numPriority);
  }

  // If it's already a valid priority string, return it
  const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  if (validPriorities.includes(priorityStr)) {
    return priorityStr;
  }

  // If we still don't have a valid priority, don't show it
  return '';
};

/**
 * Converts priority integer to string representation
 */
export const priorityIntToString = (priority: number): string => {
  switch (priority) {
    case 0: return 'Low';
    case 1: return 'Medium';
    case 2: return 'High';
    case 3: return 'Urgent';
    default: return 'Low';
  }
};

// ================================
// ACHIEVEMENT BADGES CALCULATION
// ================================

/**
 * Calculates achievement badges based on dashboard stats
 * Returns array of earned badges with icons and titles
 */
export const getAchievementBadges = (
  dashboardStats: DashboardStats, 
  familyTaskStats?: { 
    memberStats: Array<{ tasksCompleted: number }>; 
    completedTasks?: number; 
    familyScore?: number; 
  }
) => {
  const badges = [];
  
  // Individual achievements
  if ((dashboardStats.streakDays || 0) >= 7) {
    badges.push({ icon: '🔥', title: 'Week Warrior', description: '7+ day streak' });
  }
  if ((dashboardStats.tasksCompleted || 0) >= 50) {
    badges.push({ icon: '💎', title: 'Task Master', description: '50+ tasks completed' });
  }
  if ((dashboardStats.totalPoints || 0) >= 500) {
    badges.push({ icon: '👑', title: 'Points King', description: '500+ points earned' });
  }
  if ((dashboardStats.tasksCompleted || 0) >= 100) {
    badges.push({ icon: '🏆', title: 'Centurion', description: '100+ tasks completed' });
  }
  if ((dashboardStats.familyMembers || 0) >= 5) {
    badges.push({ icon: '👨‍👩‍👧‍👦', title: 'Family Leader', description: '5+ family members' });
  }

  // Family collaboration achievements
  if (familyTaskStats?.memberStats.some(m => m.tasksCompleted >= 10)) {
    badges.push({ icon: '🤝', title: 'Team Player', description: 'High family collaboration' });
  }
  if ((familyTaskStats?.completedTasks || 0) >= 20) {
    badges.push({ icon: '👨‍👩‍👧‍👦', title: 'Family Achiever', description: '20+ family tasks completed' });
  }
  if ((familyTaskStats?.familyScore || 0) >= 1000) {
    badges.push({ icon: '⭐', title: 'Star Family', description: 'Family score over 1000' });
  }

  return badges;
};

// ================================
// FAMILY TASK CALCULATIONS
// ================================

/**
 * Calculates family task counts and statistics
 */
export const calculateFamilyTaskCounts = (
  familyTasks: Array<{
    assignedToFamilyMemberId?: number;
    assignedByUserId?: number;
    requiresApproval?: boolean;
    status?: string;
    approvedByUserId?: number;
  }>, 
  familyMembers: Array<{ id: number; userId?: number }>, 
  userId?: number
) => {
  const counts = {
    family: familyTasks.length,
    assignedToMe: 0,
    iAssigned: 0,
    pendingApproval: 0
  };

  familyTasks.forEach((task) => {
    // Tasks assigned to current user
    if (task.assignedToFamilyMemberId && 
        familyMembers.find(m => m.id === task.assignedToFamilyMemberId)?.userId === userId) {
      counts.assignedToMe++;
    }

    // Tasks assigned by current user
    if (task.assignedByUserId === userId) {
      counts.iAssigned++;
    }

    // Tasks pending approval
    if (task.requiresApproval && task.status === 'completed' && !task.approvedByUserId) {
      counts.pendingApproval++;
    }
  });

  return counts;
};

// ================================
// DASHBOARD STATE HELPERS
// ================================

/**
 * Initializes dashboard stats with default values
 */
export const initializeDashboardStats = (initialData?: { stats?: Partial<DashboardStats> }): DashboardStats => {
  return {
    tasksCompleted: initialData?.stats?.tasksCompleted || 0,
    activeGoals: initialData?.stats?.activeGoals || 0,
    focusTime: initialData?.stats?.focusTime || 0,
    totalPoints: initialData?.stats?.totalPoints || 0,
    streakDays: initialData?.stats?.streakDays || 0,
    familyMembers: initialData?.stats?.familyMembers || 0,
    familyTasks: initialData?.stats?.familyTasks || 0,
    familyPoints: initialData?.stats?.familyPoints || 0,
    totalFamilies: initialData?.stats?.totalFamilies || 0
  };
};

/**
 * Merges dashboard stats safely, handling undefined values
 */
export const mergeDashboardStats = (
  current: DashboardStats, 
  updates: Partial<DashboardStats>
): DashboardStats => {
  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    )
  };
};

// ================================
// MEMBER MANAGEMENT HELPERS
// ================================

/**
 * Gets family member by ID with safe error handling
 */
export const getMemberById = (
  familyMembers: Array<{ id: number; userId?: number; name?: string }>, 
  memberId: number | string
) => {
  return familyMembers.find(m => m.id === Number(memberId));
};

/**
 * Formats task title for display with length limit
 */
export const formatTaskTitle = (title: string, maxLength: number = 50): string => {
  if (!title) return 'Untitled Task';
  return title.length > maxLength ? `${title.substring(0, maxLength)}...` : title;
};

/**
 * Gets display name for family member
 */
export const getMemberDisplayName = (
  member: { name?: string; username?: string; email?: string } | null | undefined
): string => {
  if (!member) return 'Unknown Member';
  return member.name || member.username || member.email || 'Unknown Member';
};

// ================================
// GAMIFICATION HELPERS
// ================================

/**
 * Calculates XP needed for next level
 */
export const getXPToNextLevel = (currentPoints: number): number => {
  const currentLevel = calculateLevel(currentPoints);
  const nextLevelPoints = currentLevel * 100;
  return nextLevelPoints - currentPoints;
};

/**
 * Gets level color based on current level
 */
export const getLevelColor = (level: number): string => {
  if (level < 5) return 'text-gray-600';
  if (level < 10) return 'text-blue-600';
  if (level < 20) return 'text-purple-600';
  if (level < 50) return 'text-gold-600';
  return 'text-red-600';
};

/**
 * Formats points display with appropriate units
 */
export const formatPoints = (points: number): string => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
  return points.toLocaleString();
}; 