import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import CalendarPageWrapper from '@/components/calendar/CalendarPageWrapper';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

// Enterprise metadata for SEO and accessibility
export const metadata = {
  title: 'Family Calendar | TaskTracker Enterprise',
  description: 'Apple-like family calendar with gamification features and task integration',
};

export default async function CalendarPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/calendar');
  
  // Server-side data fetching placeholder - client will handle with proper auth
  const initialCalendarData = {
    events: [],
    familyTasks: [],
    achievements: [],
    stats: {
      tasksThisWeek: 0,
      completedThisWeek: 0,
      totalPoints: 0,
      streakDays: 0,
      upcomingDeadlines: 0,
      familyEvents: 0,
      personalEvents: 0,
      achievementsThisMonth: 0
    }
  };

  console.debug('Calendar page server-side render - client will handle data loading');

  // Pass server-fetched session to client component
  return <CalendarPageWrapper user={session} initialData={initialCalendarData} />;
} 
