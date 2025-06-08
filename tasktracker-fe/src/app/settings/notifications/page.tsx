import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import NotificationSettings from '@/components/settings/NotificationSettings';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function NotificationSettingsPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/settings/notifications');

  // Pass user data to client component
  return <NotificationSettings user={session} />;
} 