import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch'; 
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

// Define available recurrence patterns
const recurrencePatterns = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekdays', label: 'Weekdays (Mon-Fri)' },
  { value: 'weekends', label: 'Weekends (Sat-Sun)' },
];

export function EventForm({
  familyId,
  selectedDate,
  onSubmit,
  onCancel,
  initialData,
}: EventFormProps) {
  // Use refs to track if the component is mounted
  const isMounted = useRef(true);
  const [members, setMembers] = useState<any[]>([]);
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay || false);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [formValid, setFormValid] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialData?.color || '#3b82f6');
  const [selectedAttendees, setSelectedAttendees] = useState<number[]>(initialData?.attendeeIds || []);
  const [recurrenceExceptions, setRecurrenceExceptions] = useState<Date[]>(initialData?.recurrenceExceptions || []);
  const [showExceptionPicker, setShowExceptionPicker] = useState(false);
  const { showToast } = useToast();
  
  const defaultValues: EventFormData = {
    ...initialData,
    start: selectedDate || new Date(),
    end: selectedDate ? new Date(selectedDate.getTime() + 60 * 60 * 1000) : new Date(Date.now() + 60 * 60 * 1000),
    isAllDay: isAllDay,
    isRecurring: isRecurring,
    eventType: initialData?.eventType || 'General',
    title: initialData?.title || '',
    color: selectedColor,
    attendeeIds: initialData?.attendeeIds || [],
    recurrenceExceptions: initialData?.recurrenceExceptions || [],
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    control,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues,
    mode: 'onChange'
  });

  // Watch for form validity changes
  useEffect(() => {
    setFormValid(isValid);
  }, [isValid]);

  // Use useEffect cleanup to prevent updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe setValue function that checks if component is still mounted
  const safeSetValue = useCallback((field: keyof EventFormData, value: any) => {
    if (isMounted.current) {
      setValue(field, value);
    }
  }, [setValue]);

  // Separate useEffects for each state change to prevent unnecessary re-renders
  useEffect(() => {
    if (isAllDay !== watch('isAllDay')) {
      safeSetValue('isAllDay', isAllDay);
    }
  }, [isAllDay, watch, safeSetValue]);

  useEffect(() => {
    if (isRecurring !== watch('isRecurring')) {
      safeSetValue('isRecurring', isRecurring);
    }
  }, [isRecurring, watch, safeSetValue]);

  useEffect(() => {
    safeSetValue('color', selectedColor);
  }, [selectedColor, safeSetValue]);

  // Update form when attendees change
  useEffect(() => {
    safeSetValue('attendeeIds', selectedAttendees);
  }, [selectedAttendees, safeSetValue]);

  // Automatically adjust end time when start time changes
  const startTime = watch('start');
  useEffect(() => {
    if (startTime && !initialData) {
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      safeSetValue('end', endTime);
    }
  }, [startTime, initialData, safeSetValue]);

  const fetchMembers = async () => {
    try {
      const response = await familyService.getFamily(String(familyId));
      if (response.data && response.data.members && isMounted.current) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Failed to fetch family members:', error);
      if (isMounted.current) {
        showToast('Failed to fetch family members', 'error');
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [familyId]);

  const handleFormSubmit = (data: EventFormData) => {
    // Ensure the form uses the latest state values
    const finalData = {
      ...data,
      isAllDay,
      isRecurring,
      color: selectedColor,
      attendeeIds: selectedAttendees,
      recurrenceExceptions, // Include exceptions in the submitted data
    };
    
    onSubmit(finalData);
  };

  // Handle switch change directly with local state
  const handleIsAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    
    // If switching to all day, adjust times
    if (checked) {
      const startDate = new Date(watch('start'));
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      
      safeSetValue('start', startDate);
      safeSetValue('end', endDate);
    }
  };

  const handleIsRecurringChange = (checked: boolean) => {
    setIsRecurring(checked);
    
    // If disabling recurrence, clear exceptions
    if (!checked) {
      setRecurrenceExceptions([]);
    }
  };
  
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleEventTypeSelect = (type: string) => {
    safeSetValue('eventType', type);
    // Set default color based on event type
    const eventType = eventTypes.find(et => et.value === type);
    if (eventType) {
      setSelectedColor(eventType.color);
    }
  };

  const toggleAttendee = (memberId: number) => {
    setSelectedAttendees(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  // Add a function to add exception dates
  const addExceptionDate = (date: Date) => {
    setRecurrenceExceptions(prev => {
      // Check if date already exists
      const exists = prev.some(d => 
        d.getFullYear() === date.getFullYear() && 
        d.getMonth() === date.getMonth() && 
        d.getDate() === date.getDate()
      );
      
      if (exists) {
        showToast('This date is already an exception', 'error');
        return prev;
      }
      
      return [...prev, date];
    });
  };
  
  // Add a function to remove exception dates
  const removeExceptionDate = (index: number) => {
    setRecurrenceExceptions(prev => {
      const newExceptions = [...prev];
      newExceptions.splice(index, 1);
      return newExceptions;
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 pt-2">
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
          className="min-h-[80px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            Time
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isAllDay"
              checked={isAllDay}
              onCheckedChange={handleIsAllDayChange}
              className="data-[state=checked]:bg-brand-navy"
            />
            <Label htmlFor="isAllDay" className="text-sm cursor-pointer">All Day Event</Label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
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
                    value={watch('start')}
                    onChange={(date) => safeSetValue('start', date)}
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
                    value={watch('end')}
                    onChange={(date) => safeSetValue('end', date)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label 
            htmlFor="eventType" 
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4 text-gray-500" />
            Event Type
          </Label>
          <Select 
            defaultValue={watch('eventType')} 
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-gray-500" />
            Recurring Event
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={handleIsRecurringChange}
              className="data-[state=checked]:bg-brand-navy"
            />
            <Label htmlFor="isRecurring" className="text-sm cursor-pointer">Repeat</Label>
          </div>
        </div>
        
        {isRecurring && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="recurrencePattern" className="text-sm font-medium">
                Recurrence Pattern
              </Label>
              <Select 
                defaultValue={watch('recurrencePattern') || 'weekly'} 
                onValueChange={(value) => safeSetValue('recurrencePattern', value)}
              >
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
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
                <div className="p-3 border border-gray-200 rounded-md bg-white">
                  <Label className="text-xs text-gray-500 mb-2 block">
                    Select dates when this event should not occur
                  </Label>
                  <div className="flex flex-col space-y-2">
                    <DateTimePicker
                      value={new Date()}
                      onChange={(date) => {
                        if (date) {
                          addExceptionDate(date);
                          setShowExceptionPicker(false);
                        }
                      }}
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
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1 pl-2">
                        {format(date, 'MMM d, yyyy')}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 rounded-full"
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

      <div className="space-y-2 mt-4 border-t pt-4">
        <Label 
          htmlFor="attendees" 
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <Users className="h-4 w-4 text-gray-500" />
          Attendees (Optional)
        </Label>
        
        {members.length > 0 ? (
          <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto bg-white">
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`member-${member.id}`}
                    checked={selectedAttendees.includes(member.id)}
                    onCheckedChange={() => toggleAttendee(member.id)}
                  />
                  <Label 
                    htmlFor={`member-${member.id}`}
                    className="text-sm cursor-pointer flex items-center"
                  >
                    {member.username || member.name || `Member ${member.id}`}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No family members found</div>
        )}
        
        {selectedAttendees.length > 0 && (
          <div className="mt-2">
            <Label className="text-xs text-gray-500 ml-1">Selected ({selectedAttendees.length})</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedAttendees.map((id) => {
                const member = members.find(m => m.id === id);
                return member ? (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1 pl-2">
                    {member.username || member.name || `Member ${id}`}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 rounded-full"
                      onClick={() => toggleAttendee(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          disabled={!formValid}
        >
          Save Event
        </Button>
      </div>
    </form>
  );
} 