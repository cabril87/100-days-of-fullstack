import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import AppearanceSettings from '@/components/settings/AppearanceSettings';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function AppearanceSettingsPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/settings/appearance');

  // Pass user data to client component
  return <AppearanceSettings user={session} />;
} 