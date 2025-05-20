import { FamilyCalendarEvent } from "@/lib/services/familyCalendarService";

/**
 * Converts a date to iCal format (YYYYMMDDTHHMMSSZ)
 */
function formatDateForICal(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates a unique ID for an iCal event
 */
function generateUID(event: FamilyCalendarEvent): string {
  return `event-${event.id}-${Date.now()}@tasktracker.com`;
}

/**
 * Converts an array of calendar events to iCal format
 */
export function eventsToICal(events: FamilyCalendarEvent[], calendarName: string = 'Family Calendar'): string {
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TaskTracker//Family Calendar//EN',
    `X-WR-CALNAME:${calendarName}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    icalContent = [
      ...icalContent,
      'BEGIN:VEVENT',
      `UID:${generateUID(event)}`,
      `DTSTAMP:${formatDateForICal(new Date())}`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      event.isRecurring && event.recurrencePattern ? `RRULE:${event.recurrencePattern}` : '',
      'END:VEVENT'
    ].filter(Boolean); // Remove empty lines
  });

  icalContent.push('END:VCALENDAR');
  return icalContent.join('\r\n');
}

/**
 * Downloads the calendar as an iCal file
 */
export function downloadCalendarAsICal(events: FamilyCalendarEvent[], familyName: string): void {
  const icalContent = eventsToICal(events, `${familyName} Calendar`);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.setAttribute('download', `${familyName.replace(/\s+/g, '-').toLowerCase()}-calendar.ics`);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a calendar subscription URL
 * Note: This would need to be implemented on the backend to work properly
 */
export function getCalendarSubscriptionUrl(familyId: number): string {
  // This would typically be a server endpoint that generates an authenticated calendar feed
  return `${window.location.origin}/api/v1/family/${familyId}/calendar/feed?token=TOKEN_SHOULD_BE_GENERATED_BY_BACKEND`;
} 