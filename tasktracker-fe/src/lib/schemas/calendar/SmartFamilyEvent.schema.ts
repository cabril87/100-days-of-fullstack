import { z } from 'zod';

export const smartEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200),
  description: z.string().max(1000).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().max(200).optional(),
  attendeeIds: z.array(z.number()).min(1, 'At least one family member must be selected'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().max(100).optional(),
  isRecurring: z.boolean(),
  recurrencePattern: z.string().optional(),
  reminderMinutes: z.number().min(0).max(10080),
  allowConflicts: z.boolean(),
  requireAllAttendees: z.boolean()
});

export type SmartEventFormData = z.infer<typeof smartEventSchema>; 