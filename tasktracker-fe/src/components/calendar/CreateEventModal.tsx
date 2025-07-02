'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarEventDTO } from '@/lib/types/calendar';

import type { CreateEventModalProps } from '@/lib/props/components/calendar.props';

// Props interface moved to lib/props/components/calendar.props.ts
// interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CalendarEventDTO) => void;
  selectedDate?: Date | null;
  familyId?: number;
}

/**
 * Create Event Modal Component
 * Modal for creating new calendar events
 * Follows enterprise design patterns
 */
export default function CreateEventModal({
  isOpen,
  onClose,
  onEventCreated,
  selectedDate,
  familyId
}: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📅 CreateEventModal: Creating calendar event via API...');
      
      if (!familyId) {
        throw new Error('Family ID is required to create events');
      }

      const createRequest = {
        title,
        description: description || undefined,
        startDate: selectedDate || new Date(),
        endDate: selectedDate || new Date(),
        isAllDay: true,
        color: '#3B82F6',
        eventType: 'reminder'
      };

      // Call actual API service - no mock data
      const { calendarService } = await import('@/lib/services/calendarService');
      const createdEvent = await calendarService.createCalendarEvent(familyId, createRequest);

      console.log('✅ CreateEventModal: Event created successfully:', createdEvent.id);
      
      // Service now returns properly transformed CalendarEventDTO
      onEventCreated(createdEvent);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('❌ CreateEventModal: Failed to create event:', error);
      // TODO: Add proper error handling UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
