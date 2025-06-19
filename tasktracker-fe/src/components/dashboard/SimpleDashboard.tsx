'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, Target, Plus, Crown, Sparkles, 
  Trophy, Flame, Activity
} from 'lucide-react';
import { SimpleDashboardProps } from '@/lib/types/component-props';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';

export default function SimpleDashboard({ user, initialData, onTaskCreated }: SimpleDashboardProps) {
  const router = useRouter();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const dashboardStats = initialData?.stats || {
    tasksCompleted: 0,
    activeGoals: 0,
    focusTime: 0,
    totalPoints: 0,
    streakDays: 0,
    familyMembers: 0,
    familyTasks: 0,
    familyPoints: 0,
    totalFamilies: 0
  };

  const recentTasks = initialData?.recentTasks || [];
  const currentFamily = initialData?.family || null;

  // Gamification calculations
  const calculateLevel = (points: number) => Math.floor((points || 0) / 100) + 1;
  const currentLevel = calculateLevel(dashboardStats.totalPoints);

  const formatTaskTitle = (title: string): string => {
    return title.length > 50 ? `${title.substring(0, 50)}...` : title;
  };

  const getPriorityDisplay = (priority: string | number | undefined | null): string => {
    if (priority === null || priority === undefined || priority === '') return '';
    const priorityStr = String(priority).trim();
    const numPriority = parseInt(priorityStr, 10);
    if (!isNaN(numPriority) && numPriority >= 0 && numPriority <= 3) {
      const priorityMap = ['Low', 'Medium', 'High', 'Urgent'];
      return priorityMap[numPriority];
    }
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (validPriorities.includes(priorityStr)) {
      return priorityStr;
    }
    return '';
  };

  const handleTaskCreated = useCallback(() => {
    setIsTaskModalOpen(false);
    onTaskCreated?.();
  }, [onTaskCreated]);

  return (
    <div className="space-y-6">
      {/* Simple Hero Section */}
      <Card className="border-0 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.displayName || user?.firstName || user?.username || 'Hero'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Level {currentLevel || 1} • {dashboardStats.streakDays || 0} day streak 🔥
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Stats Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Points */}
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{dashboardStats.totalPoints || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total XP</p>
            </div>
            
            {/* Streak */}
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2 flex items-center justify-center gap-1">
                {dashboardStats.streakDays || 0} <Flame className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Day Streak</p>
            </div>
            
            {/* Tasks */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{dashboardStats.tasksCompleted || 0}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Tasks Done</p>
            </div>
            
            {/* Level */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-1">
                {currentLevel || 1} <Crown className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => setIsTaskModalOpen(true)}
          size="lg"
          className="h-16 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-6 w-6 mr-3" />
          Create New Task
          <Sparkles className="h-6 w-6 ml-3" />
        </Button>
        
        <Button
          onClick={() => router.push('/tasks')}
          variant="outline"
          size="lg"
          className="h-16 text-lg border-2 border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
        >
          <Target className="h-6 w-6 mr-3" />
          View All Tasks
        </Button>
      </div>

      {/* Recent Tasks - Simple View */}
      {recentTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => router.push(`/tasks/${task.id}`)}
                >
                  <CheckCircle
                    className={`h-5 w-5 ${task.isCompleted ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{formatTaskTitle(task.title)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  {(() => {
                    const priorityDisplay = getPriorityDisplay(task.priority);
                    return priorityDisplay && (
                      <Badge variant="outline" className="text-xs">
                        {priorityDisplay}
                      </Badge>
                    );
                  })()}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Quick Stats (if user has family) */}
      {currentFamily && (
        <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Trophy className="h-5 w-5" />
              {currentFamily.name} Family
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{dashboardStats.familyMembers || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{dashboardStats.familyTasks || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Family Tasks</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{dashboardStats.familyPoints || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Family XP</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button
                onClick={() => router.push(`/families/${currentFamily.id}`)}
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                View Family Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Tasks State */}
      {recentTasks.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🚀</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to start your productivity journey?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create your first task and begin earning XP points, achievements, and building streaks!
                </p>
                <Button
                  onClick={() => setIsTaskModalOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Task
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Creation Modal */}
      {user && (
        <TaskCreationModal
          user={user}
          family={currentFamily}
          onTaskCreated={handleTaskCreated}
          isOpen={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          editingTask={null}
        />
      )}
    </div>
  );
} 