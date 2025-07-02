'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  X,
  Trophy,
  Target,
  Flame
} from 'lucide-react';

// Types following enterprise standards
import type {
  CalendarEventDTO,
  CalendarStatsDTO
} from '@/lib/types/calendar';
import { FamilyTaskItemDTO } from '@/lib/types/tasks';


import type { CalendarSidebarProps } from '@/lib/props/components/calendar.props';


export default function CalendarSidebar({
  events,
  tasks,
  stats,
  onCreateEvent,
  onToggleSidebar
}: CalendarSidebarProps) {

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Calendar
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div>
          <Button
            onClick={onCreateEvent}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stats.totalPoints}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total XP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stats.completedThisWeek}/{stats.tasksThisWeek}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Tasks This Week
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stats.streakDays}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Day Streak
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Upcoming Events
          </h4>
          {events.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No upcoming events
            </p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.startDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Upcoming Tasks
          </h4>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No upcoming tasks
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </div>
                    {task.pointsValue && (
                      <Badge variant="secondary" className="text-xs">
                        {task.pointsValue} XP
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 

