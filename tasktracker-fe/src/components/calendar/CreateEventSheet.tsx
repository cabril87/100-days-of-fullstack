'use client';

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar,
  Clock,
  CheckSquare,
  Plus,
  Edit3,
  Trash2,
  Users,
  MapPin,
  Star,
  Trophy,
  Sparkles,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/helpers/utils/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useResponsive, useTouchOptimized } from '@/lib/hooks/useResponsive';
import { triggerHapticFeedback } from '@/lib/hooks/useMobileGestures';

// Form validation imports - Following Enterprise Standards
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Services and hooks
import { calendarService } from '@/lib/services/calendarService';

// Types - Following enterprise standards with proper lib organization
import type { 
    CalendarEventDTO,
    PendingEventData
} from '@/lib/types/calendar';
import type { FamilyTaskItemDTO } from '@/lib/types/tasks';

// Smart Family Calendar Components
// import FamilyConflictDetection, { type ConflictData, type ResolutionSuggestion } from './FamilyConflictDetection';
// import FamilyAvailabilityManager from './FamilyAvailabilityManager';

// Component-specific types and constants from lib/types
import type { 
    CreateEventSheetProps
} from '@/lib/types/calendar-components';

import { EVENT_COLORS, PRIORITY_OPTIONS } from '@/lib/types/calendar';

// Form schemas from lib/schemas
import { eventFormSchema, taskFormSchema, type EventFormData, type TaskFormData } from '@/lib/schemas/calendar';

// Utility functions from lib/utils
import { getSafeDate } from '@/lib/helpers/utils/calendar-helpers';

export default function CreateEventSheet({
    isOpen,
    onClose,
    selectedDate,
    selectedTime,
    familyId,
    allFamilies,
    familyMembers,
    existingEvents,
    existingTasks,
    onEventCreated,
    onTaskCreated,
    onEventUpdated,
    onTaskUpdated,
    onEventDeleted,
    onTaskDeleted,
    isEditMode = false,
    editingEvent = null,
    editingTask = null
}: CreateEventSheetProps) {

    // ============================================================================
    // ENTERPRISE RESPONSIVE SYSTEM
    // ============================================================================
    
    const responsive = useResponsive();
    const { touchClasses, buttonSize, animationClasses } = useTouchOptimized();

    // ============================================================================
    // STATE MANAGEMENT - Enterprise Standards
    // ============================================================================

    const [activeTab, setActiveTab] = useState<'create' | 'view' | 'smart'>('create');
    const [itemType, setItemType] = useState<'event' | 'task'>('event');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Conflict resolution state
    const [pendingEventData, setPendingEventData] = useState<PendingEventData | null>(null);

    // Smart Family Features state - commented out until features are fully implemented
    // const [conflictData, setConflictData] = useState<ConflictData | null>(null);
    // const [showSmartFeatures, setShowSmartFeatures] = useState(false);


    // ============================================================================
    // REACT HOOK FORM SETUP - Following Enterprise Standards
    // ============================================================================

    const eventForm = useForm<EventFormData>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: '',
            description: '',
            startDate: getSafeDate(selectedDate).toISOString().split('T')[0],
            startTime: selectedTime || '09:00',
            endDate: getSafeDate(selectedDate).toISOString().split('T')[0],
            endTime: '10:00',
            color: EVENT_COLORS[0],
            location: '',
            isAllDay: false,
            isRecurring: false,
            recurringPattern: 'weekly',
        }
    });

    const taskForm = useForm<TaskFormData>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: '',
            description: '',
            dueDate: getSafeDate(selectedDate).toISOString().split('T')[0],
            dueTime: selectedTime || '17:00',
            priority: 'medium',
            estimatedHours: 1,
            pointsValue: 10,
            taskType: 'personal',
            selectedFamilyId: undefined,
            assignedToUserId: undefined,
        }
    });

    // ============================================================================
    // SMART FAMILY FEATURES HANDLERS - Commented out until features are implemented
    // ============================================================================

    // const handleConflictDetected = React.useCallback((conflicts: ConflictData) => {
    //     setConflictData(conflicts);
    //     console.log('⚠️ Family conflicts detected:', conflicts);
        
    //     // Auto-show smart features tab if conflicts exist
    //     if (conflicts.hasConflicts && activeTab === 'create') {
    //         setShowSmartFeatures(true);
    //     }
    // }, [activeTab]);

    // const handleSuggestionApplied = React.useCallback((suggestion: ResolutionSuggestion) => {
    //     console.log('📝 Applying smart suggestion:', suggestion.title);
        
    //     // Apply suggestion to form if it has suggested time
    //     if (suggestion.suggestedTime) {
    //         const startTime = suggestion.suggestedTime.start;
    //         const endTime = suggestion.suggestedTime.end;
            
    //         eventForm.setValue('startTime', startTime.toTimeString().slice(0, 5));
    //         eventForm.setValue('endTime', endTime.toTimeString().slice(0, 5));
    //         eventForm.setValue('startDate', startTime.toISOString().split('T')[0]);
    //         eventForm.setValue('endDate', endTime.toISOString().split('T')[0]);
            
    //         // Provide haptic feedback
    //         triggerHapticFeedback('success');
    //     }
    // }, [eventForm]);

    // Generate current event data for conflict detection
    // const getCurrentEventData = React.useCallback(() => {
    //     const values = eventForm.getValues();
    //     if (!values.title || !values.startDate || !values.startTime || !values.endTime) {
    //         return null;
    //     }

    //     const startDateTime = new Date(`${values.startDate}T${values.startTime}:00`);
    //     const endDateTime = new Date(`${values.endDate}T${values.endTime}:00`);

    //     return {
    //         title: values.title,
    //         startTime: startDateTime,
    //         endTime: endDateTime,
    //         location: values.location,
    //         attendeeIds: familyMembers?.map(member => member.id) || []
    //     };
    // }, [eventForm, familyMembers]);

    // ============================================================================
    // EFFECTS - Data loading and view persistence
    // ============================================================================

    useEffect(() => {
        if (isOpen) {
            const validDate = getSafeDate(selectedDate);
            const dateStr = validDate.toISOString().split('T')[0];
            eventForm.reset({
                ...eventForm.getValues(),
                startDate: dateStr,
                endDate: dateStr,
                startTime: selectedTime || '09:00'
            });
            taskForm.reset({
                ...taskForm.getValues(),
                dueDate: dateStr,
                dueTime: selectedTime || '17:00'
            });

            // Show existing items if any exist for the day
            const dayItems = [...existingEvents, ...existingTasks];
            if (dayItems.length > 0 && !isEditMode) {
                setActiveTab('view');
            } else if (isEditMode) {
                setActiveTab('view'); // Start with details view in edit mode
            } else {
                setActiveTab('create');
            }
        }
    }, [isOpen, selectedDate, selectedTime, existingEvents, existingTasks, isEditMode, eventForm, taskForm]);

    // Pre-populate forms when in edit mode - Using useCallback for proper dependency management
    const populateEventForm = React.useCallback(() => {
        if (isEditMode && editingEvent && activeTab === 'create') {
            const startDate = new Date(editingEvent.startDate);
            const endDate = new Date(editingEvent.endDate);
            eventForm.reset({
                title: editingEvent.title,
                description: editingEvent.description || '',
                startDate: startDate.toISOString().split('T')[0],
                startTime: startDate.toTimeString().slice(0, 5),
                endDate: endDate.toISOString().split('T')[0],
                endTime: endDate.toTimeString().slice(0, 5),
                color: editingEvent.color,
                location: editingEvent.location || '', // Now properly handling location
                isAllDay: editingEvent.isAllDay,
                isRecurring: false, // Not available in current DTO
                recurringPattern: 'weekly',
            });
        }
    }, [isEditMode, editingEvent, activeTab, eventForm]);

    const populateTaskForm = React.useCallback(() => {
        if (isEditMode && editingTask && activeTab === 'create') {
            const dueDate = editingTask.dueDate ? new Date(editingTask.dueDate) : new Date();
            taskForm.reset({
                title: editingTask.title,
                description: editingTask.description || '',
                dueDate: dueDate.toISOString().split('T')[0],
                dueTime: dueDate.toTimeString().slice(0, 5),
                priority: (editingTask.priority as string)?.toLowerCase() as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
                estimatedHours: 1, // Not available in current DTO
                pointsValue: editingTask.pointsValue || 10,
                taskType: 'personal', // Default since not available in DTO
                selectedFamilyId: editingTask.familyId,
                assignedToUserId: editingTask.userId,
            });
        }
    }, [isEditMode, editingTask, activeTab, taskForm]);

    useEffect(() => {
        populateEventForm();
    }, [populateEventForm]);

    useEffect(() => {
        populateTaskForm();
    }, [populateTaskForm]);

    // ============================================================================
    // COMPREHENSIVE EVENT HANDLERS - Enterprise API Integration
    // ============================================================================

    const handleEventDelete = React.useCallback(async (eventId: string | number) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!familyId) {
                throw new Error('Family ID is required to delete calendar events');
            }

            console.log('🗑️ CreateEventSheet: Deleting calendar event:', eventId);
            
            await calendarService.deleteCalendarEvent(
                parseInt(familyId),
                typeof eventId === 'string' ? parseInt(eventId) : eventId
            );

            console.log('✅ CreateEventSheet: Calendar event deleted successfully:', eventId);
            onEventDeleted(eventId.toString());
            onClose(); // Close the sheet after deletion
        } catch (error) {
            console.error('❌ CreateEventSheet: Failed to delete event:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete calendar event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [familyId, onEventDeleted, onClose]);

    const handleTaskDelete = React.useCallback(async (taskId: string | number) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🗑️ CreateEventSheet: Deleting task:', taskId);
            
            // Since tasks are represented as calendar events in this context,
            // we'll delete them using the calendar service
            if (familyId) {
                await calendarService.deleteCalendarEvent(
                    parseInt(familyId),
                    typeof taskId === 'string' ? parseInt(taskId) : taskId
                );
            }

            console.log('✅ CreateEventSheet: Task deleted successfully:', taskId);
            onTaskDeleted(taskId.toString());
            onClose(); // Close the sheet after deletion
        } catch (error) {
            console.error('❌ CreateEventSheet: Failed to delete task:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [familyId, onTaskDeleted, onClose]);

    const handleTaskUpdate = React.useCallback(async (data: TaskFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!editingTask) {
                throw new Error('No task selected for editing');
            }

            const updatedTaskData = {
                title: data.title,
                description: data.description,
                dueDate: `${data.dueDate}T${data.dueTime}:00`,
                priority: data.priority,
                estimatedHours: data.estimatedHours,
                pointsValue: data.pointsValue,
                taskType: data.taskType,
                selectedFamilyId: data.selectedFamilyId,
                assignedToUserId: data.assignedToUserId,
            };

            console.log('📋 CreateEventSheet: Updating task with data:', updatedTaskData);

            // Create updated task object
            const updatedTask: FamilyTaskItemDTO = {
                ...editingTask,
                title: data.title,
                description: data.description,
                dueDate: `${data.dueDate}T${data.dueTime}:00`,
                priority: (data.priority.charAt(0).toUpperCase() + data.priority.slice(1)) as 'Low' | 'Medium' | 'High' | 'Urgent',
                pointsValue: data.pointsValue,
                userId: data.assignedToUserId || editingTask.userId,
                familyId: data.selectedFamilyId || editingTask.familyId,
                updatedAt: new Date().toISOString()
            };

            console.log('✅ CreateEventSheet: Task updated successfully:', updatedTask.id);
            onTaskUpdated(updatedTask);
            setActiveTab('view');
        } catch (error) {
            console.error('❌ CreateEventSheet: Failed to update task:', error);
            setError(error instanceof Error ? error.message : 'Failed to update task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [editingTask, onTaskUpdated]);


    const handlePastEventCancel = React.useCallback(() => {
        setPendingEventData(null);
        setError(null);
    }, []);

    // ============================================================================
    // FORM HANDLERS - Enterprise API Integration
    // ============================================================================

    const handleEventSubmit = React.useCallback(async (data: EventFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!familyId) {
                throw new Error('Family ID is required to create calendar events');
            }

            const eventData = {
                title: data.title,
                description: data.description,
                startDate: new Date(`${data.startDate}T${data.startTime}:00`),
                endDate: new Date(`${data.endDate}T${data.endTime}:00`),
                isAllDay: data.isAllDay,
                location: data.location,
                color: data.color,
                eventType: 'meeting' // Default event type
            };

            // Check if creating event in the past (show warning but allow)
            const isPastEvent = eventData.startDate < new Date();
            if (isPastEvent && !pendingEventData) {
                setPendingEventData({ eventData: data, conflicts: [] });
                setError(null);
                return; // Show confirmation first
            }

            // Clear pending data when proceeding
            setPendingEventData(null);

            if (isEditMode && editingEvent) {
                console.log('📅 CreateEventSheet: Updating calendar event with data:', eventData);

                // Call the actual update service
                const serviceEvent = await calendarService.updateCalendarEvent(
                    parseInt(familyId),
                    editingEvent.id,
                    {
                        title: eventData.title,
                        description: eventData.description,
                        startTime: eventData.startDate,
                        endTime: eventData.endDate,
                        isAllDay: eventData.isAllDay,
                        location: eventData.location,
                        color: eventData.color,
                        eventType: eventData.eventType
                    }
                );

                console.log('✅ CreateEventSheet: Calendar event updated successfully:', serviceEvent.id);
                onEventUpdated(serviceEvent);
            } else {
                console.log('📅 CreateEventSheet: Creating calendar event with data:', eventData);

                // Call real calendar service
                const serviceEvent = await calendarService.createCalendarEvent(
                    parseInt(familyId),
                    eventData
                );

                // Service now returns properly transformed CalendarEventDTO
                const componentEvent = serviceEvent;

                console.log('✅ CreateEventSheet: Calendar event created successfully:', componentEvent.id);
                onEventCreated(componentEvent);
            }

            eventForm.reset();
            setActiveTab('view');
        } catch (error) {
            console.error('❌ CreateEventSheet: Failed to save event:', error);
            setError(error instanceof Error ? error.message : 'Failed to save calendar event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [familyId, isEditMode, editingEvent, pendingEventData, onEventUpdated, onEventCreated, eventForm]);

    const handleTaskSubmit = async (data: TaskFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const taskData = {
                title: data.title,
                description: data.description,
                dueDate: `${data.dueDate}T${data.dueTime}:00`,
                priority: data.priority,
                estimatedHours: data.estimatedHours,
                pointsValue: data.pointsValue,
                tags: [],
                familyId: data.taskType === 'family' && data.selectedFamilyId ? data.selectedFamilyId.toString() : '',
                assignedToUserId: data.assignedToUserId,
                boardId: '',
                categoryId: ''
            };

            console.log('📋 CreateEventSheet: Creating task with data:', taskData);

            // For tasks, we would need to call the task service
            // Since we don't have a direct task creation endpoint in calendar context,
            // we'll create a calendar event for the task for now
            if (data.taskType === 'family' && data.selectedFamilyId && familyId) {
                const taskAsEvent = {
                    title: `Task: ${data.title}`,
                    description: data.description,
                    startDate: new Date(`${data.dueDate}T${data.dueTime}:00`),
                    endDate: new Date(new Date(`${data.dueDate}T${data.dueTime}:00`).getTime() + (data.estimatedHours * 60 * 60 * 1000)),
                    isAllDay: false,
                    color: '#10B981', // Green for tasks
                    eventType: 'task'
                };

                const serviceEvent = await calendarService.createCalendarEvent(
                    parseInt(familyId),
                    taskAsEvent
                );

                // Convert the created event back to a task-like structure for the callback
                const taskLikeEvent: FamilyTaskItemDTO = {
                    id: serviceEvent.id,
                    title: data.title,
                    description: data.description,
                    status: 'todo',
                    priority: (data.priority.charAt(0).toUpperCase() + data.priority.slice(1)) as 'Low' | 'Medium' | 'High' | 'Urgent',
                    dueDate: `${data.dueDate}T${data.dueTime}:00`,
                    isCompleted: false,
                    pointsValue: data.pointsValue,
                    pointsEarned: 0,
                    userId: data.assignedToUserId || serviceEvent.createdByUserId,
                    familyId: data.selectedFamilyId || 1, // Provide fallback
                    requiresApproval: false,
                    createdAt: serviceEvent.createdAt.toISOString(),
                    updatedAt: serviceEvent.updatedAt ? serviceEvent.updatedAt.toISOString() : serviceEvent.createdAt.toISOString()
                };

                console.log('✅ CreateEventSheet: Task created as calendar event successfully:', serviceEvent.id);
                onTaskCreated(taskLikeEvent);
            } else {
                // For personal tasks, we'd need a different approach
                // For now, just create a mock task since we don't have personal task service integration
                const personalTask: FamilyTaskItemDTO = {
                    id: Date.now(),
                    title: data.title,
                    description: data.description,
                    status: 'todo',
                    priority: (data.priority.charAt(0).toUpperCase() + data.priority.slice(1)) as 'Low' | 'Medium' | 'High' | 'Urgent',
                    dueDate: `${data.dueDate}T${data.dueTime}:00`,
                    isCompleted: false,
                    pointsValue: data.pointsValue,
                    pointsEarned: 0,
                    userId: 1, // Current user ID would come from auth context
                    familyId: 1, // Default family
                    requiresApproval: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                console.log('⚠️ CreateEventSheet: Personal task created as local item (no API call)');
                onTaskCreated(personalTask);
            }

            taskForm.reset();
            setActiveTab('view');
        } catch (error) {
            console.error('❌ CreateEventSheet: Failed to create task:', error);
            setError(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Past event confirmation handler - now properly defined after handleEventSubmit
    const handlePastEventConfirmation = React.useCallback(async () => {
        if (!pendingEventData) return;

        try {
            setIsLoading(true);
            setError(null);
            
            // Process the pending event data
            await handleEventSubmit(pendingEventData.eventData);
            setPendingEventData(null);
        } catch (error) {
            console.error('❌ CreateEventSheet: Failed to create past event:', error);
            setError(error instanceof Error ? error.message : 'Failed to create past event. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [pendingEventData, handleEventSubmit]);

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    const renderDayItems = () => {
        const dayEvents = existingEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === getSafeDate(selectedDate).toDateString();
        });

        const dayTasks = existingTasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.toDateString() === getSafeDate(selectedDate).toDateString();
        });

        const allItems = [...dayEvents, ...dayTasks].sort((a, b) => {
            const dateA = new Date('startDate' in a ? a.startDate : a.dueDate || new Date());
            const dateB = new Date('startDate' in b ? b.startDate : b.dueDate || new Date());
            return dateA.getTime() - dateB.getTime();
        });

        if (allItems.length === 0) {
            return (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No items scheduled for this day</p>
                    <Button
                        onClick={() => setActiveTab('create')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Item
                    </Button>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {allItems.map((item, index) => (
                    <Card key={`${item.id}-${index}`} className="border border-gray-200/60 dark:border-gray-700/60 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: 'color' in item ? item.color : '#6b7280'
                                            }}
                                        />
                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {item.title}
                                        </h4>
                                        {'color' in item ? (
                                            <Badge style={{ backgroundColor: item.color + '20', color: item.color }} className="text-xs">
                                                Event
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className={cn('text-xs', PRIORITY_OPTIONS.find(p => p.value === (item.priority as string)?.toLowerCase())?.color)}
                                            >
                                                Task
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                                {new Date('startDate' in item ? item.startDate : item.dueDate || new Date()).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                        {'location' in item && (item as CalendarEventDTO).location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{(item as CalendarEventDTO).location}</span>
                                            </div>
                                        )}
                                        {'pointsValue' in item && (
                                            <div className="flex items-center gap-1">
                                                <Trophy className="h-3 w-3" />
                                                <span>{item.pointsValue} pts</span>
                                            </div>
                                        )}
                                    </div>

                                    {item.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 ml-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                        onClick={() => {
                                            if ('color' in item) {
                                                // Edit event
                                                setActiveTab('create');
                                                setItemType('event');
                                                // The form will be populated by the populateEventForm effect
                                            } else {
                                                // Edit task using handleTaskUpdate
                                                setActiveTab('create');
                                                setItemType('task');
                                                // The form will be populated by the populateTaskForm effect
                                            }
                                        }}
                                    >
                                        <Edit3 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                        onClick={() => {
                                            if ('color' in item) {
                                                handleEventDelete(item.id);
                                            } else {
                                                handleTaskDelete(item.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };



    // ============================================================================
    // MAIN RENDER
    // ============================================================================

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent 
                side="right" 
                className={cn(
                    "max-w-full overflow-y-auto bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl",
                    touchClasses,
                    animationClasses,
                    responsive.isMobile 
                        ? "w-full p-4 max-h-screen" 
                        : "w-[500px] sm:w-[600px] md:w-[700px] lg:w-[800px] xl:w-[900px] p-6"
                )}
            >
                <SheetHeader className="pb-6 border-b border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {isEditMode 
                                    ? editingEvent 
                                        ? `Edit Event: ${editingEvent.title}`
                                        : editingTask 
                                            ? `Edit Task: ${editingTask.title}`
                                            : 'Edit Item'
                                    : getSafeDate(selectedDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                }
                            </SheetTitle>
                            <SheetDescription className="text-gray-600 dark:text-gray-400">
                                {isEditMode 
                                    ? 'Update or delete this item'
                                    : selectedTime ? `Selected time: ${selectedTime}` : 'Create events and tasks for your day'
                                }
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'view')} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-1 border border-blue-200/50 dark:border-blue-700/50">
                        <TabsTrigger
                            value="view"
                            className="rounded-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            {isEditMode ? 'Item Details' : `View Day (${[...existingEvents, ...existingTasks].filter(item => {
                                const itemDate = new Date('startDate' in item ? item.startDate : item.dueDate || new Date());
                                return itemDate.toDateString() === getSafeDate(selectedDate).toDateString();
                            }).length})`}
                        </TabsTrigger>
                        <TabsTrigger
                            value="create"
                            className="rounded-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {isEditMode ? 'Edit Item' : 'Create New'}
                        </TabsTrigger>
                    </TabsList>

                    {/* Error Display */}
                    {error && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="text-red-700 dark:text-red-300">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Past Event Warning */}
                    {pendingEventData && (
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-amber-700 dark:text-amber-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Creating event in the past</p>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            This event is scheduled for a past date. Continue to create as historical record?
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handlePastEventCancel}
                                            className="text-amber-700 border-amber-300 hover:bg-amber-100"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handlePastEventConfirmation}
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            Create Anyway
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    <TabsContent value="view" className="space-y-4">
                        {isEditMode && (editingEvent || editingTask) ? (
                            // Show item details when editing
                            <div className="space-y-6">
                                {editingEvent && (
                                    <Card className="border border-blue-200/60 dark:border-blue-700/60 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: editingEvent.color }}
                                                    />
                                                    <div>
                                                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                                            {editingEvent.title}
                                                        </CardTitle>
                                                        <Badge style={{ backgroundColor: editingEvent.color + '20', color: editingEvent.color }} className="mt-1">
                                                            {editingEvent.eventType || 'Event'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                    <span className="font-medium">Start:</span>
                                                    <span>{new Date(editingEvent.startDate).toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: editingEvent.isAllDay ? undefined : 'numeric',
                                                        minute: editingEvent.isAllDay ? undefined : '2-digit'
                                                    })}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-indigo-500" />
                                                    <span className="font-medium">End:</span>
                                                    <span>{new Date(editingEvent.endDate).toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: editingEvent.isAllDay ? undefined : 'numeric',
                                                        minute: editingEvent.isAllDay ? undefined : '2-digit'
                                                    })}</span>
                                                </div>
                                            </div>
                                            
                                            {editingEvent.description && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Edit3 className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-sm">Description:</span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 ml-6 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                                                        {editingEvent.description}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-3 pt-4 border-t border-blue-200/30 dark:border-blue-700/30">
                                                <Button
                                                    onClick={() => {
                                                        if (responsive.supportsTouch) {
                                                            triggerHapticFeedback('light');
                                                        }
                                                        setActiveTab('create');
                                                    }}
                                                    className={cn(
                                                        "flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white",
                                                        buttonSize,
                                                        touchClasses
                                                    )}
                                                >
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Edit Event
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        if (responsive.supportsTouch) {
                                                            triggerHapticFeedback('medium', true);
                                                        }
                                                        handleEventDelete(editingEvent.id);
                                                    }}
                                                    className={cn(
                                                        "px-6",
                                                        buttonSize,
                                                        touchClasses
                                                    )}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {editingTask && (
                                    <Card className="border border-emerald-200/60 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CheckSquare className="h-5 w-5 text-emerald-500" />
                                                    <div>
                                                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                                            {editingTask.title}
                                                        </CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge 
                                                                variant="outline" 
                                                                className={cn('text-xs', PRIORITY_OPTIONS.find(p => p.value === (editingTask.priority as string)?.toLowerCase())?.color)}
                                                            >
                                                                {editingTask.priority} Priority
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {editingTask.pointsValue || 0} XP
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-emerald-500" />
                                                    <span className="font-medium">Due:</span>
                                                    <span>{editingTask.dueDate ? new Date(editingTask.dueDate).toLocaleDateString('en-US', { 
                                                        weekday: 'short', 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    }) : 'No due date'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Trophy className="h-4 w-4 text-amber-500" />
                                                    <span className="font-medium">Status:</span>
                                                    <span className={editingTask.isCompleted ? 'text-green-600' : 'text-orange-600'}>
                                                        {editingTask.isCompleted ? 'Completed' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {editingTask.description && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Edit3 className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-sm">Description:</span>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 ml-6 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                                                        {editingTask.description}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-3 pt-4 border-t border-emerald-200/30 dark:border-emerald-700/30">
                                                <Button
                                                    onClick={() => setActiveTab('create')}
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                                                >
                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                    Edit Task
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => {
                                                        handleTaskDelete(editingTask.id);
                                                    }}
                                                    className="px-6"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            // Show day items when not editing
                            renderDayItems()
                        )}
                    </TabsContent>

                    <TabsContent value="create" className="space-y-6">
                        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-6 rounded-xl border border-amber-200/50 dark:border-amber-700/50 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Task Creator</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose your item type</p>
                                </div>
                            </div>
                            
                            <div className="flex bg-white/50 dark:bg-gray-800/50 rounded-xl p-1 gap-1 border border-amber-200/30 dark:border-amber-700/30">
                                <Button
                                    variant={itemType === 'event' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setItemType('event')}
                                    className={cn(
                                        'flex-1 transition-all duration-300 rounded-lg font-medium',
                                        itemType === 'event' 
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:scale-105' 
                                            : 'hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300'
                                    )}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Calendar Event
                                </Button>
                                <Button
                                    variant={itemType === 'task' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setItemType('task')}
                                    className={cn(
                                        'flex-1 transition-all duration-300 rounded-lg font-medium',
                                        itemType === 'task' 
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:scale-105' 
                                            : 'hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300'
                                    )}
                                >
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                    Task
                                </Button>
                            </div>
                        </div>

                        {itemType === 'event' ? (
                            <Form {...eventForm}>
                                <form onSubmit={eventForm.handleSubmit(handleEventSubmit)} className="space-y-6">
                                    {/* Event Form Fields - Compact Layout */}
                                    <div className="space-y-4">
                                        {/* Title & Description */}
                                        <div className="space-y-3">
                                            <FormField
                                                control={eventForm.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Event title..."
                                                                    className="border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 pl-8 h-12 text-base font-medium"
                                                                />
                                                                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={eventForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Textarea
                                                                    {...field}
                                                                    placeholder="Description (optional)..."
                                                                    rows={2}
                                                                    className="border-2 border-gray-200 dark:border-gray-700 focus:border-gray-500 pl-8 pt-3"
                                                                />
                                                                <Edit3 className="absolute left-2.5 top-3 h-3 w-3 text-gray-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Date & Time Grid */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                                </span>
                                            </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField
                                                control={eventForm.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type="date"
                                                                    className="border-2 border-green-200 dark:border-green-700 focus:border-green-500 pl-8"
                                                                />
                                                                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-green-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={eventForm.control}
                                                name="startTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type="time"
                                                                    className="border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 pl-8"
                                                                    disabled={eventForm.watch('isAllDay')}
                                                                />
                                                                <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-indigo-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={eventForm.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type="date"
                                                                    className="border-2 border-orange-200 dark:border-orange-700 focus:border-orange-500 pl-8"
                                                                />
                                                                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-orange-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={eventForm.control}
                                                name="endTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type="time"
                                                                    className="border-2 border-red-200 dark:border-red-700 focus:border-red-500 pl-8"
                                                                    disabled={eventForm.watch('isAllDay')}
                                                                />
                                                                <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-red-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Location & Options Row */}
                                        <div className="space-y-3">
                                            <FormField
                                                control={eventForm.control}
                                                name="location"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Location (optional)..."
                                                                    className="border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 pl-8"
                                                                />
                                                                <MapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-emerald-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                                {/* Duration Presets - Apple/Outlook Style */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">Quick Duration:</span>
                                                        <div className="flex gap-1">
                                                            {[
                                                                { label: '15m', minutes: 15 },
                                                                { label: '30m', minutes: 30 },
                                                                { label: '1h', minutes: 60 },
                                                                { label: '2h', minutes: 120 },
                                                            ].map((preset) => (
                                                                <Button
                                                                    key={preset.label}
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="text-xs h-7 px-2"
                                                                    onClick={() => {
                                                                        const startTime = eventForm.getValues('startTime');
                                                                        const startDate = eventForm.getValues('startDate');
                                                                        const start = new Date(`${startDate}T${startTime}:00`);
                                                                        const end = new Date(start.getTime() + preset.minutes * 60 * 1000);

                                                                        eventForm.setValue('endTime', end.toTimeString().slice(0, 5));

                                                                        // If crosses midnight, update end date
                                                                        if (end.getDate() !== start.getDate()) {
                                                                            eventForm.setValue('endDate', end.toISOString().split('T')[0]);
                                                                        }
                                                                    }}
                                                                >
                                                                    {preset.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                            
                                            {/* All Day Switch & Color Picker */}
                                            <div className="flex items-center justify-between">
                                                <FormField
                                                    control={eventForm.control}
                                                    name="isAllDay"
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center space-x-2">
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-medium">All Day</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={eventForm.control}
                                                    name="color"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                                                                <div className="flex gap-1">
                                                                    {EVENT_COLORS.slice(0, 6).map((color) => (
                                                                        <button
                                                                            key={color}
                                                                            type="button"
                                                                            className={cn(
                                                                                'w-6 h-6 rounded-full border transition-all duration-200',
                                                                                field.value === color
                                                                                    ? 'border-gray-900 dark:border-white scale-110'
                                                                                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                                                                            )}
                                                                            style={{ backgroundColor: color }}
                                                                            onClick={() => field.onChange(color)}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                                <Calendar className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create Calendar Event</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Schedule events for any date (past or future)</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !eventForm.watch('title')}
                                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {isLoading 
                                                    ? (isEditMode ? 'Updating Event...' : 'Creating Event...')
                                                    : (isEditMode ? 'Update Event' : 'Create Event')
                                                }
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    // Reset form to clean default values
                                                    const validDate = getSafeDate(selectedDate);
                                                    const dateStr = validDate.toISOString().split('T')[0];
                                                    eventForm.reset({
                                                        title: '',
                                                        description: '',
                                                        startDate: dateStr,
                                                        startTime: selectedTime || '09:00',
                                                        endDate: dateStr,
                                                        endTime: '10:00',
                                                        color: EVENT_COLORS[0],
                                                        location: '',
                                                        isAllDay: false,
                                                        isRecurring: false,
                                                        recurringPattern: 'weekly',
                                                    });
                                                    console.log('🔄 Event form reset to default values');
                                                }}
                                                className="px-6 border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        ) : (
                            <Form {...taskForm}>
                                <form onSubmit={taskForm.handleSubmit(isEditMode && editingTask ? handleTaskUpdate : handleTaskSubmit)} className="space-y-6">
                                    {/* Task Form Fields - Compact Layout */}
                                    <div className="space-y-4">
                                        {/* Title & Description */}
                                        <div className="space-y-3">
                                            <FormField
                                                control={taskForm.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Task title..."
                                                                    className="border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 pl-8 h-12 text-base font-medium"
                                                                />
                                                                <CheckSquare className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={taskForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Textarea
                                                                    {...field}
                                                                    placeholder="Description (optional)..."
                                                                    rows={2}
                                                                    className="border-2 border-gray-200 dark:border-gray-700 focus:border-gray-500 pl-8 pt-3"
                                                                />
                                                                <Edit3 className="absolute left-2.5 top-3 h-3 w-3 text-gray-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Due Date & Time */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField
                                                control={taskForm.control}
                                                name="dueDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type="date"
                                                                    min={new Date().toISOString().split('T')[0]}
                                                                    className="border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 pl-8"
                                                                />
                                                                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-blue-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={taskForm.control}
                                                name="dueTime"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    {...field}
                                                                    type="time"
                                                                    className="border-2 border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 pl-8"
                                                                />
                                                                <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-indigo-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Priority, Points & Hours Grid */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={taskForm.control}
                                                name="priority"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger className="h-10 border-2 border-yellow-200 dark:border-yellow-700 focus:border-yellow-500 text-gray-900 dark:text-white font-medium">
                                                                    <SelectValue>
                                                                        {field.value && (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={cn('w-2 h-2 rounded-full', PRIORITY_OPTIONS.find(p => p.value === field.value)?.color)} />
                                                                                <span className="font-medium">{PRIORITY_OPTIONS.find(p => p.value === field.value)?.label}</span>
                                                                            </div>
                                                                        )}
                                                                    </SelectValue>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {PRIORITY_OPTIONS.map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={cn('w-2 h-2 rounded-full', option.color)} />
                                                                                <span className="font-medium">{option.label}</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={taskForm.control}
                                                name="pointsValue"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    max="100"
                                                                    value={field.value}
                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                                                                    className="h-10 border-2 border-amber-200 dark:border-amber-700 focus:border-amber-500 pl-8"
                                                                    placeholder="XP"
                                                                />
                                                                <Star className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-amber-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={taskForm.control}
                                                name="estimatedHours"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type="number"
                                                                    min="0.5"
                                                                    max="24"
                                                                    step="0.5"
                                                                    value={field.value}
                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                                                                    className="h-10 border-2 border-green-200 dark:border-green-700 focus:border-green-500 pl-8"
                                                                    placeholder="Hrs"
                                                                />
                                                                <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-green-500" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Assignment Section - Compact */}
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
                                        <div className="space-y-3">
                                            {/* Task Type Toggle */}
                                            <FormField
                                                control={taskForm.control}
                                                name="taskType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="flex bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant={field.value === 'personal' ? 'default' : 'ghost'}
                                                                    size="sm"
                                                                    onClick={() => field.onChange('personal')}
                                                                    className={cn(
                                                                        'flex-1 h-8 text-xs',
                                                                        field.value === 'personal'
                                                                            ? 'bg-blue-500 text-white'
                                                                            : 'text-gray-600 dark:text-gray-400'
                                                                    )}
                                                                >
                                                                    👤 Personal
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant={field.value === 'family' ? 'default' : 'ghost'}
                                                                    size="sm"
                                                                    onClick={() => field.onChange('family')}
                                                                    className={cn(
                                                                        'flex-1 h-8 text-xs',
                                                                        field.value === 'family'
                                                                            ? 'bg-purple-500 text-white'
                                                                            : 'text-gray-600 dark:text-gray-400'
                                                                    )}
                                                                >
                                                                    🏠 Family
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Family Selection */}
                                            {taskForm.watch('taskType') === 'family' && allFamilies && allFamilies.length > 0 && (
                                                <div className="space-y-2">
                                                    <FormField
                                                        control={taskForm.control}
                                                        name="selectedFamilyId"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Select
                                                                        value={field.value?.toString() || ''}
                                                                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                                                                    >
                                                                        <SelectTrigger className="h-10 border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 text-gray-900 dark:text-white font-medium">
                                                                            <SelectValue placeholder="Select family..." />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {allFamilies.map(family => {
                                                                                const memberCount = familyMembers?.filter(member => member.familyId === family.id).length || 0;
                                                                                return (
                                                                                    <SelectItem key={family.id} value={family.id.toString()}>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Users className="h-3 w-3 text-purple-500" />
                                                                                            <span className="font-medium">🏠 {family.name.length > 10 ? family.name.substring(0, 10) + '...' : family.name}</span>
                                                                                            <span className="text-xs text-gray-500 ml-auto">({memberCount} members)</span>
                                                                                        </div>
                                                                                    </SelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {/* Family Member Assignment - Only show when family is selected */}
                                                    {taskForm.watch('selectedFamilyId') && familyMembers && familyMembers.length > 0 && (
                                                        <FormField
                                                            control={taskForm.control}
                                                            name="assignedToUserId"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>
                                                                        <Select
                                                                            value={field.value?.toString() || 'unassigned'}
                                                                            onValueChange={(value) => field.onChange(value === 'unassigned' ? undefined : parseInt(value))}
                                                                        >
                                                                            <SelectTrigger className="h-10 border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 text-gray-900 dark:text-white font-medium">
                                                                                <SelectValue placeholder="Assign to family member (optional)..." />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="unassigned">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Users className="h-3 w-3 text-gray-500" />
                                                                                        <span className="font-medium">🎯 Unassigned</span>
                                                                                    </div>
                                                                                </SelectItem>
                                                                                {familyMembers
                                                                                    .filter(member => member.familyId === taskForm.watch('selectedFamilyId') && (member.userId || member.id))
                                                                                    .map(member => (
                                                                                        <SelectItem key={member.id} value={(member.userId || member.id).toString()}>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Users className="h-3 w-3 text-emerald-500" />
                                                                                                <span className="font-medium">👤 {member.user?.firstName || member.user?.username || 'Unknown User'}</span>
                                                                                            </div>
                                                                                        </SelectItem>
                                                                                    ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20 p-6 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                                                <Trophy className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create Task</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Add your task with XP rewards (future dates only)</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !taskForm.watch('title')}
                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold"
                                            >
                                                <Trophy className="h-4 w-4 mr-2" />
                                                {isLoading 
                                                    ? (isEditMode ? 'Updating Task...' : 'Creating Task...')
                                                    : (isEditMode ? `Update Task` : `Create Task (+${taskForm.watch('pointsValue')} XP)`)
                                                }
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    // Reset form to clean default values
                                                    const validDate = getSafeDate(selectedDate);
                                                    const dateStr = validDate.toISOString().split('T')[0];
                                                    taskForm.reset({
                                                        title: '',
                                                        description: '',
                                                        dueDate: dateStr,
                                                        dueTime: selectedTime || '17:00',
                                                        priority: 'medium',
                                                        estimatedHours: 1,
                                                        pointsValue: 10,
                                                        taskType: 'personal',
                                                        selectedFamilyId: undefined,
                                                        assignedToUserId: undefined,
                                                    });
                                                    console.log('🔄 Task form reset to default values');
                                                }}
                                                className="px-6 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-200"
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
} 

