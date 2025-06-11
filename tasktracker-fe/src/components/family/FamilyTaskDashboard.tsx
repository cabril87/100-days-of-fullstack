'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Trophy, 
  Target, 
  Clock, 
  Calendar,
  Sparkles,
  Crown,
  Star,
  ArrowRight,
  CheckCircle,
  Flame,
  Zap,
  Activity
} from 'lucide-react';
import { FamilyTaskItemDTO, FamilyTaskStats, FamilyMemberTaskStats } from '@/lib/types/task';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family-invitation';
import { taskService } from '@/lib/services/taskService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { formatDistance } from 'date-fns';

interface FamilyTaskDashboardProps {
  user: any;
  family: FamilyDTO;
  onTaskAssign?: (taskId: number, memberId: number) => void;
}

export default function FamilyTaskDashboard({ user, family, onTaskAssign }: FamilyTaskDashboardProps) {
  const [familyTasks, setFamilyTasks] = useState<FamilyTaskItemDTO[]>([]);
  const [familyStats, setFamilyStats] = useState<FamilyTaskStats | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyTaskData();
  }, [family.id]);

  const loadFamilyTaskData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [tasks, basicStats, members] = await Promise.all([
        taskService.getFamilyTasks(family.id),
        taskService.getFamilyTaskStats(family.id),
        familyInvitationService.getFamilyMembers(family.id)
      ]);

      // Debug: Log what we're getting from the API
      console.log(`🔍 Family ${family.id} (${family.name}) - Members returned:`, members);
      console.log(`📊 Member count: ${members.length}`);
      console.log(`👥 Members details:`, members.map(m => ({ 
        id: m.id, 
        userId: m.userId, 
        name: m.user?.firstName || m.user?.username 
      })));

      // Transform basic stats to enhanced format for compatibility
      // Handle the fact that the API returns fallback data with default values
      const stats: FamilyTaskStats = {
        totalTasks: basicStats.totalTasks || 0,
        completedTasks: basicStats.completedTasks || 0,
        totalPoints: 0, // Not provided by the basic endpoint
        memberStats: members.map(member => ({
          memberId: member.id,
          memberName: member.user?.firstName || member.user?.username || 'Unknown',
          tasksCompleted: 0, // We don't have individual task completion data yet
          pointsEarned: member.user?.points || 0,
          tasksAssigned: 0, // We don't have individual task assignment data yet
          completionRate: 0 // We don't have individual completion rate data yet
        }))
      };

      setFamilyTasks(tasks);
      setFamilyStats(stats);
      setFamilyMembers(members);
    } catch (error) {
      console.error('Failed to load family task data:', error);
      setError('Failed to load family task data');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecentTasks = () => {
    return familyTasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getTopPerformers = () => {
    if (!familyStats?.memberStats) return [];
    return [...familyStats.memberStats]
      .sort((a, b) => b.pointsEarned - a.pointsEarned)
      .slice(0, 3);
  };

  // Gamification: Family Achievement System
  const getFamilyAchievements = () => {
    const achievements = [];
    const totalTasks = familyStats?.totalTasks || 0;
    const completedTasks = familyStats?.completedTasks || 0;
    const totalPoints = familyStats?.totalPoints || 0;
    const memberCount = familyMembers.length;

    // Task completion milestones
    if (completedTasks >= 100) achievements.push({ icon: '💯', title: 'Century Club', desc: '100+ tasks completed!' });
    else if (completedTasks >= 50) achievements.push({ icon: '🔥', title: 'Half Century', desc: '50+ tasks completed!' });
    else if (completedTasks >= 25) achievements.push({ icon: '⭐', title: 'Getting Started', desc: '25+ tasks completed!' });
    else if (completedTasks >= 10) achievements.push({ icon: '🚀', title: 'First Steps', desc: '10+ tasks completed!' });

    // Team collaboration
    if (memberCount >= 5) achievements.push({ icon: '👥', title: 'Big Family', desc: '5+ family members!' });
    else if (memberCount >= 3) achievements.push({ icon: '👨‍👩‍👧', title: 'Growing Family', desc: '3+ family members!' });

    // Point milestones
    if (totalPoints >= 1000) achievements.push({ icon: '🏆', title: 'Point Master', desc: '1000+ XP earned!' });
    else if (totalPoints >= 500) achievements.push({ icon: '💎', title: 'Point Collector', desc: '500+ XP earned!' });

    // Completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    if (completionRate >= 80) achievements.push({ icon: '🎯', title: 'Efficiency Expert', desc: '80%+ completion rate!' });

    return achievements.slice(0, 4); // Show max 4 achievements
  };

  // Enhanced collaboration metrics
  const getCollaborationStats = () => {
    const assignedTasks = familyTasks.filter(task => task.assignedToFamilyMemberId);    
    const pendingApprovals = familyTasks.filter(task => task.requiresApproval && !task.isCompleted);
    const recentAssignments = familyTasks.filter(task => 
      task.assignedToFamilyMemberId && new Date(task.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    return {
      assignedTasks: assignedTasks.length,
      pendingApprovals: pendingApprovals.length,
      recentAssignments: recentAssignments.length,
      collaborationScore: Math.min(100, Math.round((assignedTasks.length / Math.max(familyTasks.length, 1)) * 100))
    };
  };

  const getMemberAvatar = (memberId: number) => {
    const member = familyMembers.find(m => m.id === memberId);
    return member;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return <Flame className="h-3 w-3" />;
      case 'High': return <Zap className="h-3 w-3" />;
      case 'Medium': return <Target className="h-3 w-3" />;
      case 'Low': return <Star className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading family tasks...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={loadFamilyTaskData} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Family Task Overview */}
      <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-2 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {family.name} Task Collaboration
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Family productivity dashboard
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {/* Total Tasks */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{familyStats?.totalTasks || 0}</div>
                    <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{familyStats?.completedTasks || 0}</div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Points */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{familyStats?.totalPoints || 0}</div>
                    <p className="text-purple-100 text-sm font-medium">Family XP</p>
                  </div>
                  <Trophy className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{familyMembers.length}</div>
                    <p className="text-cyan-100 text-sm font-medium">Members</p>
                  </div>
                  <Users className="h-8 w-8 text-cyan-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Family Achievements */}
      <Card className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-yellow-200 dark:border-yellow-700 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
                🏆 Family Achievements
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Unlocked milestones and accomplishments
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFamilyAchievements().map((achievement, index) => (
              <div key={index} className="p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-yellow-200 dark:border-yellow-700 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.desc}</p>
                  </div>
                </div>
              </div>
            ))}
            {getFamilyAchievements().length === 0 && (
              <div className="col-span-2 text-center py-8">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ready to unlock achievements?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Complete more family tasks to earn awesome badges and recognition!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Collaboration Metrics */}
      <Card className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-2 border-cyan-200 dark:border-cyan-700 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                📊 Collaboration Insights
              </span>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Family teamwork analytics
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const collaborationStats = getCollaborationStats();
            return (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-cyan-200 dark:border-cyan-700">
                  <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">
                    {collaborationStats.assignedTasks}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Assigned Tasks
                  </div>
                </div>
                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {collaborationStats.pendingApprovals}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Pending Approvals
                  </div>
                </div>
                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                    {collaborationStats.recentAssignments}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    This Week
                  </div>
                </div>
                <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                    {collaborationStats.collaborationScore}%
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Collaboration Score
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Family Leaderboard */}
        <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Crown className="h-5 w-5 text-yellow-500" />
              🏅 Family Leaderboard
            </CardTitle>
            <CardDescription>
              Top performers this period • Family champions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopPerformers().map((memberStats, index) => {
                const member = familyMembers.find(m => m.id === memberStats.memberId);
                return (
                  <div key={memberStats.memberId} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                      } text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member?.user.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm">
                          {member?.user.firstName?.charAt(0) || member?.user.username?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{memberStats.memberName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {memberStats.tasksCompleted} tasks • {Math.round(memberStats.completionRate)}% rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold text-sm">{memberStats.pointsEarned}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {getTopPerformers().length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No activity yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Family Tasks */}
        <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Family Tasks
            </CardTitle>
            <CardDescription>
              Latest family task activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {getRecentTasks().length > 0 ? (
              getRecentTasks().map((task) => {
                const assignedMember = task.assignedToFamilyMemberId ? getMemberAvatar(task.assignedToFamilyMemberId) : null;
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/tasks/${task.id}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {assignedMember && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={assignedMember.user.avatarUrl || undefined} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                  {assignedMember.user.firstName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {assignedMember.user.firstName || assignedMember.user.username}
                              </span>
                            </div>
                          )}
                          <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                            {getPriorityIcon(task.priority)} {task.priority}
                          </Badge>
                          {task.pointsValue && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              ⭐ {task.pointsValue}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistance(new Date(task.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 space-y-4">
                  <div className="text-6xl">🎯</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Ready to collaborate?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Create family tasks and assign them to family members to get started!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Family Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Family Progress Overview
          </CardTitle>
          <CardDescription>
            Individual member progress and completion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyStats?.memberStats.map((memberStats) => {
              const member = familyMembers.find(m => m.id === memberStats.memberId);
              return (
                <div key={memberStats.memberId} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member?.user.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                        {member?.user.firstName?.charAt(0) || member?.user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{memberStats.memberName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member?.role.name}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                      <span className="font-medium">{Math.round(memberStats.completionRate)}%</span>
                    </div>
                    <Progress value={memberStats.completionRate} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-600">{memberStats.tasksCompleted}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">{memberStats.tasksAssigned}</p>
                        <p className="text-xs text-gray-500">Assigned</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600">{memberStats.pointsEarned}</p>
                        <p className="text-xs text-gray-500">Points</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) || []}
          </div>
          
          {(!familyStats?.memberStats || familyStats.memberStats.length === 0) && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No member activity yet</p>
              <p className="text-sm text-gray-400 mt-2">Start assigning tasks to see progress!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 