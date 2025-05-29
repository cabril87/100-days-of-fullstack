/*
 * TaskTracker - Calendar Widget for Dashboard
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/lib/providers/FamilyContext';
import { useAuth } from '@/lib/providers/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, Users, Plus, ArrowRight } from 'lucide-react';

interface UpcomingEvent {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: number;
  isToday: boolean;
  isConflicted?: boolean;
}

interface CalendarWidgetProps {
  className?: string;
}

export function CalendarWidget({ className }: CalendarWidgetProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { family, loading } = useFamily();
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayEvents, setTodayEvents] = useState(0);
  const [weekEvents, setWeekEvents] = useState(0);

  // Memoize navigation handlers to prevent infinite re-renders
  const handleViewCalendar = useCallback(() => {
    if (family) {
      router.push(`/family/${family.id}/calendar`);
    } else {
      router.push('/calendar');
    }
  }, [family, router]);

  const handleCreateEvent = useCallback(() => {
    // Navigate to family calendar with create action or family event page
    if (family) {
      router.push(`/family/${family.id}?tab=events&action=create`);
    } else {
      router.push('/calendar?action=create');
    }
  }, [family, router]);

  // Load upcoming events when family is available
  useEffect(() => {
    const loadUpcomingEvents = async () => {
      if (!family) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Mock upcoming events for demonstration
        // In production, you would fetch from familyCalendarService
        const mockEvents: UpcomingEvent[] = [
          {
            id: 1,
            title: "Family Movie Night",
            startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
            attendees: 4,
            isToday: true
          },
          {
            id: 2,
            title: "Soccer Practice",
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
            endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
            attendees: 2,
            isToday: false
          }
        ];
        setUpcomingEvents(mockEvents);
        setTodayEvents(mockEvents.filter(e => e.isToday).length);
        setWeekEvents(mockEvents.length);
      } catch (error) {
        console.error('Error loading upcoming events:', error);
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUpcomingEvents();
  }, [family]); // Only depend on family, not user

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
            Family Calendar
            {family && (
              <Badge variant="secondary" className="text-xs">
                {family.name}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewCalendar}
            className="text-blue-600 hover:text-blue-700 p-1"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Today</p>
                <p className="text-xl font-bold text-blue-600">{todayEvents}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">This Week</p>
                <p className="text-xl font-bold text-purple-600">{weekEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Upcoming Events
          </h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming events</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateEvent}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    event.isConflicted
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={handleViewCalendar}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </h5>
                        {event.isConflicted && (
                          <Badge variant="destructive" className="text-xs">
                            Conflict
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendees}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {formatDate(event.startTime)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewCalendar}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-1" />
            View Calendar
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateEvent}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
        </div>

        {/* Calendar Access Quick Link */}
        {!family && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
              Join a family to access shared calendar features!
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/family/create')}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                Create Family
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/family/join')}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                Join Family
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 