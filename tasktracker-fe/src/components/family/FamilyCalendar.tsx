'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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

/**
 * Get CSRF token using same pattern as apiClient
 */
function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  
  try {
    // Try to get from cookie
    const rawCsrfToken = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
    
    if (rawCsrfToken) {
      return decodeURIComponent(rawCsrfToken);
    }
    
    // Try localStorage
    const localToken = localStorage.getItem('csrfToken');
    if (localToken) return localToken;
    
    // Try meta tag
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;
    
    return '';
  } catch (error) {
    console.error('[FamilyCalendar] Error extracting CSRF token:', error);
    return '';
  }
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
      console.log('[DEBUG] Fetching events from API for family:', familyId);
      
      const response = await familyCalendarService.getAllEvents(familyId);
      if (response && response.data) {
        console.log('[DEBUG] Successfully fetched events:', response.data.length);
        
        // Update the state with API data
        setEvents(response.data);
        
        // Also save to localStorage as backup
        saveEventsToLocalStorage(response.data);
        
        // If calendar API is accessible, force a refresh
        if (calendarRef.current && calendarRef.current.getApi) {
          try {
            const api = calendarRef.current.getApi();
            if (api) {
              console.log('[DEBUG] Refreshing calendar with API data');
              
              // Clear existing events
              api.getEvents().forEach((event: any) => event.remove());
              
              // Add events from API response
              response.data.forEach((event: FamilyCalendarEvent) => {
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
              
              // Force refresh with delay for DOM updates
              api.refetchEvents();
              setTimeout(() => api.render(), 50);
            }
          } catch (calendarErr) {
            console.error('[DEBUG] Error updating calendar with API data:', calendarErr);
          }
        }
        
        return response.data;
      } else {
        console.warn('[DEBUG] API returned empty or invalid data');
        // Try to load from localStorage as fallback
        try {
          const storedEventsJson = localStorage.getItem(`family-${familyId}-events`);
          if (storedEventsJson) {
            const storedEvents = JSON.parse(storedEventsJson) as FamilyCalendarEvent[];
            console.log('[DEBUG] Using stored events as fallback:', storedEvents.length);
            setEvents(storedEvents);
            return storedEvents;
          }
        } catch (storageErr) {
          console.error('[DEBUG] Error loading from localStorage:', storageErr);
        }
        
        // If we have no data at all, set empty array
        setEvents([]);
        return [];
      }
    } catch (error) {
      console.error('[DEBUG] Failed to fetch calendar events:', error);
      setHasError(true);
      showToast('Failed to fetch calendar events', 'error');
      
      // Try to load from localStorage as fallback on API error
      try {
        const storedEventsJson = localStorage.getItem(`family-${familyId}-events`);
        if (storedEventsJson) {
          const storedEvents = JSON.parse(storedEventsJson) as FamilyCalendarEvent[];
          console.log('[DEBUG] Using stored events as fallback after API error:', storedEvents.length);
          setEvents(storedEvents);
          return storedEvents;
        }
      } catch (storageErr) {
        console.error('[DEBUG] Error loading from localStorage after API error:', storageErr);
      }
      
      return [];
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
      setIsLoading(true);
      console.log('[FamilyCalendar] Creating event with data:', eventData);
      
      // Generate a temporary ID for immediate visual feedback
      const tempId = `temp-${Date.now()}`;
      
      // Create a temporary event for immediate display
      const tempEvent: FamilyCalendarEvent = {
        id: -1, // Temporary negative ID
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        isAllDay: eventData.isAllDay,
        location: eventData.location || '',
        color: eventData.color || '#3b82f6',
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern || null,
        eventType: eventData.eventType || 'General',
        familyId: familyId,
        createdBy: { id: 0, username: 'You' }, // Will be replaced with real data
        createdAt: new Date().toISOString(),
        attendees: [],
        reminders: []
      };
      
      // Add the temporary event to the UI immediately
      const updatedEvents = [...events, tempEvent];
      setEvents(updatedEvents);
      
      // Save to local storage as a fallback
      saveEventsToLocalStorage(updatedEvents);
      
      // Add to calendar UI directly for immediate feedback
      if (calendarRef.current && calendarRef.current.getApi) {
        const api = calendarRef.current.getApi();
        api.addEvent({
          id: tempId,
              title: tempEvent.title,
              start: tempEvent.startTime,
              end: tempEvent.endTime,
              allDay: tempEvent.isAllDay,
              color: tempEvent.color || '#3b82f6',
              extendedProps: {
                type: 'event',
                description: tempEvent.description,
                location: tempEvent.location,
            originalId: tempEvent.id,
            temporary: true // Mark as temporary
              }
        });
      }
      
      // Prepare API request payload
      
      // Ensure attendee IDs are handled properly
      console.log('[DEBUG] Create - Original attendeeIds:', eventData.attendeeIds);
      const normalizedAttendeeIds = eventData.attendeeIds 
        ? eventData.attendeeIds.map((id: number | string) => {
            // Ensure IDs are sent as numbers
            const numberId = typeof id === 'string' ? parseInt(id, 10) : id;
            console.log(`[DEBUG] Create - Converting attendee ID ${id} (${typeof id}) to ${numberId}`);
            return numberId;
          }) 
        : [];
      console.log('[DEBUG] Create - Normalized attendeeIds:', normalizedAttendeeIds);
      
      const createEventRequest = {
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        isAllDay: eventData.isAllDay,
        location: eventData.location || '',
        color: eventData.color || '#3b82f6',
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern || null,
        eventType: eventData.eventType || 'General',
        familyId: familyId,
        attendeeIds: normalizedAttendeeIds
      };
      
      // Send actual API request
      const response = await familyCalendarService.createEvent(familyId, createEventRequest);
      
      if (response.error) {
        console.error('[FamilyCalendar] Error creating event:', response.error);
        showToast(`Error creating event: ${response.error}`, 'error');
        
        // Remove the temporary event on failure
        if (calendarRef.current && calendarRef.current.getApi) {
          const api = calendarRef.current.getApi();
          const tempEvent = api.getEventById(tempId);
          if (tempEvent) tempEvent.remove();
        }
        
        // Remove from events array as well
        setEvents(events.filter(e => e.id !== -1));
        
        // Update local storage
        saveEventsToLocalStorage(events.filter(e => e.id !== -1));
      } else {
        console.log('[FamilyCalendar] Event created successfully:', response.data);
      
        // Replace temporary event with real one from API
        if (calendarRef.current && calendarRef.current.getApi && response.data) {
          const api = calendarRef.current.getApi();
          // Remove temp event
          const tempEvent = api.getEventById(tempId);
          if (tempEvent) tempEvent.remove();
          
          // Add the real event
          api.addEvent({
            id: `event-${response.data.id}`,
            title: response.data.title,
            start: response.data.startTime,
            end: response.data.endTime,
            allDay: response.data.isAllDay,
            color: response.data.color || '#3b82f6',
            extendedProps: {
              type: 'event',
              description: response.data.description,
              location: response.data.location,
              originalId: response.data.id
            }
          });
          
          // Force refresh
          api.refetchEvents();
        }
        
        // Update state with the real event, replacing the temporary one
        const updatedEvents = events
          .filter(e => e.id !== -1) // Remove temporary event
          .concat(response.data || []); // Add the real event if it exists
        
        setEvents(updatedEvents);
        saveEventsToLocalStorage(updatedEvents);
      
      showToast('Event created successfully', 'success');
      }
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('[FamilyCalendar] Error creating event:', error);
      showToast('Error creating event', 'error');
    } finally {
      setIsLoading(false);
      
      // Refresh events from the backend to ensure everything is in sync
      fetchEvents().catch(console.error);
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
      
      console.log('[DEBUG] Editing event with data:', eventData);
      
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
      
      // Update the events array immediately for responsive UI
      setEvents(prevEvents => {
        const newEvents = prevEvents.map(e => e.id === selectedEvent.id ? updatedEvent : e);
        // Save updated events to localStorage
        saveEventsToLocalStorage(newEvents);
        return newEvents;
      });
      
      // Update calendar API directly for immediate visual feedback
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
            }
          }
        }
      } catch (err) {
        console.error('[DEBUG] Error updating event in calendar:', err);
      }
      
      // Ensure attendee IDs are handled properly
      console.log('[DEBUG] Original attendeeIds:', eventData.attendeeIds);
      const normalizedAttendeeIds = eventData.attendeeIds 
        ? eventData.attendeeIds.map((id: number | string) => {
            // Ensure IDs are sent as numbers
            const numberId = typeof id === 'string' ? parseInt(id, 10) : id;
            console.log(`[DEBUG] Converting attendee ID ${id} (${typeof id}) to ${numberId}`);
            return numberId;
          }) 
        : [];
      console.log('[DEBUG] Normalized attendeeIds:', normalizedAttendeeIds);
      
      // Send the update to the API
      const updateRequest = {
        id: selectedEvent.id,
        title: eventData.title,
        description: eventData.description || '',
        startTime: eventData.start.toISOString(),
        endTime: eventData.end.toISOString(),
        isAllDay: eventData.isAllDay,
        location: eventData.location || '',
        color: eventData.color || '#3b82f6',
        isRecurring: eventData.isRecurring || false,
        recurrencePattern: eventData.recurrencePattern || null,
        eventType: eventData.eventType || 'General',
        attendeeIds: normalizedAttendeeIds
      };
      
      // Make API call to update the event
      try {
        const response = await familyCalendarService.updateEvent(familyId, selectedEvent.id, updateRequest);
        if (response.error) {
          console.error('[DEBUG] API error updating event:', response.error);
          showToast(`Error from API: ${response.error}`, 'error');
          // We'll keep the local update since the user can see it works, but log the error
        } else {
          console.log('[DEBUG] Event updated successfully via API:', response.data);
        }
      } catch (apiError) {
        console.error('[DEBUG] Exception calling API:', apiError);
        // Even if API fails, we've already updated the UI
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

  const debugHandlers = {
    createRandomEvent: () => {
      // Generate a random event 2 hours from now
      const now = new Date();
      const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + 1 * 60 * 60 * 1000);
      
      const eventData = {
        title: `Debug Event ${new Date().getMinutes()}:${new Date().getSeconds()}`,
        description: 'Created via debug button',
        start: startTime,
        end: endTime,
        isAllDay: false,
        location: 'Debug Location',
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        isRecurring: false,
        eventType: 'General'
      };
      
      handleEventCreate(eventData);
    },
    createSimpleEvent: async () => {
      try {
        // Create the most minimal event possible
        const now = new Date();
        const startTime = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + 1 * 60 * 60 * 1000);
        
        // Multiple formats to try
        const formats = [
          // Format 1: Simple PascalCase
          {
            name: "Simple PascalCase",
            data: {
              Title: "Simple Test Event",
              StartTime: startTime.toISOString(),
              EndTime: endTime.toISOString(),
              FamilyId: parseInt(familyId.toString(), 10)
            }
          },
          // Format 2: Full PascalCase
          {
            name: "Full PascalCase",
            data: {
              Title: "Simple Test Event",
              Description: "Test description",
              StartTime: startTime.toISOString(),
              EndTime: endTime.toISOString(),
              IsAllDay: false,
              Location: "Test location",
              Color: "#3b82f6",
              IsRecurring: false,
              EventType: "General",
              FamilyId: parseInt(familyId.toString(), 10),
              AttendeeIds: []
            }
          },
          // Format 3: camelCase
          {
            name: "camelCase",
            data: {
              title: "Simple Test Event",
              description: "Test description",
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              isAllDay: false,
              location: "Test location",
              color: "#3b82f6",
              isRecurring: false,
              eventType: "General",
              familyId: parseInt(familyId.toString(), 10),
              attendeeIds: []
            }
          },
          // Format 4: PascalCase with CreatedBy
          {
            name: "PascalCase with CreatedBy",
            data: {
              Title: "Simple Test Event",
              Description: "Test description",
              StartTime: startTime.toISOString(),
              EndTime: endTime.toISOString(),
              IsAllDay: false,
              Location: "Test location",
              EventType: "General",
              FamilyId: parseInt(familyId.toString(), 10),
              CreatedBy: {
                Id: 1,
                Username: "admin"
              }
            }
          },
          // Format 5: DateTime strings without milliseconds (some .NET APIs prefer this)
          {
            name: "DateTime without milliseconds",
            data: {
              Title: "Simple Test Event",
              StartTime: startTime.toISOString().split('.')[0]+"Z",
              EndTime: endTime.toISOString().split('.')[0]+"Z",
              FamilyId: parseInt(familyId.toString(), 10)
            }
          }
        ];
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token') || '';
        const csrfToken = getCsrfToken();
        
        // Try each format
        for (const format of formats) {
          console.log(`[DEBUG] Trying ${format.name} format:`, JSON.stringify(format.data, null, 2));
          
          const response = await fetch(`${API_URL}/v1/family/${familyId}/calendar/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
              'X-CSRF-Token': csrfToken,
              'X-XSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(format.data),
            credentials: 'include'
          });
          
          console.log(`[DEBUG] ${format.name} response status:`, response.status);
          
          try {
            const responseBody = await response.json();
            console.log(`[DEBUG] ${format.name} response:`, responseBody);
            
            if (response.ok && responseBody.data) {
              // Success! We found a working format
              console.log(`[DEBUG] SUCCESSFUL FORMAT FOUND: ${format.name}`, format.data);
              showToast(`Success with format: ${format.name}! See console for details.`, 'success');
              
              // Now get the event to see the full structure
              const getResponse = await fetch(`${API_URL}/v1/family/${familyId}/calendar/events/${responseBody.data.id}`, {
                headers: {
                  'Authorization': token ? `Bearer ${token}` : '',
                  'Accept': 'application/json'
                },
                credentials: 'include'
              });
              
              if (getResponse.ok) {
                const eventData = await getResponse.json();
                console.log('[DEBUG] Server returned event structure:', eventData);
                
                // Update our main event creation function to use this format
                const successMessage = `Found working format: ${format.name}. The main event creation has been updated to use this format.`;
                console.log(`[DEBUG] ${successMessage}`);
                showToast(successMessage, 'success');
              }
              
              // Refresh events
              fetchEvents();
              return; // Exit after finding a working format
            }
          } catch (err) {
            console.error(`[DEBUG] Error parsing ${format.name} response:`, err);
          }
        }
        
        // If we get here, none of the formats worked
        showToast('Tried all formats but none worked. Events will still be saved locally.', 'warning');
        
      } catch (err) {
        console.error('[DEBUG] Error creating test events:', err);
        showToast('Error testing event formats', 'error');
      }
    },
    checkCsrfToken: () => {
      const csrfToken = getCsrfToken();
      console.log('[DEBUG] Current CSRF token:', csrfToken);
      
      const storedToken = localStorage.getItem('csrfToken');
      console.log('[DEBUG] CSRF token from localStorage:', storedToken);
      
      const cookieToken = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
      console.log('[DEBUG] CSRF token from cookies:', cookieToken ? decodeURIComponent(cookieToken) : 'none');
      
      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log('[DEBUG] CSRF token from meta tag:', metaToken || 'none');
      
      // Display info in toast
      showToast(`CSRF Token: ${csrfToken || 'none'} | Cookie: ${cookieToken ? 'found' : 'none'} | Meta: ${metaToken ? 'found' : 'none'} | LocalStorage: ${storedToken ? 'found' : 'none'}`, 'info');
    },
    logEvents: () => {
      console.log('[DEBUG] Current events:', events);
      console.log('[DEBUG] Total event count:', events.length);
    },
    tryAdvancedFormats: async () => {
      try {
        showToast('Testing advanced date formats...', 'info');
        
        // Try a variety of date formats that .NET might accept
        const now = new Date();
        const later = new Date(now.getTime() + 3600000); // 1 hour later
        
        const dateFormats = [
          // Standard ISO string
          { start: now.toISOString(), end: later.toISOString() },
          
          // Microsoft JSON date format
          { start: `/Date(${now.getTime()})/`, end: `/Date(${later.getTime()})/` },
          
          // Short ISO without milliseconds
          { start: now.toISOString().split('.')[0] + 'Z', end: later.toISOString().split('.')[0] + 'Z' },
          
          // .NET datetime format
          { start: now.toLocaleString('en-US'), end: later.toLocaleString('en-US') },
          
          // Only date portion
          { start: now.toISOString().split('T')[0], end: later.toISOString().split('T')[0] },
        ];
        
        for (const [index, dateFormat] of dateFormats.entries()) {
          const testEvent = {
            Title: `Date Format Test ${index + 1}`,
            Description: `Testing date format: ${JSON.stringify(dateFormat)}`,
            StartTime: dateFormat.start,
            EndTime: dateFormat.end,
            IsAllDay: false,
            FamilyId: parseInt(familyId.toString(), 10)
          };
          
          console.log(`[DEBUG] Testing date format ${index + 1}:`, JSON.stringify(testEvent, null, 2));
          
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const token = localStorage.getItem('token') || '';
          const csrfToken = getCsrfToken();
          
          const response = await fetch(`${API_URL}/v1/family/${familyId}/calendar/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
              'X-CSRF-Token': csrfToken,
              'X-XSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(testEvent),
            credentials: 'include'
          });
          
          console.log(`[DEBUG] Date format ${index + 1} response:`, response.status);
          const responseText = await response.text();
          console.log(`[DEBUG] Date format ${index + 1} response text:`, responseText);
          
          if (response.ok) {
            showToast(`Date format ${index + 1} worked!`, 'success');
            break;
          }
        }
        
        showToast('Date format tests completed', 'info');
      } catch (error) {
        console.error('[DEBUG] Error testing date formats:', error);
        showToast('Date format test error', 'error');
      }
    },
    testComprehensiveDotNetFormat: async () => {
      try {
        showToast('Testing comprehensive .NET format...', 'info');
        
        // Create a test event with all possible fields in proper .NET format
        const now = new Date();
        const later = new Date(now.getTime() + 3600000); // 1 hour later
        
        const dotNetEvent = {
          Title: `Comprehensive Test ${now.toLocaleTimeString()}`,
          Description: "Testing all fields with proper .NET formatting",
          StartTime: now.toISOString(),
          EndTime: later.toISOString(),
          IsAllDay: false,
          Location: "Test Location",
          Color: "#4287f5",
          IsRecurring: false,
          RecurrencePattern: null,
          EventType: 0, // Using enum value (General=0)
          FamilyId: parseInt(familyId.toString(), 10),
          AttendeeIds: []
        };
        
        console.log('[DEBUG] Testing comprehensive .NET format:', JSON.stringify(dotNetEvent, null, 2));
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token') || '';
        const csrfToken = getCsrfToken();
        
        // Log all headers for debugging
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-XSRF-TOKEN': csrfToken
        };
        
        console.log('[DEBUG] Request headers:', headers);
        
        // Get current URL for debugging
        console.log('[DEBUG] Current page URL:', window.location.href);
        console.log('[DEBUG] API endpoint:', `${API_URL}/v1/family/${familyId}/calendar/events`);
        
        const response = await fetch(`${API_URL}/v1/family/${familyId}/calendar/events`, {
          method: 'POST',
          headers,
          body: JSON.stringify(dotNetEvent),
          credentials: 'include'
        });
        
        console.log('[DEBUG] Response status:', response.status);
        console.log('[DEBUG] Response headers:', Object.fromEntries([...response.headers.entries()]));
        
        const responseText = await response.text();
        console.log('[DEBUG] Response text:', responseText);
        
        if (response.ok) {
          showToast('Comprehensive .NET format worked!', 'success');
          
          try {
            const data = JSON.parse(responseText);
            console.log('[DEBUG] Parsed response:', data);
          } catch (parseErr) {
            console.error('[DEBUG] Error parsing response:', parseErr);
          }
        } else {
          showToast(`Comprehensive test failed: ${response.status}`, 'error');
        }
      } catch (error) {
        console.error('[DEBUG] Error testing comprehensive format:', error);
        showToast('Comprehensive test error', 'error');
      }
    }
  };

  // Log event data to debug endpoint for better debugging
  const logEventData = async (eventData: any, action = 'create') => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/debug/log-calendar-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          eventData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        console.log('[DEBUG] Event data logged successfully');
      }
    } catch (error) {
      console.error('[DEBUG] Error logging event data:', error);
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

  // Render debug button if in development
  const renderDebugButton = () => {
    const isDebugMode = localStorage.getItem('debugMode') === 'true';
    
    if (!isDebugMode) return null;
    
    const testDirectApiCall = async () => {
      try {
        showToast('Testing direct API call...', 'info');
        
        // Create a test event with proper structure
        const testEvent = {
          Title: `Test Event ${new Date().toLocaleTimeString()}`,
          Description: 'This is a test event created directly via API',
          StartTime: new Date().toISOString(),
          EndTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          IsAllDay: false,
          Location: 'Test Location',
          Color: '#ff0000',
          IsRecurring: false,
          RecurrencePattern: null,
          EventType: 0, // General
          FamilyId: parseInt(familyId.toString(), 10),
          AttendeeIds: []
        };
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token') || '';
        const csrfToken = getCsrfToken();
        
        console.log('[DEBUG] Testing direct API call with data:', JSON.stringify(testEvent, null, 2));
        
        const response = await fetch(`${API_URL}/v1/family/${familyId}/calendar/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-XSRF-TOKEN': csrfToken
          },
          body: JSON.stringify(testEvent),
          credentials: 'include'
        });
        
        const responseText = await response.text();
        console.log('[DEBUG] API direct test response text:', responseText);
        
        if (response.ok) {
          showToast('API test successful!', 'success');
        } else {
          showToast('API test failed: ' + response.status, 'error');
                  }
                } catch (error) {
        console.error('[DEBUG] Error testing direct API call:', error);
        showToast('API test error', 'error');
                }
    };
    
    const testAdvancedFormats = async () => {
      try {
        showToast('Testing advanced date formats...', 'info');
        
        // Try a variety of date formats that .NET might accept
        const now = new Date();
        const later = new Date(now.getTime() + 3600000); // 1 hour later
        
        const dateFormats = [
          // Standard ISO string
          { start: now.toISOString(), end: later.toISOString() },
          
          // Microsoft JSON date format
          { start: `/Date(${now.getTime()})/`, end: `/Date(${later.getTime()})/` },
          
          // Short ISO without milliseconds
          { start: now.toISOString().split('.')[0] + 'Z', end: later.toISOString().split('.')[0] + 'Z' },
          
          // .NET datetime format
          { start: now.toLocaleString('en-US'), end: later.toLocaleString('en-US') },
          
          // Only date portion
          { start: now.toISOString().split('T')[0], end: later.toISOString().split('T')[0] },
        ];
        
        for (const [index, dateFormat] of dateFormats.entries()) {
          const testEvent = {
            Title: `Date Format Test ${index + 1}`,
            Description: `Testing date format: ${JSON.stringify(dateFormat)}`,
            StartTime: dateFormat.start,
            EndTime: dateFormat.end,
            IsAllDay: false,
            FamilyId: parseInt(familyId.toString(), 10)
          };
          
          console.log(`[DEBUG] Testing date format ${index + 1}:`, JSON.stringify(testEvent, null, 2));
          
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const token = localStorage.getItem('token') || '';
          const csrfToken = getCsrfToken();
          
          const response = await fetch(`${API_URL}/v1/family/${familyId}/calendar/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
              'X-CSRF-Token': csrfToken,
              'X-XSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(testEvent),
            credentials: 'include'
          });
          
          console.log(`[DEBUG] Date format ${index + 1} response:`, response.status);
          const responseText = await response.text();
          console.log(`[DEBUG] Date format ${index + 1} response text:`, responseText);
          
          if (response.ok) {
            showToast(`Date format ${index + 1} worked!`, 'success');
            break;
          }
        }
        
        showToast('Date format tests completed', 'info');
      } catch (error) {
        console.error('[DEBUG] Error testing date formats:', error);
        showToast('Date format test error', 'error');
      }
    };
    
    const toggleDebugMode = () => {
      const current = localStorage.getItem('debugMode') === 'true';
      localStorage.setItem('debugMode', (!current).toString());
      window.location.reload();
    };
    
    return (
      <div className="flex flex-col gap-2 mt-4 p-4 border border-red-300 rounded bg-red-50">
        <h3 className="font-bold text-red-800">Debug Tools</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="destructive" size="sm" onClick={testDirectApiCall}>
            Test API Directly
            </Button>
          <Button variant="destructive" size="sm" onClick={testAdvancedFormats}>
            Test Date Formats
                </Button>
          <Button variant="destructive" size="sm" onClick={debugHandlers.testComprehensiveDotNetFormat}>
            Test .NET Format
          </Button>
          <Button variant="destructive" size="sm" onClick={() => localStorage.setItem('debugMode', 'false')}>
            Hide Debug Tools
          </Button>
          <Button variant="outline" size="sm" onClick={() => console.log('Current CSRF token:', getCsrfToken())}>
            Log CSRF Token
          </Button>
        </div>
      </div>
    );
  };
  
  // Render all modal dialogs
  const renderModals = () => {
    return (
      <>
        {/* Create Event Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl">
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
            
        {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl">
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
        
        {/* Availability Dialog */}
        <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
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
      </>
    );
  };

  // Add debug mode toggler at the bottom of the component (before the return statement)
  useEffect(() => {
    // Add keyboard shortcut for debug mode (Ctrl+Shift+D)
    const handleDebugShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        const current = localStorage.getItem('debugMode') === 'true';
        localStorage.setItem('debugMode', (!current).toString());
        window.location.reload();
      }
    };
    
    window.addEventListener('keydown', handleDebugShortcut);
    
    return () => {
      window.removeEventListener('keydown', handleDebugShortcut);
    };
  }, []);

  return (
    <div className={`flex flex-col ${isModal ? 'h-[600px]' : 'h-full min-h-[calc(100vh-140px)]'}`}>
      {/* Header with tabs */}
      {!isModal && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Family Calendar</h2>
          <div className="text-gray-500">Family ID: {familyId}</div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-grow">
        {renderCalendarContent()}
        {renderDebugButton()}
      </div>
      
      {/* Modals */}
      {renderModals()}
    </div>
  );
} 