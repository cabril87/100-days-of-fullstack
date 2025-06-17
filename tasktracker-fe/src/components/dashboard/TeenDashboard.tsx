'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  CheckCircle, 
  Clock, 
  Zap, 
  Award,
  Users,
  BookOpen,
  Coffee,
  Flame,
  Crown
} from 'lucide-react';

import { DashboardContentProps } from '@/lib/types';
import { taskService } from '@/lib/services/taskService';
import { Task } from '@/lib/types/task';

interface TeenDashboardProps extends DashboardContentProps {
  onTaskComplete: (taskId: number) => void;
  onRequestPermission: (action: string, description: string) => void;
}

export default function TeenDashboard({ user, initialData, onTaskComplete, onRequestPermission }: TeenDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialData.recentTasks || []);
  const [points, setPoints] = useState(initialData.stats.totalPoints || 0);
  const [completedToday, setCompletedToday] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'social'>('overview');
  const [weeklyGoal] = useState(10); // Default weekly goal

  // Level and progress calculations
  const getLevel = (points: number) => Math.floor(points / 75) + 1; // Teen threshold
  const getLevelProgress = (points: number) => ((points % 75) / 75) * 100;

  // Teen-appropriate achievements
  const getTeenAchievements = () => {
    const achievements = [];
    if (completedToday >= 5) achievements.push({ icon: '🔥', title: 'Daily Streak', color: 'bg-orange-100 text-orange-800' });
    if (points >= 200) achievements.push({ icon: '⚡', title: 'Power User', color: 'bg-blue-100 text-blue-800' });
    if (initialData.stats.streakDays >= 7) achievements.push({ icon: '💪', title: 'Week Warrior', color: 'bg-purple-100 text-purple-800' });
    if (points >= 500) achievements.push({ icon: '🏆', title: 'Legend', color: 'bg-amber-100 text-amber-800' });
    if (completedToday >= 8) achievements.push({ icon: '🎯', title: 'Focus Master', color: 'bg-green-100 text-green-800' });
    return achievements;
  };

  // Teen-style greetings
  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      morning: [
        `Morning, ${user?.firstName || 'Champion'}! 🌅`,
        `Rise and grind! ☀️`,
        `New day, new victories! 🚀`
      ],
      afternoon: [
        `Hey ${user?.firstName || 'Superstar'}! 👋`,
        `Afternoon vibes! ⚡`,
        `Keep crushing it! 💪`
      ],
      evening: [
        `Evening, ${user?.firstName || 'Legend'}! 🌟`,
        `Time to wrap up strong! ✨`,
        `Almost there! 🎯`
      ]
    };
    
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const options = greetings[timeOfDay];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Handle task completion
  const handleTaskComplete = useCallback(async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: true } : task
      ));
      
      setCompletedToday(prev => prev + 1);
      setPoints(prev => prev + 15); // Teen point reward
      
      onTaskComplete(taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  }, [onTaskComplete]);

  // Permission request helper
  const handlePermissionRequest = (action: string) => {
    const descriptions = {
      'spend_points': `I&apos;d like to redeem ${Math.min(points, 50)} points for a reward`,
      'create_family': 'I want to create my own family group to manage',
      'invite_friends': 'Can I invite some friends to join our family tasks?',
      'extended_privileges': 'I think I&apos;m ready for more responsibility in family management'
    };
    
    onRequestPermission(action, descriptions[action as keyof typeof descriptions] || action);
  };

  const level = getLevel(points);
  const levelProgress = getLevelProgress(points);
  const achievements = getTeenAchievements();
  const incompleteTasks = tasks.filter(task => !task.isCompleted);
  const weeklyProgress = Math.min((completedToday * 7) / weeklyGoal * 100, 100); // Rough weekly estimate

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}
            </h1>
            <p className="text-gray-600 mt-1">
              Level {level} • {75 - (points % 75)} XP to next level
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{points}</div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
            <Avatar className="h-12 w-12 border-2 border-indigo-200">
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white">
                {user?.firstName?.[0] || 'T'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Level Progress */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold">Level {level}</span>
              <span className="text-indigo-100">Level {level + 1}</span>
            </div>
            <Progress value={levelProgress} className="h-2 bg-indigo-400" />
            <div className="mt-2 text-sm text-indigo-100">
              {75 - (points % 75)} more XP needed
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'goals' | 'social')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{completedToday}</div>
                    <div className="text-sm text-gray-600">Today</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{incompleteTasks.length}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{initialData.stats.streakDays}</div>
                    <div className="text-sm text-gray-600">Streak</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{achievements.length}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((achievement, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className={`${achievement.color} px-3 py-1`}
                      >
                        {achievement.icon} {achievement.title}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => handlePermissionRequest('spend_points')}
                variant="outline"
                className="h-16 flex-col"
                disabled={points < 25}
              >
                <Zap className="h-5 w-5 mb-1" />
                Redeem Points
              </Button>

              <Button 
                onClick={() => handlePermissionRequest('create_family')}
                variant="outline"
                className="h-16 flex-col"
              >
                <Users className="h-5 w-5 mb-1" />
                Create Family
              </Button>

              <Button 
                onClick={() => handlePermissionRequest('invite_friends')}
                variant="outline"
                className="h-16 flex-col"
              >
                <Coffee className="h-5 w-5 mb-1" />
                Invite Friends
              </Button>

              <Button 
                onClick={() => handlePermissionRequest('extended_privileges')}
                variant="outline"
                className="h-16 flex-col"
              >
                <Crown className="h-5 w-5 mb-1" />
                More Access
              </Button>
            </div>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    My Tasks
                  </span>
                  {incompleteTasks.length > 0 && (
                    <Badge variant="secondary">
                      {incompleteTasks.length} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incompleteTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-600 mb-1">All caught up! 🎉</h3>
                    <p className="text-gray-600">You&apos;ve completed all your tasks. Nice work!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incompleteTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {task.priority && (
                              <Badge variant="outline" className="text-xs">
                                {task.priority}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              +15 XP
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleTaskComplete(task.id)}
                          size="sm"
                          className="ml-4"
                        >
                          Complete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Complete {weeklyGoal} tasks this week</span>
                    <span className="text-sm text-gray-600">{completedToday * 7}/{weeklyGoal}</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-3" />
                  <p className="text-sm text-gray-600">
                    {weeklyProgress >= 100 ? '🎉 Goal achieved!' : `${Math.ceil((weeklyGoal - completedToday * 7) / 7)} tasks per day to reach your goal`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-semibold">Study Skills</div>
                    <div className="text-sm text-gray-600">Level 3</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="font-semibold">Leadership</div>
                    <div className="text-sm text-gray-600">Level 2</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="font-semibold">Time Management</div>
                    <div className="text-sm text-gray-600">Level 4</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <div className="font-semibold">Goal Setting</div>
                    <div className="text-sm text-gray-600">Level 2</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: user?.firstName || 'You', points: points, isMe: true },
                    { name: 'Mom', points: points + 50, isMe: false },
                    { name: 'Dad', points: points + 25, isMe: false },
                    { name: 'Sister', points: points - 10, isMe: false }
                  ].sort((a, b) => b.points - a.points).map((member, index) => (
                    <div key={member.name} className={`flex items-center justify-between p-3 rounded-lg ${member.isMe ? 'bg-indigo-50 border border-indigo-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className={`font-medium ${member.isMe ? 'text-indigo-700' : ''}`}>
                          {member.name} {member.isMe && '(You)'}
                        </span>
                      </div>
                      <div className={`font-semibold ${member.isMe ? 'text-indigo-700' : ''}`}>
                        {member.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Family Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Create family groups</span>
                    <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Invite family members</span>
                    <Badge className="bg-green-100 text-green-800">Allowed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Manage family settings</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Limited</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transfer ownership</span>
                    <Badge className="bg-red-100 text-red-800">Restricted</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 