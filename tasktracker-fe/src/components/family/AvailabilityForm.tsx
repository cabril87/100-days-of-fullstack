import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { familyService } from '@/lib/services/familyService';
import { useToast } from '@/lib/providers/ToastProvider';
import { familyCalendarService, MemberAvailability } from '@/lib/services/familyCalendarService';

const availabilitySchema = z.object({
  familyMemberId: z.number(),
  startTime: z.date(),
  endTime: z.date(),
  isRecurring: z.boolean(),
  recurrencePattern: z.string().optional(),
  status: z.string(),
  dayOfWeek: z.number().optional(),
  note: z.string().optional(),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface AvailabilityFormProps {
  familyId: number;
  selectedDate?: Date | null;
  onSubmit: (data: AvailabilityFormData) => void;
  onCancel: () => void;
  initialData?: MemberAvailability;
}

export function AvailabilityForm({
  familyId,
  selectedDate,
  onSubmit,
  onCancel,
  initialData,
}: AvailabilityFormProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const { showToast } = useToast();
  
  const defaultValues: AvailabilityFormData = initialData 
    ? {
        familyMemberId: initialData.familyMemberId,
        startTime: new Date(initialData.startTime),
        endTime: new Date(initialData.endTime),
        isRecurring: isRecurring,
        recurrencePattern: initialData.recurrencePattern,
        status: initialData.status,
        dayOfWeek: initialData.dayOfWeek,
        note: initialData.note,
      }
    : {
        familyMemberId: 0, // Will be set after fetching members
        startTime: selectedDate || new Date(),
        endTime: selectedDate 
          ? new Date(selectedDate.getTime() + 60 * 60 * 1000) 
          : new Date(Date.now() + 60 * 60 * 1000),
        isRecurring: isRecurring,
        status: 'Free',
      };
      
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AvailabilityFormData>({
    resolver: zodResolver(availabilitySchema),
    defaultValues
  });

  useEffect(() => {
    setValue('isRecurring', isRecurring);
  }, [isRecurring, setValue]);

  const status = watch('status');

  const fetchMembers = async () => {
    try {
      const response = await familyService.getFamily(String(familyId));
      if (response.data && response.data.members) {
        setMembers(response.data.members);
        
        // Set the first member as default if not editing
        if (!initialData && response.data.members.length > 0) {
          setValue('familyMemberId', Number(response.data.members[0].id));
        }
      }
    } catch (error) {
      showToast('Failed to fetch family members', 'error');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [familyId]);

  const handleFormSubmit = (data: AvailabilityFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="familyMemberId">Family Member</Label>
        <Select 
          onValueChange={(value) => setValue('familyMemberId', Number(value))}
          defaultValue={initialData?.familyMemberId?.toString()}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
            <SelectValue placeholder="Select family member" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg">
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id.toString()}>
                {member.username || member.name || `Member ${member.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.familyMemberId && (
          <p className="text-sm text-red-500">{errors.familyMemberId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500 ml-1">Start Time</Label>
          <DateTimePicker
            value={watch('startTime')}
            onChange={(date) => setValue('startTime', date)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500 ml-1">End Time</Label>
          <DateTimePicker
            value={watch('endTime')}
            onChange={(date) => setValue('endTime', date)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Availability Status</Label>
        <RadioGroup 
          defaultValue={status} 
          onValueChange={(value) => setValue('status', value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Free" id="free" />
            <Label htmlFor="free" className="text-green-600">Free</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Tentative" id="tentative" />
            <Label htmlFor="tentative" className="text-yellow-600">Tentative</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Busy" id="busy" />
            <Label htmlFor="busy" className="text-red-600">Busy</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="isRecurring">Recurring Availability</Label>
      </div>

      {isRecurring && (
        <>
          <div>
            <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
            <Input
              id="recurrencePattern"
              {...register('recurrencePattern')}
              placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR"
            />
          </div>
          <div>
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <Select 
              onValueChange={(value) => setValue('dayOfWeek', Number(value))}
              defaultValue={initialData?.dayOfWeek?.toString() || '1'}
            >
              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                <SelectValue placeholder="Select day of week" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="0">Sunday</SelectItem>
                <SelectItem value="1">Monday</SelectItem>
                <SelectItem value="2">Tuesday</SelectItem>
                <SelectItem value="3">Wednesday</SelectItem>
                <SelectItem value="4">Thursday</SelectItem>
                <SelectItem value="5">Friday</SelectItem>
                <SelectItem value="6">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div>
        <Label htmlFor="note">Notes</Label>
        <Textarea
          id="note"
          {...register('note')}
          placeholder="Any additional information"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Availability</Button>
      </div>
    </form>
  );
} 