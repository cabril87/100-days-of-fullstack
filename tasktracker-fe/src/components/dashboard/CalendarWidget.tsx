/*
 * TaskTracker - Calendar Widget for Dashboard
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Eye,
  Clock,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'family' | 'focus' | 'personal';
  priority?: 'high' | 'medium' | 'low';
}

interface CalendarWidgetProps {
  className?: string;
}

export function CalendarWidget({ className }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Sample events - in real app, this would be fetched from API
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Project Meeting',
        date: new Date().toISOString().split('T')[0], // Today
        type: 'task',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Family Dinner',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        type: 'family'
      },
      {
        id: '3',
        title: 'Focus Session',
        date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
        type: 'focus'
      }
    ];
    setEvents(sampleEvents);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'task':
        return <Target className="h-3 w-3" />;
      case 'family':
        return <Users className="h-3 w-3" />;
      case 'focus':
        return <Clock className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'family':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'focus':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <Card className={cn("bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden", className)}>
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-600 opacity-[0.05] rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
      
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-t-xl"></div>
      
      <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-blue-50 border-b relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-emerald-600" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 hover:bg-white/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 hover:bg-white/60"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 relative z-10">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-8" />;
            }
            
            const dayEvents = getEventsForDate(day);
            const today = isToday(day);
            const selected = isSelected(day);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "h-8 w-8 text-xs rounded-lg relative flex items-center justify-center transition-all duration-200 hover:scale-110",
                  {
                    "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md": today,
                    "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 border border-purple-300": selected && !today,
                    "hover:bg-gray-100": !today && !selected,
                    "text-gray-900": !today && !selected
                  }
                )}
              >
                {day.getDate()}
                {/* Event indicator dots */}
                {dayEvents.length > 0 && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={cn(
                          "w-1 h-1 rounded-full",
                          {
                            "bg-white": today,
                            "bg-blue-500": !today && event.type === 'task',
                            "bg-green-500": !today && event.type === 'family',
                            "bg-purple-500": !today && event.type === 'focus',
                            "bg-gray-500": !today && event.type === 'personal'
                          }
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Selected date events */}
        {selectedDate && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={cn("p-1 rounded-md border", getEventTypeColor(event.type))}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{event.title}</p>
                      {event.priority && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs h-4",
                            {
                              "border-red-200 text-red-700 bg-red-50": event.priority === 'high',
                              "border-amber-200 text-amber-700 bg-amber-50": event.priority === 'medium',
                              "border-green-200 text-green-700 bg-green-50": event.priority === 'low'
                            }
                          )}
                        >
                          {event.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic text-center py-2">
                  No events scheduled
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Quick actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
            <Link href="/calendar">
              <Eye className="h-3 w-3 mr-1" />
              Full Calendar
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
            <Link href="/tasks/create">
              <Plus className="h-3 w-3 mr-1" />
              Add Event
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 