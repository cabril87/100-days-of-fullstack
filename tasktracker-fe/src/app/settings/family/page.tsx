import { requireAuth } from '@/lib/utils/serverAuth';
import FamilyManagementContent from './FamilyManagementContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function FamilySettingsPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();

  // Pass user data to client component
  return <FamilyManagementContent user={user} />;
} 