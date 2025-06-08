import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import FamilyManagement from '@/components/settings/FamilyManagement';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function FamilySettingsPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/settings/family');

  // Pass user data to client component
  return <FamilyManagement user={session} />;
} 