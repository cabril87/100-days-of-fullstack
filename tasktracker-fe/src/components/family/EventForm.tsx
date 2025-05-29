import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/providers/ToastProvider';
import { 
  CalendarClock, 
  MapPin, 
  Calendar, 
  Clock, 
  Palette,
  RotateCcw,
  Type,
  AlertCircle,
  Users,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const eventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
  isAllDay: z.boolean(),
  location: z.string().optional(),
  color: z.string().optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.string().optional(),
  eventType: z.string(),
  attendeeIds: z.array(z.number()).optional(),
  recurrenceExceptions: z.array(z.date()).optional(),
}).refine((data) => {
  if (data.isAllDay) return true;
  return data.end > data.start;
}, {
  message: "End time must be after start time",
  path: ["end"]
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  familyId: number;
  selectedDate?: Date | null;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  initialData?: EventFormData;
}

const eventTypes = [
  { value: 'General', label: 'General', color: '#3b82f6' },
  { value: 'Meeting', label: 'Meeting', color: '#8b5cf6' },
  { value: 'Appointment', label: 'Appointment', color: '#ec4899' },
  { value: 'Outing', label: 'Outing', color: '#10b981' },
  { value: 'Reminder', label: 'Reminder', color: '#f59e0b' },
];

const recurrencePatterns = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
  { value: 'weekends', label: 'Weekends (Sat-Sun)' },
];

// Custom Toggle Component (replaces problematic Switch)
const CustomToggle = ({ 
  id, 
  checked, 
  onChange, 
  label, 
  className = '',
  disabled = false 
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          checked ? "bg-blue-600" : "bg-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      <Label htmlFor={id} className="text-sm cursor-pointer font-medium">
        {label}
      </Label>
    </div>
  );
};

export function EventForm({
  familyId,
  selectedDate,
  onSubmit,
  onCancel,
  initialData,
}: EventFormProps) {
  // Core state management
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialData?.color || '#3b82f6');
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>(initialData?.attendeeIds || []);
  const [recurrenceExceptions, setRecurrenceExceptions] = useState<Date[]>(initialData?.recurrenceExceptions || []);
  const [showExceptionPicker, setShowExceptionPicker] = useState(false);
  
  // Form-specific state to avoid watch() issues
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay || false);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [currentEventType, setCurrentEventType] = useState(initialData?.eventType || 'General');
  
  // Refs for component lifecycle management
  const isMounted = useRef(true);
  const hasFetchedMembers = useRef(false);
  const { showToast } = useToast();
  
  // FIXED: Stable defaultValues that don't change on every render
  const defaultValues = useMemo((): EventFormData => {
    const baseDate = selectedDate || new Date();
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate.getTime() + 60 * 60 * 1000);
    
    return {
      title: '',
      description: '',
      start: startDate,
      end: endDate,
      isAllDay: false,
      isRecurring: false,
      location: '',
      color: '#3b82f6',
      eventType: 'General',
      attendeeIds: [],
      recurrenceExceptions: [],
      recurrencePattern: undefined
    };
  }, []); // Only depend on component mount, not props
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
    mode: 'onChange'
  });

  // FIXED: Initialize form with initial data only once after form is created
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedColor(initialData.color || '#3b82f6');
      setSelectedAttendees(initialData.attendeeIds || []);
      setRecurrenceExceptions(initialData.recurrenceExceptions || []);
      setIsAllDay(initialData.isAllDay || false);
      setIsRecurring(initialData.isRecurring || false);
      setCurrentEventType(initialData.eventType || 'General');
    }
  }, [initialData, reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // FIXED: Single member fetching function
  const fetchMembers = useCallback(async () => {
    if (isLoadingMembers || hasFetchedMembers.current || !familyId) {
        return;
      }
      
    setIsLoadingMembers(true);
    hasFetchedMembers.current = true;

    try {
      const response = await familyService.getFamily(String(familyId));
      
      if (response?.data?.members && Array.isArray(response.data.members) && isMounted.current) {
        const processedMembers = response.data.members.map(member => ({
                  ...member,
                  id: typeof member.id === 'string' ? parseInt(member.id, 10) : member.id,
          userId: typeof member.userId === 'string' ? parseInt(member.userId, 10) : member.userId,
        }));
        
        setMembers(processedMembers);
      }
    } catch (error) {
      console.error('Error fetching family members:', error);
      if (isMounted.current) {
        showToast('Failed to load family members', 'error');
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingMembers(false);
      }
    }
  }, [familyId, showToast]);

  // Single useEffect for member fetching
  useEffect(() => {
    if (familyId && !hasFetchedMembers.current) {
    fetchMembers();
    }
  }, [familyId, fetchMembers]);

  // FIXED: Stable handlers that work with local state
  const handleIsAllDayChange = useCallback((checked: boolean) => {
    setIsAllDay(checked);
    setValue('isAllDay', checked);
    
    if (checked) {
      const currentValues = getValues();
      const currentStart = currentValues.start;
      if (currentStart) {
        const startDate = new Date(currentStart);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
        setValue('start', startDate);
        setValue('end', endDate);
    }
    }
  }, [setValue, getValues]);

  const handleIsRecurringChange = useCallback((checked: boolean) => {
    setIsRecurring(checked);
    setValue('isRecurring', checked);
    
    if (!checked) {
      setRecurrenceExceptions([]);
      setValue('recurrenceExceptions', []);
      setValue('recurrencePattern', undefined);
    }
  }, [setValue]);

  // Event handlers - stabilized with useCallback
  const handleFormSubmit = useCallback((data: EventFormData) => {
    const finalData = {
      ...data,
      isAllDay,
      isRecurring,
      eventType: currentEventType,
      color: selectedColor,
      attendeeIds: selectedAttendees,
      recurrenceExceptions,
    };
    
    onSubmit(finalData);
  }, [isAllDay, isRecurring, currentEventType, selectedColor, selectedAttendees, recurrenceExceptions, onSubmit]);

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    setValue('color', color);
  }, [setValue]);

  const handleEventTypeSelect = useCallback((type: string) => {
    setCurrentEventType(type);
    setValue('eventType', type);
    const eventType = eventTypes.find(et => et.value === type);
    if (eventType) {
      setSelectedColor(eventType.color);
      setValue('color', eventType.color);
    }
  }, [setValue]);

  const toggleAttendee = useCallback((memberId: number | string) => {
    const numericId = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId;
    
    setSelectedAttendees((current) => {
      const exists = current.includes(numericId);
      const newAttendees = exists 
        ? current.filter((id) => id !== numericId)
        : [...current, numericId];
      
      setValue('attendeeIds', newAttendees);
      return newAttendees;
    });
  }, [setValue]);

  const addExceptionDate = useCallback((date: Date) => {
    setRecurrenceExceptions((currentExceptions) => {
      const exists = currentExceptions.some(d => 
        d.getFullYear() === date.getFullYear() && 
        d.getMonth() === date.getMonth() && 
        d.getDate() === date.getDate()
      );
      
      if (exists) {
      showToast('This date has already been added as an exception. Please choose another date.', 'warning');
        return currentExceptions;
      }
      
    showToast('Exception date added successfully', 'success');
      const newExceptions = [...currentExceptions, date];
      setValue('recurrenceExceptions', newExceptions);
      return newExceptions;
    });
  }, [setValue, showToast]);
  
  const removeExceptionDate = useCallback((index: number) => {
    setRecurrenceExceptions(prev => {
      if (typeof index !== 'number' || index < 0 || index >= prev.length) {
        return prev;
      }
      
      const newExceptions = [...prev];
      newExceptions.splice(index, 1);
      setValue('recurrenceExceptions', newExceptions);
      return newExceptions;
    });
  }, [setValue]);

  const handleExceptionDateChange = useCallback((date: Date) => {
    if (date) {
      addExceptionDate(date);
    }
  }, [addExceptionDate]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Title */}
      <div className="space-y-2">
        <Label 
          htmlFor="title" 
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <Type className="h-4 w-4 text-gray-500" />
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Event title"
          className={cn(
            "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
            errors.title && "border-red-300 focus:border-red-500 focus:ring-red-500"
          )}
        />
        {errors.title && (
          <p className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.title.message}
          </p>
        )}
      </div>

          {/* Location */}
      <div className="space-y-2">
        <Label 
              htmlFor="location" 
          className="text-sm font-medium flex items-center gap-1.5"
        >
              <MapPin className="h-4 w-4 text-gray-500" />
              Location
        </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Event location"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

          {/* Time Section */}
          <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            Time
          </Label>
              <CustomToggle
              id="isAllDay"
              checked={isAllDay}
                onChange={handleIsAllDayChange}
                label="All Day Event"
            />
        </div>
        
            <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-500 ml-1">Start</Label>
            <div className={cn(
              "rounded-md overflow-visible w-full",
              isAllDay ? "bg-gray-50 border border-gray-300 p-2" : ""
            )}>
              {isAllDay ? (
                <div className="text-sm text-gray-500">All day event</div>
              ) : (
                <div className="w-full">
                  <DateTimePicker
                        value={getValues('start')}
                        onChange={(date) => setValue('start', date)}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-500 ml-1">End</Label>
            <div className={cn(
              "rounded-md overflow-visible w-full",
              isAllDay ? "bg-gray-50 border border-gray-300 p-2" : ""
            )}>
              {isAllDay ? (
                <div className="text-sm text-gray-500">All day event</div>
              ) : (
                <div className="w-full">
                  <DateTimePicker
                        value={getValues('end')}
                        onChange={(date) => setValue('end', date)}
                  />
                      {errors.end && (
                        <p className="text-sm text-red-500 flex items-center mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.end.message}
                        </p>
                      )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

          {/* Event Type and Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label 
            htmlFor="eventType" 
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4 text-gray-500" />
            Event Type
          </Label>
          <Select 
                value={currentEventType} 
            onValueChange={handleEventTypeSelect}
          >
            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: type.color }}
                    ></div>
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label 
            htmlFor="color" 
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <Palette className="h-4 w-4 text-gray-500" />
            Color
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
              <div
                key={color}
                className={cn(
                  "w-8 h-8 rounded-full cursor-pointer border-2 transition-all",
                  selectedColor === color ? "border-gray-900 scale-110" : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              ></div>
            ))}
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="h-8 w-8 p-1 cursor-pointer"
              aria-label="Custom color picker"
            />
              </div>
          </div>
        </div>
      </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label 
              htmlFor="description" 
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Type className="h-4 w-4 text-gray-500" />
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Event description"
              className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Recurrence Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center gap-1.5 text-green-700">
                <RotateCcw className="h-5 w-5 text-green-500" />
            Recurring Event
          </Label>
              <CustomToggle
              id="isRecurring"
              checked={isRecurring}
                onChange={handleIsRecurringChange}
                label="Repeat"
            />
        </div>
        
        {isRecurring && (
              <div className="space-y-4 p-3 bg-green-50 rounded-md border border-green-200">
            <div className="space-y-2">
              <Label htmlFor="recurrencePattern" className="text-sm font-medium">
                Recurrence Pattern
              </Label>
              <Select 
                    value={getValues('recurrencePattern') || 'weekly'} 
                    onValueChange={(value) => {
                      if (value) {
                        setValue('recurrencePattern', value);
                      }
                    }}
              >
                    <SelectTrigger className="w-full border-green-300 focus:border-green-500 focus:ring-green-500 bg-white">
                  <SelectValue placeholder="Select recurrence pattern" />
                </SelectTrigger>
                <SelectContent>
                  {recurrencePatterns.map((pattern) => (
                    <SelectItem key={pattern.value} value={pattern.value}>
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Exception Dates Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Exception Dates</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowExceptionPicker(!showExceptionPicker)}
                  className="text-xs"
                >
                  {showExceptionPicker ? 'Hide' : 'Add Exception'}
                </Button>
              </div>
              
              {showExceptionPicker && (
                    <div className="p-3 border border-green-200 rounded-md bg-white">
                  <Label className="text-xs text-gray-500 mb-2 block">
                    Select dates when this event should not occur
                  </Label>
                  <div className="flex flex-col space-y-2">
                    <DateTimePicker
                      value={new Date()}
                          onChange={handleExceptionDateChange}
                    />
                  </div>
                </div>
              )}
              
              {recurrenceExceptions.length > 0 && (
                <div className="mt-2">
                  <Label className="text-xs text-gray-500 mb-1 block">
                    Exceptions ({recurrenceExceptions.length})
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {recurrenceExceptions.map((date, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1 pl-2 bg-green-100 text-green-800 border-green-200">
                        {format(date, 'MMM d, yyyy')}
                        <Button 
                              type="button"
                          variant="ghost" 
                          size="icon" 
                              className="h-5 w-5 p-0 ml-1 hover:bg-green-200 rounded-full"
                          onClick={() => removeExceptionDate(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

          {/* Attendees Section */}
          <div className="space-y-2">
        <Label 
          htmlFor="attendees" 
              className="text-base font-medium flex items-center gap-1.5 text-blue-700"
        >
              <Users className="h-5 w-5 text-blue-500" />
              Assign This Event To Family Members
        </Label>
        
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2 text-sm text-blue-700">
              ✓ Check boxes below to assign this event to specific family members
            </div>
            
            {isLoadingMembers ? (
              <div className="text-sm text-gray-500 p-3 border border-gray-200 rounded-md bg-gray-50">
                Loading family members...
              </div>
            ) : members.length > 0 ? (
              <div className="border border-blue-200 rounded-md p-3 max-h-[150px] overflow-y-auto bg-white">
                <div className="flex justify-between mb-2 pb-1 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500">
                    SELECT ATTENDEES ({members.length})
                  </span>
                  <Button 
                    type="button"
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      if (selectedAttendees.length === members.length) {
                        setSelectedAttendees([]);
                      } else {
                        setSelectedAttendees(members.map(m => 
                          typeof m.id === 'string' ? parseInt(m.id, 10) : m.id
                        ));
                      }
                    }}
                  >
                    {selectedAttendees.length === members.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
            <div className="space-y-2">
                  {members.map((member) => {
                    const memberId = member.id;
                    const memberIdNum = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId;
                    const displayName = member.username || member.name || `Member ${memberId}`;
                    
                    return (
                      <div key={memberId} className="flex items-center space-x-2 p-1 hover:bg-blue-50 rounded transition-colors">
                  <Checkbox 
                          id={`member-${memberId}`}
                          checked={selectedAttendees.includes(memberIdNum)}
                          onCheckedChange={() => toggleAttendee(memberId)}
                          className="h-5 w-5 border-blue-500"
                  />
                  <Label 
                          htmlFor={`member-${memberId}`}
                          className="text-sm cursor-pointer flex flex-col font-medium"
                        >
                          <span className="text-blue-700">
                            {displayName}
                            {member.role?.name && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                {member.role.name}
                              </span>
                            )}
                          </span>
                          {member.email && (
                            <span className="text-xs text-gray-500 italic">
                              {member.email}
                            </span>
                          )}
                  </Label>
                </div>
                    );
                  })}
            </div>
          </div>
        ) : (
              <div className="text-sm text-gray-500 p-3 border border-gray-200 rounded-md bg-gray-50">
                No family members found. Please add family members first.
              </div>
        )}
        
        {selectedAttendees.length > 0 && (
          <div className="mt-2">
            <Label className="text-xs text-gray-500 ml-1">Selected Attendees ({selectedAttendees.length})</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedAttendees.map((id) => {
                    const member = members.find(m => {
                  const mId = typeof m.id === 'string' ? parseInt(m.id, 10) : m.id;
                  return mId === id;
                });
                
                const displayName = member 
                      ? (member.username || member.name || `Member ${id}`)
                  : `Member ${id}`;
                
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1 pl-2 bg-blue-100 text-blue-800">
                    {displayName}
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 p-0 ml-1 hover:bg-blue-200 rounded-full"
                      onClick={() => toggleAttendee(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end space-x-3 pt-4 mt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-brand-navy hover:bg-brand-navy-dark transition-colors"
          disabled={!isValid}
        >
          Save Event
        </Button>
      </div>
    </form>
  );
} 