'use client';

import React, { useEffect, useState } from 'react';
import { useFamily } from '@/lib/providers/FamilyContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { CalendarModal } from '@/components/family/CalendarModal';

// This page redirects users to the appropriate place:
// - If they have a family, it redirects to the main family dashboard
// - If they don't have a family, it also redirects to the main family dashboard
// This preserves backward compatibility with links to /family/dashboard

export default function DashboardRedirect() {
  const router = useRouter();
  const { family } = useFamily();
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  useEffect(() => {
    // Always redirect to the main family dashboard
    router.push('/family');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-96" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Family Dashboard</h1>
        <Button variant="outline" onClick={() => setIsCalendarModalOpen(true)}>
          <Calendar className="h-4 w-4 mr-2" />
          View Calendar
        </Button>
      </div>
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        familyId={family?.id ? parseInt(family.id) : 0}
      />
    </div>
  );
}