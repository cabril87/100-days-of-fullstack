'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TasksPageContentProps } from '@/lib/types/task';

export default function TasksPageContent({ user, initialData }: TasksPageContentProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and boost productivity
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Task Stats */}
      {initialData.stats.totalTasks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.activeTasks}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{initialData.stats.overdueTasks}</div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coming Soon Card */}
      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            🚧 Coming Soon
          </CardTitle>
          <CardDescription className="text-lg">
            Task management features are currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Planned Features:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Create and manage tasks</li>
              <li>• Set priorities and due dates</li>
              <li>• Organize with categories and tags</li>
              <li>• Track completion progress</li>
              <li>• Real-time collaboration</li>
              <li>• Gamification integration</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This page will be populated with live data from the API when the task features are implemented.
          </p>
          
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <p>Hello {user?.firstName || user?.username || 'User'}! Your tasks will appear here once the backend integration is complete.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 