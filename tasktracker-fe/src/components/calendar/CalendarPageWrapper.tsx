'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

// Types following enterprise standards
import type {
  CalendarPageWrapperProps,
  CalendarViewType,
  CalendarEventDTO,
  CalendarStatsDTO,
  CalendarGamificationData,
  AchievementDisplayDTO
} from '@/lib/types/calendar';
import { FamilyTaskItemDTO } from '@/lib/types/task';

// Services and hooks
import { calendarService } from '@/lib/services/calendarService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';

// Components
import AppleCalendarView from './AppleCalendarView';
import CalendarControls from './CalendarControls';
import CalendarSidebar from './CalendarSidebar';
import CreateEventSheet from './CreateEventSheet';

/**
 * Enterprise Calendar Page Wrapper Component
 * Handles state management, data loading, and view orchestration
 * Follows clean architecture with proper separation of concerns
 */
export default function CalendarPageWrapper({ user, initialData }: CalendarPageWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ============================================================================
  // STATE MANAGEMENT - Following React best practices
  // ============================================================================

  // Calendar view state
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Data state
  const [events, setEvents] = useState<CalendarEventDTO[]>(initialData.events);
  const [familyTasks] = useState<FamilyTaskItemDTO[]>(initialData.familyTasks);
  const [achievements] = useState<AchievementDisplayDTO[]>(initialData.achievements);
  const [stats, setStats] = useState<CalendarStatsDTO>(initialData.stats);
  const [gamificationData, setGamificationData] = useState<CalendarGamificationData>({
    dailyPoints: {},
    weeklyStreaks: {},
    monthlyAchievements: [],
    taskCompletionRates: {},
    familyActivityLevels: {}
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sheetSelectedDate, setSheetSelectedDate] = useState<Date>(new Date());
  const [sheetSelectedTime, setSheetSelectedTime] = useState<string | undefined>();

  // Event/Task selection state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDTO | null>(null);
  const [selectedTask, setSelectedTask] = useState<FamilyTaskItemDTO | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Family context
  const [currentFamily, setCurrentFamily] = useState<{ id: number; name: string } | null>(null);
  const [allFamilies, setAllFamilies] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  // ============================================================================
  // COMPUTED VALUES - Memoized for performance
  // ============================================================================

  const userId = useMemo(() => user?.id, [user?.id]);

  // Calendar navigation helpers
  const navigation = useMemo(() => ({
    goToToday: () => {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
    },
    goToNextPeriod: () => {
      const newDate = new Date(currentDate);
      switch (viewType) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'list':
          newDate.setDate(newDate.getDate() + 7);
          break;
      }
      setCurrentDate(newDate);
    },
    goToPreviousPeriod: () => {
      const newDate = new Date(currentDate);
      switch (viewType) {
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'list':
          newDate.setDate(newDate.getDate() - 7);
          break;
      }
      setCurrentDate(newDate);
    },
    goToSpecificDate: (date: Date) => {
      setCurrentDate(date);
      setSelectedDate(date);
    },
    changeView: (newViewType: CalendarViewType) => {
      setViewType(newViewType);
    }
  }), [currentDate, viewType]);

  // Calendar display helpers
  const display = useMemo(() => ({
    formatDateForView: (date: Date, view: CalendarViewType) => {
      switch (view) {
        case 'month':
          return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        case 'day':
          return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        case 'list':
          return 'All Calendar Items';
        default:
          return date.toLocaleDateString();
      }
    },
    getEventsByDate: (date: Date) => {
      const dateStr = date.toDateString();
      return events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === dateStr;
      });
    },
    getTasksByDate: (date: Date) => {
      const dateStr = date.toDateString();
      return familyTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === dateStr;
      });
    },
    calculateDayPoints: (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return gamificationData.dailyPoints[dateStr] || 0;
    },
    isDateHighlighted: (date: Date) => {
      const hasEvents = display.getEventsByDate(date).length > 0;
      const hasTasks = display.getTasksByDate(date).length > 0;
      const hasPoints = display.calculateDayPoints(date) > 0;
      return hasEvents || hasTasks || hasPoints;
    }
  }), [events, familyTasks, gamificationData]);

  // ============================================================================
  // DATA LOADING - Async operations with proper error handling
  // ============================================================================

  const loadCalendarData = useCallback(async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('📅 CalendarPageWrapper: Loading calendar data for view:', viewType);
      console.log('📅 CalendarPageWrapper: Current date:', currentDate.toISOString());

      // Determine date range based on view type
      let startDate: Date, endDate: Date;
      
      switch (viewType) {
        case 'month':
          startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          break;
        case 'week':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - currentDate.getDay());
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'day':
          startDate = new Date(currentDate);
          endDate = new Date(currentDate);
          break;
        case 'list':
          startDate = new Date();
          endDate = new Date();
          endDate.setDate(startDate.getDate() + 30); // Next 30 days
          break;
      }

      console.log('📅 CalendarPageWrapper: Date range:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString() 
      });

      // Load calendar data concurrently
      const [calendarEvents, statsResponse] = await Promise.all([
        currentFamily?.id 
          ? calendarService.getFamilyCalendarEvents(currentFamily.id, startDate, endDate)
          : calendarService.getAllUserCalendarEvents(startDate, endDate),
        calendarService.getCalendarStats()
      ]);

      // Update state with loaded data - map service DTOs to component types
      const mappedEvents = calendarEvents.map(event => ({
        ...event,
        startDate: new Date(event.startTime),
        endDate: new Date(event.endTime),
        createdByUserId: event.createdBy.id,
        achievementId: undefined,
        taskId: undefined,
        eventType: event.eventType as 'task' | 'achievement' | 'family_activity' | 'celebration' | 'reminder' | 'meeting' | 'deadline',
        recurrence: undefined,
        color: event.color || '#3B82F6', // Default blue color
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date()
      })) as CalendarEventDTO[];
      
      console.log('🔄 CalendarPageWrapper: Mapped events with proper dates:', mappedEvents);
      setEvents(mappedEvents);
      // For now, we'll keep existing tasks and achievements from initial data
      // setFamilyTasks([]); // Tasks would come from separate service
      // setAchievements([]); // Achievements would come from separate service  
      setStats(statsResponse);
      // For now, use empty gamification data
      setGamificationData({
        dailyPoints: {},
        weeklyStreaks: {},
        monthlyAchievements: [],
        taskCompletionRates: {},
        familyActivityLevels: {}
      });

      console.log('✅ CalendarPageWrapper: Calendar data loaded successfully:', {
        eventsCount: calendarEvents.length,
        tasksCount: familyTasks.length,
        achievementsCount: achievements.length
      });

      // If we're viewing current month but there are no events, and we have events in the data,
      // navigate to the first month that has events
      if (viewType === 'month' && mappedEvents.length > 0) {
        const currentMonthEvents = mappedEvents.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.getFullYear() === currentDate.getFullYear() && 
                 eventDate.getMonth() === currentDate.getMonth();
        });
        
        if (currentMonthEvents.length === 0) {
          // Find the first event and navigate to that month
          const firstEvent = mappedEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];
          if (firstEvent) {
            const eventDate = new Date(firstEvent.startDate);
            console.log('📅 CalendarPageWrapper: Navigating to month with events:', eventDate.toISOString());
            setCurrentDate(eventDate);
            return; // Exit early and let the effect re-run with the new date
          }
        }
      }

    } catch (error) {
      console.error('❌ CalendarPageWrapper: Failed to load calendar data:', error);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, viewType, currentDate, currentFamily?.id, familyTasks.length, achievements.length]);

  const loadFamilyData = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('👨‍👩‍👧‍👦 CalendarPageWrapper: Loading family data...');
      const families = await familyInvitationService.getAllFamilies();
      
      if (families && families.length > 0) {
        setAllFamilies(families);
        const family = families[0]; // Use first family for now
        setCurrentFamily({ id: family.id, name: family.name });
        console.log('✅ CalendarPageWrapper: Families loaded:', families.length);
        
        // Load family members for all families
        const allMembers = [];
        for (const fam of families) {
          try {
            const members = await familyInvitationService.getFamilyMembers(fam.id);
            allMembers.push(...members);
          } catch (error) {
            console.warn(`Failed to load members for family ${fam.id}:`, error);
          }
        }
        setFamilyMembers(allMembers);
        console.log('✅ CalendarPageWrapper: All family members loaded:', allMembers.length);
      }
    } catch (error) {
      console.error('❌ CalendarPageWrapper: Failed to load family data:', error);
    }
  }, [userId]);

  // ============================================================================
  // EFFECTS - Data loading and view persistence
  // ============================================================================

  // Load family data on mount
  useEffect(() => {
    if (userId) {
      loadFamilyData();
    }
  }, [userId, loadFamilyData]);

  // Load calendar data when view changes
  useEffect(() => {
    if (userId) {
      loadCalendarData();
    }
  }, [userId, loadCalendarData]);

  // Save view preferences to localStorage
  useEffect(() => {
    localStorage.setItem('tasktracker-calendar-view', viewType);
    localStorage.setItem('tasktracker-calendar-sidebar', JSON.stringify(sidebarOpen));
  }, [viewType, sidebarOpen]);

  // Load view preferences from URL params and localStorage
  useEffect(() => {
    const tabParam = searchParams.get('tab') as CalendarViewType;
    const savedView = localStorage.getItem('tasktracker-calendar-view') as CalendarViewType;
    const savedSidebar = localStorage.getItem('tasktracker-calendar-sidebar');
    
    // Prioritize URL parameter over localStorage
    if (tabParam && ['month', 'week', 'day', 'list'].includes(tabParam)) {
      setViewType(tabParam);
    } else if (savedView && ['month', 'week', 'day', 'list'].includes(savedView)) {
      setViewType(savedView);
      // Update URL to include the saved view
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', savedView);
      router.replace(`/calendar?${params.toString()}`, { scroll: false });
    } else {
      // Default to month view and update URL
      setViewType('month');
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', 'month');
      router.replace(`/calendar?${params.toString()}`, { scroll: false });
    }
    
    if (savedSidebar) {
      try {
        setSidebarOpen(JSON.parse(savedSidebar));
      } catch {
        // Ignore parse errors
      }
    }
  }, [searchParams, router]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    
    // If selecting a date in month view, could switch to day view
    if (viewType === 'month') {
      // Optional: Switch to day view when clicking a date
      // setViewType('day');
      // setCurrentDate(date);
    }
  }, [viewType]);

  const handleEventSelect = useCallback((event: CalendarEventDTO) => {
    console.log('📅 Event selected:', event.title);
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startDate));
    setSheetSelectedDate(new Date(event.startDate));
    setSheetSelectedTime(new Date(event.startDate).toTimeString().slice(0, 5));
    setIsEditMode(true);
    setIsCreateSheetOpen(true);
  }, []);

  const handleTaskSelect = useCallback((task: FamilyTaskItemDTO) => {
    console.log('📋 Task selected:', task.title);
    setSelectedTask(task);
    
    // For now, navigate to task details
    // In the future, we could open the CreateEventSheet in task edit mode
    router.push(`/tasks/${task.id}`);
  }, [router]);

  const handleViewChange = useCallback((newViewType: CalendarViewType) => {
    setViewType(newViewType);
    
    // Update URL with tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newViewType);
    router.push(`/calendar?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleCreateEvent = useCallback((selectedDate?: Date, selectedTime?: string) => {
    setSheetSelectedDate(selectedDate || new Date());
    setSheetSelectedTime(selectedTime);
    setIsEditMode(false);
    setSelectedEvent(null);
    setSelectedTask(null);
    setIsCreateSheetOpen(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setIsCreateSheetOpen(false);
    setIsEditMode(false);
    setSelectedEvent(null);
    setSelectedTask(null);
  }, []);

  // ============================================================================
  // RENDER - Clean component structure
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50">
      <div className="flex h-screen">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
            <CalendarSidebar
              events={events}
              tasks={familyTasks}
              stats={stats}
              onCreateEvent={handleCreateEvent}
              onToggleSidebar={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Header */}
          <CalendarControls
            viewType={viewType}
            currentDate={currentDate}
            onViewChange={handleViewChange}
            onDateChange={setCurrentDate}
            stats={stats}
            onCreateEvent={handleCreateEvent}
          />

          {/* Calendar View */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {error && (
              <Card className="mb-4 sm:mb-6 border-red-200/60 bg-red-50/80 dark:border-red-800/60 dark:bg-red-900/30 rounded-xl shadow-sm backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 dark:text-red-400 text-sm font-bold">!</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                      <Button 
                        onClick={loadCalendarData} 
                        className="mt-3 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm" 
                        size="sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <AppleCalendarView
              viewType={viewType}
              currentDate={currentDate}
              events={events}
              tasks={familyTasks}
              onDateSelect={handleDateSelect}
              onEventSelect={handleEventSelect}
              onTaskSelect={handleTaskSelect}
              onViewChange={handleViewChange}
              gamificationData={gamificationData}
              onCreateEvent={handleCreateEvent}
              className={isLoading ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>
        </div>

        {/* Toggle Sidebar Button - Hidden Sidebar */}
        {!sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50"
            size="sm"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create Event/Task Sheet */}
      <CreateEventSheet
        isOpen={isCreateSheetOpen}
        onClose={handleSheetClose}
        selectedDate={sheetSelectedDate}
        selectedTime={sheetSelectedTime}
        familyId={currentFamily?.id?.toString()}
        allFamilies={allFamilies}
        familyMembers={familyMembers}
        existingEvents={events.filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === sheetSelectedDate.toDateString();
        })}
        existingTasks={familyTasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === sheetSelectedDate.toDateString();
        })}
        isEditMode={isEditMode}
        editingEvent={selectedEvent}
        editingTask={selectedTask}
        onEventCreated={(newEvent: CalendarEventDTO) => {
          setEvents(prev => [...prev, newEvent]);
          loadCalendarData(); // Refresh data
        }}
        onTaskCreated={(newTask: FamilyTaskItemDTO) => {
          // Task creation would be handled by task service
          loadCalendarData(); // Refresh data
        }}
        onEventUpdated={(updatedEvent: CalendarEventDTO) => {
          setEvents(prev => prev.map(e => e.id.toString() === updatedEvent.id.toString() ? updatedEvent : e));
          loadCalendarData(); // Refresh data
        }}
        onTaskUpdated={(updatedTask: FamilyTaskItemDTO) => {
          // Task update would be handled by task service
          loadCalendarData(); // Refresh data
        }}
        onEventDeleted={(eventId: string) => {
          setEvents(prev => prev.filter(e => e.id.toString() !== eventId));
          loadCalendarData(); // Refresh data
        }}
        onTaskDeleted={(taskId: string) => {
          // Task deletion would be handled by task service
          loadCalendarData(); // Refresh data
        }}
      />
    </div>
  );
} 