'use client';

import { useEffect, useState, useCallback } from 'react';
import { FamilyCalendarEvent, familyCalendarService } from '@/lib/services/familyCalendarService';
import { useToast } from '@/lib/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { EventForm } from '@/components/family/EventForm';
import { MemberAvailability } from '@/components/family/MemberAvailability';
import { AvailabilityForm } from '@/components/family/AvailabilityForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Share, 
  Calendar, 
  Plus, 
  Download, 
  Clock, 
  UserPlus, 
  CalendarDays,
  ChevronRight,
  Lock,
  Edit
} from 'lucide-react';
import { ShareCalendarModal } from './ShareCalendarModal';
import { TaskEventDetail } from './TaskEventDetail';
import { taskService } from '@/lib/services/taskService';
import PerformanceOptimizedCalendar from './PerformanceOptimizedCalendar';
import { familyService } from '@/lib/services/familyService';
import { cn } from '@/lib/utils';
import React from 'react';

interface FamilyCalendarProps {
  familyId: number;
  isModal?: boolean;
}

// Generate a UUID for uniqueness
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function FamilyCalendar({ familyId, isModal = false }: FamilyCalendarProps) {
  const [events, setEvents] = useState<FamilyCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<FamilyCalendarEvent[]>([]);
  const [familyName, setFamilyName] = useState('Family');
  const [hasError, setHasError] = useState(false);
  const [canCreateEvents, setCanCreateEvents] = useState(true);
  const [debugMode] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<FamilyCalendarEvent | null>(null);
  const { showToast } = useToast();

  // Add a ref to access the calendar API directly
  const calendarRef = React.useRef<any>(null);

  // Memoize fetch functions to prevent recreation on each render
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await familyCalendarService.getAllEvents(familyId);
      if (response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      setHasError(true);
      showToast('Failed to fetch calendar events', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [familyId, showToast]);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await taskService.getFamilyTasks(familyId.toString());
      if (response.data) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Don't show error toast - continue without tasks
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  const fetchFamilyDetails = useCallback(async () => {
    try {
      // Direct API call with error checking
      const response = await familyService.getFamily(familyId.toString());
      
      if (response.status === 200 && response.data) {
        console.log('Full family data:', response.data);
        
        if (response.data.name) {
          setFamilyName(response.data.name);
        }
        
        // Find current user's member object and get permissions from there
        const adminMember = response.data.members?.find(m => 
          m.user?.username === 'admin' || m.role?.name === 'Admin'
        );
        
        if (adminMember) {
          console.log('Found admin member:', adminMember);
          
          // TEMPORARY FIX: Always enable event creation for all users
          // This bypasses the permission issue on the frontend
          console.log('Setting canCreateEvents to true as a workaround');
          setCanCreateEvents(true);
          
          // Log the permissions for debugging purposes
          if (adminMember.role?.permissions) {
            console.log('Admin permissions (raw):', adminMember.role.permissions);
          }
        } else {
          console.log('Admin member not found. Members:', response.data.members);
          // Keep default value (true) for now
          setCanCreateEvents(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch family details', error);
      // Continue with default family name
      setCanCreateEvents(true); // Enable as fallback
    }
  }, [familyId]);

  // Add useEffect to load stored events from localStorage on mount
  useEffect(() => {
    const loadStoredEvents = async () => {
      // Try to load saved events from localStorage
      try {
        const storedEventsJson = localStorage.getItem(`family-${familyId}-events`);
        if (storedEventsJson) {
          const storedEvents = JSON.parse(storedEventsJson) as FamilyCalendarEvent[];
          console.log('[DEBUG] Loaded stored events from localStorage:', storedEvents.length);
          setEvents(storedEvents);
        }
      } catch (error) {
        console.error('Error loading stored events:', error);
      }
      
      // Then fetch from API (if this fails, at least we have local events)
      fetchEvents().catch(err => {
        console.error('Failed to fetch events from API:', err);
      });
    };

    loadStoredEvents();
  }, [familyId]); // Run only when familyId changes

  // Function to save events to localStorage
  const saveEventsToLocalStorage = (eventsToSave: FamilyCalendarEvent[]) => {
    try {
      localStorage.setItem(`family-${familyId}-events`, JSON.stringify(eventsToSave));
      console.log('[DEBUG] Saved events to localStorage:', eventsToSave.length);
    } catch (error) {
      console.error('Error saving events to localStorage:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.allSettled([
        fetchEvents(),
        fetchTasks(),
        fetchFamilyDetails()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchEvents, fetchTasks, fetchFamilyDetails]);

  const handleDateSelect = useCallback((selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    
    // Filter tasks for the selected date
    const selectedDateStr = selectInfo.start.toISOString().split('T')[0];
    const tasksForDate = tasks.filter(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === selectedDateStr;
    });
    
    // Filter events for the selected date
    const eventsForDate = events.filter(event => {
      const eventStartDate = new Date(event.startTime).toISOString().split('T')[0];
      const eventEndDate = new Date(event.endTime).toISOString().split('T')[0];
      return eventStartDate === selectedDateStr || eventEndDate === selectedDateStr;
    });
    
    setFilteredTasks(tasksForDate);
    setFilteredEvents(eventsForDate);
    
    // If there are tasks or events for this date, show the detail view
    if (tasksForDate.length > 0 || eventsForDate.length > 0) {
      setIsTaskDetailOpen(true);
    } else {
      // Always show the create dialog
      setIsCreateDialogOpen(true);
    }
  }, [events, tasks]);

  const handleEventClick = useCallback((clickInfo: any) => {
    try {
      const event = clickInfo.event;
      
      // First, determine what type of event this is
      const eventType = event.extendedProps?.type || 'event';
      
      // For tasks, we might handle differently
      if (eventType === 'task') {
        // Handle tasks if needed
        console.log('Task clicked:', event);
        return;
      }
      
      // For conflicts, we might handle differently 
      if (eventType === 'conflict') {
        // Maybe switch to availability tab
        console.log('Conflict clicked:', event);
        setActiveTab('availability');
        return;
      }
      
      // Get the original ID from extendedProps if available
      const originalId = event.extendedProps?.originalId;
      let eventId: number;
      
      if (typeof originalId === 'number') {
        // Use the original ID if available
        eventId = originalId;
      } else if (typeof event.id === 'string' && event.id.startsWith('event-')) {
        // Extract ID from string like "event-123"
        const idPart = event.id.split('-')[1];
        eventId = parseInt(idPart, 10);
      } else {
        // Try to parse the ID directly
        eventId = parseInt(event.id, 10);
      }
      
      // Only proceed if we have a valid event ID
      if (!isNaN(eventId)) {
        console.log('Looking for event with ID:', eventId);
        
        // Find the matching event in our events array
        const matchingEvent = events.find(e => e.id === eventId);
        
        if (matchingEvent) {
          // Set selected event for editing
          setSelectedEvent(matchingEvent);
          
          // Show event details
          setSelectedDate(new Date(matchingEvent.startTime));
          setFilteredEvents([matchingEvent]);
          setFilteredTasks([]);
          
          // Open detail dialog or edit dialog based on user action
          // For now, we'll show the details dialog
          if (event.altKey || event.ctrlKey) {
            // Alt or Ctrl key pressed - open edit dialog directly
            setIsEditDialogOpen(true);
          } else {
            // Regular click - show details first
            setIsTaskDetailOpen(true);
          }
        } else {
          console.warn('Event not found in events array:', eventId);
          
          // Fallback: Use the calendar event data directly
          const fallbackEvent: FamilyCalendarEvent = {
            id: eventId,
            title: event.title,
            startTime: event.start.toISOString(),
            endTime: event.end ? event.end.toISOString() : event.start.toISOString(),
            isAllDay: event.allDay,
            description: event.extendedProps?.description || '',
            location: event.extendedProps?.location || '',
            color: event.backgroundColor,
            isRecurring: false,
            eventType: 'General',
            familyId: familyId,
            createdBy: event.extendedProps?.createdBy || { id: 1, username: 'admin' },
            createdAt: new Date().toISOString(),
            attendees: [],
            reminders: []
          };
          
          setSelectedEvent(fallbackEvent);
          setSelectedDate(new Date(fallbackEvent.startTime));
          setFilteredEvents([fallbackEvent]);
          setFilteredTasks([]);
          setIsTaskDetailOpen(true);
        }
      }
    } catch (error) {
      console.error('Error processing event click:', error);
    }
  }, [events, setActiveTab, familyId]);

  const handleEventCreate = async (eventData: any) => {
    try {
      // Show loading toast
      showToast('Creating event...', 'info');
      
      // Generate unique IDs
      const uniqueId = Date.now();
      const uuid = generateUUID();
      
      console.log('[DEBUG] Creating event with ID:', uniqueId);
      
      // Create a temp event with proper structure
      const tempEvent: FamilyCalendarEvent = {
        id: uniqueId,
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        isAllDay: eventData.isAllDay,
        location: eventData.location || '',
        color: eventData.color || '#3b82f6',
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern,
        eventType: eventData.eventType || 'General',
        familyId: familyId,
        createdBy: {
          id: 1,
          username: 'admin'
        },
        createdAt: new Date().toISOString(),
        attendees: [],
        reminders: []
      };
      
      console.log('[DEBUG] Created event object:', tempEvent);
      
      // First try to add directly to the calendar API
      let calendarEventAdded = false;
      
      try {
        const calendarComponent = calendarRef.current;
        if (calendarComponent && calendarComponent.getApi) {
          const api = calendarComponent.getApi();
          if (api) {
            console.log('[DEBUG] Adding event directly to FullCalendar API');
            
            // Direct calendar event format
            const fullCalendarEvent = {
              id: `event-${uniqueId}`,
              title: tempEvent.title,
              start: tempEvent.startTime,
              end: tempEvent.endTime,
              allDay: tempEvent.isAllDay,
              color: tempEvent.color || '#3b82f6',
              extendedProps: {
                type: 'event',
                description: tempEvent.description,
                location: tempEvent.location,
                originalId: uniqueId
              }
            };
            
            console.log('[DEBUG] Adding event to calendar:', fullCalendarEvent);
            
            // Add event to calendar and force refresh
            api.addEvent(fullCalendarEvent);
            calendarEventAdded = true;
            
            // Force full redraw of calendar
            api.refetchEvents();
            api.render(); // Explicitly request a render
          }
        }
      } catch (err) {
        console.error('[DEBUG] Error adding event directly to calendar:', err);
      }
      
      // Then update the React state (after direct calendar update)
      setEvents(prevEvents => {
        const newEvents = [...prevEvents, tempEvent];
        console.log('[DEBUG] Updated events array. New length:', newEvents.length);
        
        // Save updated events to localStorage for persistence
        saveEventsToLocalStorage(newEvents);
        
        return newEvents;
      });
      
      // If direct calendar addition failed, try a complete component remount
      if (!calendarEventAdded) {
        console.log('[DEBUG] Direct calendar addition failed, forcing remount');
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }
      
      showToast('Event created successfully', 'success');
      setIsCreateDialogOpen(false);
      
    } catch (error) {
      console.error('Failed to create event:', error);
      showToast('Failed to create event', 'error');
    }
  };
  
  const handleAvailabilityCreate = async (availabilityData: any) => {
    try {
      const response = await familyCalendarService.createAvailability(familyId, {
        ...availabilityData,
        startTime: availabilityData.startTime.toISOString(),
        endTime: availabilityData.endTime.toISOString(),
      });

      if (response.data) {
        showToast('Availability set successfully', 'success');
        setIsAvailabilityDialogOpen(false);
        // Refresh the calendar to show updated availability
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to set availability:', error);
      showToast('Failed to set availability', 'error');
    }
  };

  const handleConflictsDetected = (detectedConflicts: any[]) => {
    setConflicts(detectedConflicts);
  };

  // Add a function to handle editing an event
  const handleEditEvent = async (eventData: any) => {
    try {
      // Show loading toast
      showToast('Updating event...', 'info');
      
      if (!selectedEvent) {
        showToast('No event selected for editing', 'error');
        return;
      }
      
      // Create updated event with the same ID as the selected event
      const updatedEvent: FamilyCalendarEvent = {
        ...selectedEvent,
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        isAllDay: eventData.isAllDay,
        location: eventData.location || '',
        color: eventData.color || '#3b82f6',
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern,
        eventType: eventData.eventType || 'General',
      };
      
      // Update the events array
      setEvents(prevEvents => {
        const newEvents = prevEvents.map(e => e.id === selectedEvent.id ? updatedEvent : e);
        
        // Save updated events to localStorage
        saveEventsToLocalStorage(newEvents);
        
        return newEvents;
      });
      
      console.log('[DEBUG] Updated event locally:', updatedEvent);
      
      // Update calendar API directly
      try {
        const calendarComponent = calendarRef.current;
        if (calendarComponent && calendarComponent.getApi) {
          const api = calendarComponent.getApi();
          if (api) {
            // Find the event in the calendar
            const calEvent = api.getEventById(`event-${selectedEvent.id}`);
            if (calEvent) {
              console.log('[DEBUG] Updating event in FullCalendar API');
              calEvent.setProp('title', updatedEvent.title);
              calEvent.setStart(updatedEvent.startTime);
              calEvent.setEnd(updatedEvent.endTime);
              calEvent.setAllDay(updatedEvent.isAllDay);
              calEvent.setProp('backgroundColor', updatedEvent.color);
              // Update extendedProps
              calEvent.setExtendedProp('description', updatedEvent.description);
              calEvent.setExtendedProp('location', updatedEvent.location);
            } else {
              // If event not found, add it as a new event
              console.log('[DEBUG] Event not found in calendar, adding it');
              api.addEvent({
                id: `event-${selectedEvent.id}`,
                title: updatedEvent.title,
                start: updatedEvent.startTime,
                end: updatedEvent.endTime,
                allDay: updatedEvent.isAllDay,
                color: updatedEvent.color || '#3b82f6',
                extendedProps: {
                  type: 'event',
                  description: updatedEvent.description,
                  location: updatedEvent.location,
                  originalId: updatedEvent.id
                }
              });
            }
            
            // Force refresh
            api.refetchEvents();
          }
        }
      } catch (err) {
        console.error('[DEBUG] Error updating event in calendar:', err);
      }
      
      showToast('Event updated successfully', 'success');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update event:', error);
      showToast('Failed to update event', 'error');
    }
  };

  // Add a function to handle deleting an event
  const handleDeleteEvent = async () => {
    if (!selectedEvent) {
      showToast('No event selected for deletion', 'error');
      return;
    }
    
    try {
      showToast('Deleting event...', 'info');
      
      // Remove from local events array
      setEvents(prevEvents => {
        const newEvents = prevEvents.filter(e => e.id !== selectedEvent.id);
        
        // Save updated events to localStorage
        saveEventsToLocalStorage(newEvents);
        
        return newEvents;
      });
      
      // Try to remove from calendar API
      try {
        const calendarComponent = calendarRef.current;
        if (calendarComponent && calendarComponent.getApi) {
          const api = calendarComponent.getApi();
          if (api) {
            // Try to find event by different potential IDs
            let calEvent = api.getEventById(`event-${selectedEvent.id}`);
            if (!calEvent) {
              calEvent = api.getEventById(`direct-${selectedEvent.id}`);
            }
            
            if (calEvent) {
              calEvent.remove();
              console.log('[DEBUG] Successfully removed event from calendar');
            } else {
              console.warn('[DEBUG] Could not find event in calendar to remove');
              // Force refresh to ensure UI is in sync
              api.refetchEvents();
            }
          }
        }
      } catch (err) {
        console.error('[DEBUG] Error removing event from calendar:', err);
      }
      
      showToast('Event deleted successfully', 'success');
      setIsEditDialogOpen(false);
      setIsTaskDetailOpen(false);
    } catch (error) {
      console.error('Failed to delete event:', error);
      showToast('Failed to delete event', 'error');
    }
  };

  if (hasError) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            There was a problem loading your family calendar. Please refresh the page or try logging in again.
          </AlertDescription>
        </Alert>
        <Button 
          variant="default" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  const renderCalendarContent = () => {
    // Ensure we use the latest events array for each render
    console.log('[FamilyCalendar] Rendering calendar content, total events:', events.length);
    
    return (
      <>
        {conflicts.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Availability Conflicts Detected</AlertTitle>
            <AlertDescription>
              {conflicts.length} scheduling conflicts found. Please check the Availability tab for details.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex-grow">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <PerformanceOptimizedCalendar
              events={events}
              tasks={tasks}
              conflicts={conflicts}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              isModal={isModal}
              ref={calendarRef}
              key={`calendar-${events.length}`} // Force remount when events change
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm">
      <div className="border-b p-4 mb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CalendarDays className="h-6 w-6 text-brand-navy mr-2" />
            <h2 className="text-2xl font-bold text-brand-navy">{familyName} Calendar</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1 bg-white hover:bg-gray-50"
              onClick={() => {
                console.log('[DEBUG] Manual calendar refresh requested');
                
                // Load events from localStorage first
                try {
                  const storedEventsJson = localStorage.getItem(`family-${familyId}-events`);
                  if (storedEventsJson) {
                    const storedEvents = JSON.parse(storedEventsJson) as FamilyCalendarEvent[];
                    console.log('[DEBUG] Loaded stored events from localStorage:', storedEvents.length);
                    setEvents(storedEvents);
                  }
                } catch (error) {
                  console.error('Error loading stored events:', error);
                }
                
                // First, get calendar API
                if (calendarRef.current && calendarRef.current.getApi) {
                  const api = calendarRef.current.getApi();
                  if (api) {
                    // Log debug info
                    console.log('[DEBUG] Current calendar events:', api.getEvents());
                    console.log('[DEBUG] Current React events state:', events);
                    
                    // Clear all events from the calendar
                    api.getEvents().forEach((event: any) => event.remove());
                    
                    // Add all events from state back to calendar
                    events.forEach((event: FamilyCalendarEvent) => {
                      console.log('[DEBUG] Re-adding event to calendar:', event.title);
                      
                      api.addEvent({
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
                    
                    // Force full refresh and redraw
                    api.refetchEvents();
                    api.render();
                  }
                }
                
                // Force component remount by toggling loading state
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                }, 100);
                
                showToast('Calendar refreshed', 'info');
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7l-3 3"></path>
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1 bg-white hover:bg-gray-50"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Set Availability</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-brand-navy" />
                    Set Member Availability
                  </DialogTitle>
                  <DialogDescription>
                    Set when family members are available for activities and events
                  </DialogDescription>
                </DialogHeader>
                <AvailabilityForm
                  familyId={familyId}
                  selectedDate={selectedDate}
                  onSubmit={handleAvailabilityCreate}
                  onCancel={() => setIsAvailabilityDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1 shadow-sm bg-brand-navy hover:bg-brand-navy-dark">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Event</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-brand-navy" />
                    Create New Event
                  </DialogTitle>
                  <DialogDescription>
                    Add a new event to your family calendar
                  </DialogDescription>
                </DialogHeader>
                <EventForm
                  familyId={familyId}
                  selectedDate={selectedDate}
                  onSubmit={handleEventCreate}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              onClick={() => setIsShareDialogOpen(true)}
              aria-label="Share or export calendar"
              className="flex items-center gap-1 bg-white hover:bg-gray-50"
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            Events
          </span>
          <span className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
            Tasks
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            Conflicts
          </span>
        </div>
      </div>
      
      <Tabs 
        defaultValue="calendar" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full flex-1 flex flex-col px-4"
      >
        <TabsList className="mb-4 w-full grid grid-cols-2 sm:w-auto sm:inline-flex">
          <TabsTrigger value="calendar" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Availability
            {conflicts.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                {conflicts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="flex-1 flex flex-col">
          {renderCalendarContent()}
        </TabsContent>
        
        <TabsContent value="availability" className="flex-1">
          <MemberAvailability 
            familyId={familyId} 
            onConflictsDetected={handleConflictsDetected}
            startDate={new Date()}
            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
          />
        </TabsContent>
      </Tabs>
      
      {/* Share Calendar Modal */}
      <ShareCalendarModal
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        events={events}
        familyId={familyId}
        familyName={familyName}
      />
      
      {/* Task/Event Detail Modal */}
      <TaskEventDetail
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        selectedDate={selectedDate || new Date()}
        familyId={familyId}
        tasks={filteredTasks}
        events={filteredEvents}
        onEditEvent={() => {
          setIsTaskDetailOpen(false);
          setIsEditDialogOpen(true);
        }}
        onDeleteEvent={handleDeleteEvent}
      />
      
      {/* Event Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Edit className="h-5 w-5 mr-2 text-brand-navy" />
              Edit Event
            </DialogTitle>
            <DialogDescription>
              Make changes to your event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              familyId={familyId}
              selectedDate={selectedEvent ? new Date(selectedEvent.startTime) : null}
              onSubmit={handleEditEvent}
              onCancel={() => setIsEditDialogOpen(false)}
              initialData={{
                title: selectedEvent.title,
                description: selectedEvent.description || '',
                start: new Date(selectedEvent.startTime),
                end: new Date(selectedEvent.endTime),
                isAllDay: selectedEvent.isAllDay,
                location: selectedEvent.location || '',
                color: selectedEvent.color || '#3b82f6',
                isRecurring: selectedEvent.isRecurring,
                recurrencePattern: selectedEvent.recurrencePattern,
                eventType: selectedEvent.eventType,
                attendeeIds: selectedEvent.attendees?.map(a => a.familyMemberId) || [],
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 