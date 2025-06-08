import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import FamilySeeding from '@/components/admin/FamilySeeding';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function FamilySeedingPage() {
  // Get auth session and redirect if not authenticated (admin check can be done client-side)
  const { session } = await ProtectedPagePattern('/admin/family-seeding');

  return <FamilySeeding user={session!} />;
} 