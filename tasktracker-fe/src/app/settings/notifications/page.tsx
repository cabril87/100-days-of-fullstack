import { requireAuth } from '@/lib/utils/serverAuth';
import NotificationSettingsContent from './NotificationSettingsContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function NotificationSettingsPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();

  // Pass user data to client component
  return <NotificationSettingsContent user={user} />;
} 