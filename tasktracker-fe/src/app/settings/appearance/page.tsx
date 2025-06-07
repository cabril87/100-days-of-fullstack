import { requireAuth } from '@/lib/utils/serverAuth';
import AppearanceSettingsContent from './AppearanceSettingsContent';

export default async function AppearanceSettingsPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();

  // Pass user data to client component
  return <AppearanceSettingsContent user={user} />;
} 