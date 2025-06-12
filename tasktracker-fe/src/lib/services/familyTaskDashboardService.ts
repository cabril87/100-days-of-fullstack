/*
 * Family Task Dashboard Service
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Real API integration for family task collaboration dashboard
 * Following Family Auth Implementation Checklist rules - NO MOCK DATA
 */

import { taskService } from './taskService';
import { 
  FamilyTaskStats, 
  MemberTaskStats, 
  FamilyAchievement, 
  SharedGoal,
  FamilyTaskActivity,
  FamilyTaskCollaborationMetrics 
} from '../types/family-task';
import { FamilyMemberDTO } from '../types/family-invitation';
import { FamilyTaskItemDTO } from '../types/task';

/**
 * Service for family task dashboard data aggregation
 * Combines data from multiple backend endpoints to build comprehensive dashboard
 */
export class FamilyTaskDashboardService {
  
  /**
   * Get comprehensive family task statistics
   * Aggregates data from multiple backend endpoints
   */
  async getFamilyTaskStats(familyId: number, familyMembers: FamilyMemberDTO[]): Promise<FamilyTaskStats> {
    try {
      console.log(`📊 Loading family task stats for family ${familyId}`);
      
      // Get basic family stats from backend
      const basicStats = await taskService.getFamilyTaskStats(familyId);
      console.log('📈 Basic stats:', basicStats);
      
      // Get all family tasks for detailed analysis
      const familyTasks = await taskService.getFamilyTasks(familyId);
      console.log(`📋 Family tasks: ${familyTasks.length} total`);
      
      // Calculate enhanced statistics
      const overdueTasks = familyTasks.filter(task => 
        !task.isCompleted && 
        task.dueDate && 
        new Date(task.dueDate) < new Date()
      ).length;
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const tasksCompletedThisWeek = familyTasks.filter(task => 
        task.isCompleted && 
        task.completedAt && 
        new Date(task.completedAt) >= weekStart
      ).length;
      
      const weeklyProgress = basicStats.totalTasks > 0 
        ? Math.round((tasksCompletedThisWeek / basicStats.totalTasks) * 100)
        : 0;
      
      // Calculate family score (total points earned)
      const familyScore = familyTasks.reduce((total, task) => total + (task.pointsEarned || 0), 0);
      
      // Build member statistics
      const memberStats = await this.buildMemberStats(familyId, familyMembers, familyTasks);
      
      // Get recent achievements (simplified for now - TODO: add achievements API)
      const recentAchievements = await this.getRecentAchievements(familyId);
      
      // Get shared goals (simplified for now - TODO: add goals API)
      const sharedGoals = await this.getSharedGoals(familyId, familyMembers);
      
      const result: FamilyTaskStats = {
        totalTasks: basicStats.totalTasks,
        completedTasks: basicStats.completedTasks,
        overdueTasks,
        weeklyProgress,
        familyScore,
        memberStats,
        recentAchievements,
        sharedGoals
      };
      
      console.log('✅ Family task stats loaded:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to load family task stats:', error);
      // Return empty stats on error - no mock data fallback
      return {
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        weeklyProgress: 0,
        familyScore: 0,
        memberStats: [],
        recentAchievements: [],
        sharedGoals: []
      };
    }
  }
  
  /**
   * Build member task statistics from real API data
   */
  private async buildMemberStats(
    familyId: number, 
    familyMembers: FamilyMemberDTO[], 
    familyTasks: FamilyTaskItemDTO[]
  ): Promise<MemberTaskStats[]> {
    try {
      const memberStats: MemberTaskStats[] = [];
      
      for (const member of familyMembers) {
        // Get tasks assigned to this member
        const memberTasks = familyTasks.filter(task => 
          task.assignedToFamilyMemberId === member.id
        );
        
        const completedTasks = memberTasks.filter(task => task.isCompleted);
        const completionRate = memberTasks.length > 0 
          ? Math.round((completedTasks.length / memberTasks.length) * 100)
          : 0;
        
        // Calculate streak (consecutive days with completed tasks)
        const streak = this.calculateMemberStreak(completedTasks);
        
        // Calculate points earned
        const points = memberTasks.reduce((total, task) => total + (task.pointsEarned || 0), 0);
        
        // Calculate level based on points (every 100 points = 1 level)
        const level = Math.floor(points / 100) + 1;
        
        // Extract role name properly from role object
        let roleName = 'Member';
        if (typeof member.role === 'string') {
          roleName = member.role;
        } else if (member.role && typeof member.role === 'object' && 'name' in member.role) {
          const roleObj = member.role as { name: string };
          roleName = roleObj.name;
        }
        
        // Extract member name properly
        let memberName = 'Unknown Member';
        if (typeof member.user === 'string') {
          memberName = member.user;
        } else if (member.user && typeof member.user === 'object') {
          memberName = member.user.displayName || member.user.firstName || member.user.username || member.user.email || roleName;
        }
        
        console.log('👤 Building member stats:', {
          memberId: member.id,
          memberName,
          roleName,
          rawRole: member.role,
          rawUser: member.user
        });

        memberStats.push({
          memberId: member.id.toString(),
          name: memberName,
          avatar: undefined, // TODO: Add avatar support when User type includes it
          role: roleName,
          tasksCompleted: completedTasks.length,
          tasksTotal: memberTasks.length,
          points,
          streak,
          completionRate,
          level
        });
      }
      
      return memberStats;
    } catch (error) {
      console.error('❌ Failed to build member stats:', error);
      return [];
    }
  }
  
  /**
   * Calculate member's consecutive completion streak
   */
  private calculateMemberStreak(completedTasks: FamilyTaskItemDTO[]): number {
    if (completedTasks.length === 0) return 0;
    
    // Sort by completion date (most recent first)
    const sortedTasks = completedTasks
      .filter(task => task.completedAt && task.completedAt.trim() !== '')
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
    
    if (sortedTasks.length === 0) return 0;
    
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const task of sortedTasks) {
      if (!task.completedAt) continue;
      
      const taskDate = new Date(task.completedAt);
      taskDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  /**
   * Get recent family achievements
   * TODO: Replace with real achievements API when available
   */
  private async getRecentAchievements(familyId: number): Promise<FamilyAchievement[]> {
    try {
      // For now, generate achievements based on actual task completion data
      // TODO: Replace with real achievements API call
      
      const achievements: FamilyAchievement[] = [];
      
      // Check if family has completed tasks this week
      const familyTasks = await taskService.getFamilyTasks(familyId);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const weeklyCompletions = familyTasks.filter(task => 
        task.isCompleted && 
        task.completedAt && 
        new Date(task.completedAt) >= weekStart
      );
      
      if (weeklyCompletions.length >= 5) {
        achievements.push({
          id: `weekly-${familyId}-${weekStart.getTime()}`,
          title: 'Team Player',
          description: `Completed ${weeklyCompletions.length} family tasks this week`,
          icon: '🤝',
          unlockedAt: new Date(),
          unlockedBy: 'Family',
          points: 100
        });
      }
      
      // Check for high completion family
      const completionRate = familyTasks.length > 0 
        ? (familyTasks.filter(t => t.isCompleted).length / familyTasks.length) * 100
        : 0;
      
      if (completionRate >= 80) {
        achievements.push({
          id: `completion-${familyId}`,
          title: 'Family Champions',
          description: `Achieved ${Math.round(completionRate)}% task completion rate`,
          icon: '🏆',
          unlockedAt: new Date(),
          unlockedBy: 'Family',
          points: 250
        });
      }
      
      return achievements;
    } catch (error) {
      console.error('❌ Failed to load achievements:', error);
      return [];
    }
  }
  
  /**
   * Get shared family goals
   * TODO: Replace with real goals API when available
   */
  private async getSharedGoals(familyId: number, familyMembers: FamilyMemberDTO[]): Promise<SharedGoal[]> {
    try {
      // For now, generate goals based on actual family data
      // TODO: Replace with real goals API call
      
      const goals: SharedGoal[] = [];
      const familyTasks = await taskService.getFamilyTasks(familyId);
      
      // Weekly completion goal
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const weeklyCompletions = familyTasks.filter(task => 
        task.isCompleted && 
        task.completedAt && 
        new Date(task.completedAt) >= weekStart
      ).length;
      
      const weeklyTarget = Math.max(10, familyMembers.length * 3); // Dynamic target based on family size
      
      goals.push({
        id: `weekly-${familyId}`,
        title: 'Weekly Family Goals',
        description: 'Complete family tasks together this week',
        progress: weeklyCompletions,
        target: weeklyTarget,
        deadline: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000), // End of week
        participants: familyMembers.map(m => m.id.toString()),
        reward: 500
      });
      
      // Study goal for children/teens
      const studyMembers = familyMembers.filter(m => m.user.ageGroup === 1); // Teens
      if (studyMembers.length > 0) {
        const studyTasks = familyTasks.filter(task => 
          task.title.toLowerCase().includes('homework') || 
          task.title.toLowerCase().includes('study')
        );
        
        const completedStudyTasks = studyTasks.filter(task => task.isCompleted).length;
        
        goals.push({
          id: `study-${familyId}`,
          title: 'Study Squad Success',
          description: 'Complete all study-related tasks',
          progress: completedStudyTasks,
          target: Math.max(5, studyMembers.length * 2),
          participants: studyMembers.map(m => m.id.toString()),
          reward: 300
        });
      }
      
      return goals;
    } catch (error) {
      console.error('❌ Failed to load shared goals:', error);
      return [];
    }
  }
  
  /**
   * Get family task activity feed
   */
  async getFamilyTaskActivity(familyId: number, limit: number = 10): Promise<FamilyTaskActivity[]> {
    try {
      // TODO: Implement when backend has activity/audit log endpoints
      console.log(`📜 Loading family task activity for family ${familyId} (limit: ${limit})`);
      
      // For now, return empty array - no mock data
      return [];
    } catch (error) {
      console.error('❌ Failed to load family task activity:', error);
      return [];
    }
  }
  
  /**
   * Get family collaboration metrics
   */
  async getFamilyCollaborationMetrics(familyId: number): Promise<FamilyTaskCollaborationMetrics> {
    try {
      const familyTasks = await taskService.getFamilyTasks(familyId);
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const weeklyCollaborations = familyTasks.filter(task => 
        task.assignedToFamilyMemberId && 
        task.createdAt && 
        new Date(task.createdAt) >= weekStart
      ).length;
      
      const totalAssignments = familyTasks.filter(task => task.assignedToFamilyMemberId).length;
      const completedAssignments = familyTasks.filter(task => 
        task.assignedToFamilyMemberId && task.isCompleted
      ).length;
      
      const completionRate = totalAssignments > 0 
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;
      
      return {
        weeklyCollaborations,
        totalAssignments,
        completionRate,
        avgResponseTime: 0, // TODO: Calculate when we have task assignment timestamps
        topCollaborator: 'Unknown', // TODO: Calculate from member stats
        familyEfficiencyScore: completionRate
      };
    } catch (error) {
      console.error('❌ Failed to load collaboration metrics:', error);
      return {
        weeklyCollaborations: 0,
        totalAssignments: 0,
        completionRate: 0,
        avgResponseTime: 0,
        topCollaborator: 'Unknown',
        familyEfficiencyScore: 0
      };
    }
  }
}

// Export singleton instance
export const familyTaskDashboardService = new FamilyTaskDashboardService(); 