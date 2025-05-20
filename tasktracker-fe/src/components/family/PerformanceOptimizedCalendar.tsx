import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FamilyCalendarEvent } from '@/lib/services/familyCalendarService';
import { useToast } from '@/lib/providers/ToastProvider';
import { cn } from '@/lib/utils';

// Custom styles to be applied to the FullCalendar container
import './calendar-styles.css';

// Generate a UUID for truly unique keys
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface PerformanceOptimizedCalendarProps {
  events: FamilyCalendarEvent[];
  tasks?: any[];
  conflicts?: any[];
  onDateSelect: (info: any) => void;
  onEventClick: (info: any) => void;
  isModal?: boolean;
  height?: string;
}

/**
 * A performance-optimized FullCalendar implementation with:
 * - Memoized event rendering
 * - Efficient re-renders
 * - Event caching
 * - ARIA support for accessibility
 * - Beautiful UI design
 */
export const PerformanceOptimizedCalendar = forwardRef<any, PerformanceOptimizedCalendarProps>(({
  events,
  tasks = [],
  conflicts = [],
  onDateSelect,
  onEventClick,
  isModal = false,
  height = "100%"
}, ref) => {
  const [calendarApi, setCalendarApi] = useState<any>(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const { showToast } = useToast();
  
  // Cache for performance monitoring
  const [renderCount, setRenderCount] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const [firstLoad, setFirstLoad] = useState(true);
  
  // Expose the calendar API via ref
  useImperativeHandle(ref, () => ({
    getApi: () => calendarApi,
    refetchEvents: () => {
      if (calendarApi) {
        calendarApi.refetchEvents();
      }
    }
  }));

  // Log events when they change
  useEffect(() => {
    console.log('[Calendar] Events array updated, length:', events.length);
    
    // If we have a calendar API, refresh it
    if (calendarApi) {
      console.log('[Calendar] Refreshing calendar view');
      
      // For more direct control, remove all events and add them again
      try {
        // Clear existing events
        const existingEvents = calendarApi.getEvents();
        if (existingEvents && existingEvents.length > 0) {
          console.log('[Calendar] Clearing all calendar events');
          existingEvents.forEach((event: any) => event.remove());
        }
        
        // Re-add all events from the prop
        if (events.length > 0) {
          console.log('[Calendar] Re-adding events from props');
          events.forEach((event) => {
            calendarApi.addEvent({
              id: `event-${event.id}`,
              title: event.title,
              start: event.startTime,
              end: event.endTime,
              allDay: event.isAllDay,
              color: event.color || '#3b82f6',
              extendedProps: {
                type: 'event',
                description: event.description,
                location: event.location,
                originalId: event.id
              }
            });
          });
        }
      } catch (err) {
        console.error('[Calendar] Error updating events directly:', err);
      }
      
      // Always call refetchEvents for good measure
      calendarApi.refetchEvents();
    }
  }, [events, calendarApi]);

  // Get color based on task priority - Move this function before it's used
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'; // Red
      case 'high': return '#f97316'; // Orange
      case 'medium': return '#eab308'; // Yellow
      case 'low': return '#3b82f6'; // Blue
      default: return '#3b82f6'; // Default blue
    }
  };

  // Memoize the combined events array to prevent unnecessary re-renders
  const combinedEvents = useMemo(() => {
    // Track render performance
    if (!firstLoad) {
      setRenderCount(prev => prev + 1);
      setLastRenderTime(performance.now());
    } else {
      setFirstLoad(false);
    }
    
    console.log('[Calendar] Building combinedEvents array');
    console.log('[Calendar] Events count:', events.length);
    console.log('[Calendar] Tasks count:', tasks.length);
    console.log('[Calendar] Conflicts count:', conflicts.length);
    
    if (events.length > 0) {
      console.log('[Calendar] First event:', events[0]);
    }
    
    // Keep track of used IDs to avoid duplicates
    const usedIds = new Set<string>();
    
    // Function to ensure ID is unique
    const getUniqueId = (baseId: string): string => {
      // If ID is already used, append a random string
      if (usedIds.has(baseId)) {
        const uniqueId = `${baseId}-${generateUUID()}`;
        usedIds.add(uniqueId);
        return uniqueId;
      } else {
        usedIds.add(baseId);
        return baseId;
      }
    };
    
    const result = [
      // Regular events
      ...events.map(event => {
        // Ensure we have a valid ID - convert to string if needed
        const eventIdStr = typeof event.id === 'number' ? event.id.toString() : String(event.id);
        const eventId = getUniqueId(`event-${eventIdStr}`);
        
        return {
          id: eventId,
          title: event.title,
          start: event.startTime,
          end: event.endTime,
          allDay: event.isAllDay,
          color: event.color || '#3b82f6', // Default to blue if no color specified
          extendedProps: { 
            type: 'event',
            description: event.description,
            location: event.location,
            createdBy: event.createdBy,
            originalId: event.id // Keep the original ID for reference
          },
          // Add a class to style events differently
          className: 'custom-calendar-event'
        };
      }),
      // Conflicts
      ...conflicts.map((conflict, index) => {
        const conflictId = getUniqueId(`conflict-${index}`);
        return {
          id: conflictId,
          title: `Conflict: ${conflict.members?.map((m: any) => m.name).join(', ') || 'Multiple members'}`,
          start: conflict.startTime,
          end: conflict.endTime,
          color: '#ef4444', // Red color
          textColor: 'white',
          extendedProps: { type: 'conflict' },
          className: 'conflict-calendar-event'
        };
      }),
      // Tasks
      ...tasks.map(task => {
        const taskId = getUniqueId(`task-${task.id}`);
        return {
          id: taskId,
          title: `${task.title}`,
          start: task.dueDate,
          allDay: true,
          color: getPriorityColor(task.priority),
          extendedProps: { 
            type: 'task',
            priority: task.priority,
            assignedTo: task.assignedTo,
            isCompleted: task.isCompleted,
            originalId: task.id // Keep the original ID for reference
          },
          className: cn(
            'task-calendar-event',
            task.isCompleted ? 'completed-task' : '',
            `priority-${task.priority}`
          )
        };
      })
    ];
    
    console.log('[Calendar] Final events array length:', result.length);
    return result;
  }, [events, conflicts, tasks]);

  // Handle window resizing efficiently with debounce
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (calendarApi) {
          calendarApi.updateSize();
        }
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [calendarApi]);

  // Memoize event handlers to prevent rerenders
  const handleDateSelectCallback = useCallback((info: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Prevent selecting past dates
    const selectedDate = new Date(info.start);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      showToast("Cannot create events in the past", "error");
      return;
    }
    
    onDateSelect(info);
  }, [onDateSelect, showToast]);

  const handleEventClickCallback = useCallback((info: any) => {
    onEventClick(info);
  }, [onEventClick]);

  // Enhanced event rendering with custom content
  const eventContent = useCallback((eventInfo: any) => {
    const { event } = eventInfo;
    const eventType = event.extendedProps?.type || 'event';
    const isCompleted = event.extendedProps?.isCompleted;
    
    // Custom indicator based on event type
    let indicator = null;
    if (eventType === 'task') {
      const priority = event.extendedProps?.priority || 'normal';
      indicator = (
        <div className={`event-indicator priority-${priority}`}>
          {isCompleted ? '✓' : ''}
        </div>
      );
    }
    
    return (
      <div className="fc-event-content-wrapper">
        {indicator}
        <div className="fc-event-time">{eventInfo.timeText}</div>
        <div className="fc-event-title">{event.title}</div>
      </div>
    );
  }, []);

  // Accessibility enhancement for events
  const eventDidMount = useCallback((info: any) => {
    const { event, el } = info;
    const eventType = event.extendedProps?.type || 'event';
    const title = event.title;
    const start = event.start ? new Date(event.start).toLocaleString() : '';
    
    let ariaLabel = `${title}, ${start}`;
    
    // Add more context based on event type
    if (eventType === 'task') {
      ariaLabel += `, Priority: ${event.extendedProps?.priority || 'normal'}`;
      if (event.extendedProps?.isCompleted) {
        ariaLabel += ', Status: Completed';
      }
    } else if (eventType === 'conflict') {
      ariaLabel += ', Warning: Scheduling conflict';
    }
    
    el.setAttribute('aria-label', ariaLabel);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    
    // Add keyboard navigation for events
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onEventClick({ event });
        e.preventDefault();
      }
    });

    // Add hover effect and tooltip
    if (event.extendedProps?.description) {
      el.setAttribute('title', event.extendedProps.description);
    }

    // Add custom styling for different event types
    if (eventType === 'task') {
      el.classList.add('task-event');
      if (event.extendedProps?.isCompleted) {
        el.classList.add('completed-task');
      }
    } else if (eventType === 'conflict') {
      el.classList.add('conflict-event');
    }
  }, [onEventClick]);

  // Style for day cells with events
  const dayCellDidMount = useCallback((info: any) => {
    // Add a subtle background to cells with events
    const dayEvents = info.view.calendar.getEvents().filter((event: any) => {
      const eventStart = event.start;
      const cellDate = info.date;
      return eventStart && 
        eventStart.getDate() === cellDate.getDate() &&
        eventStart.getMonth() === cellDate.getMonth() &&
        eventStart.getFullYear() === cellDate.getFullYear();
    });
    
    if (dayEvents.length > 0) {
      info.el.classList.add('has-events');
      // Add a data attribute with the count for potential styling
      info.el.setAttribute('data-event-count', dayEvents.length.toString());
    }
    
    // Apply past date styling
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(info.date);
    cellDate.setHours(0, 0, 0, 0);
    
    if (cellDate < today) {
      info.el.classList.add('fc-day-past');
      info.el.style.backgroundColor = '#f8f8f8';
      info.el.style.opacity = '0.7';
      info.el.style.color = '#9ca3af';
    }
    
    // Today's date should have special styling
    if (info.date.getDate() === today.getDate() && 
        info.date.getMonth() === today.getMonth() && 
        info.date.getFullYear() === today.getFullYear()) {
      info.el.classList.add('fc-day-today');
    }
  }, []);

  return (
    <div className="w-full h-full calendar-container" role="application" aria-label="Family calendar">
      <FullCalendar
        ref={(fullCalendarRef) => {
          if (fullCalendarRef) {
            const api = fullCalendarRef.getApi();
            setCalendarApi(api);
          }
        }}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={combinedEvents}
        select={handleDateSelectCallback}
        eventClick={handleEventClickCallback}
        height={isModal ? "calc(80vh - 100px)" : height}
        contentHeight="auto"
        viewDidMount={(arg) => setCurrentView(arg.view.type)}
        eventDidMount={eventDidMount}
        dayCellDidMount={dayCellDidMount}
        eventContent={eventContent}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: 'short'
        }}
        // Improved calendar styling
        themeSystem="standard"
        slotEventOverlap={false}
        eventBorderColor="transparent"
        eventDisplay="block"
        // Typography improvements
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
        }}
        dayHeaderFormat={{
          weekday: 'long',
        }}
        firstDay={0} // Start with Sunday
        allDayText="All day"
        nowIndicator={true}
        // Calendar day styling
        dayCellClassNames="day-cell"
        // Performance optimizations
        rerenderDelay={10}
        lazyFetching={true}
        // Prevent selecting dates in the past
        selectAllow={(selectInfo) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectInfo.start >= today;
        }}
      />
      
      {renderCount > 0 && process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground mt-2">
          <p>Performance: Calendar rendered {renderCount} times. Last render: {lastRenderTime.toFixed(2)}ms</p>
        </div>
      )}
    </div>
  );
});

// Add display name for better debugging
PerformanceOptimizedCalendar.displayName = 'PerformanceOptimizedCalendar';

// Add default export to ensure compatibility with different import styles
export default PerformanceOptimizedCalendar; 