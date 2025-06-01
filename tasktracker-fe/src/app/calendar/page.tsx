/**
 * Family Calendar Page
 * Comprehensive calendar view for all family events with hybrid view options
 */

'use client';

import { GlobalFamilyCalendar } from '@/components/family/GlobalFamilyCalendar';
import { Metadata } from 'next';

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <GlobalFamilyCalendar />
    </div>
  );
}