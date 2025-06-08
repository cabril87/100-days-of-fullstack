import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import Families from '@/components/family/Families';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function MyFamiliesPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/families');

  return <Families user={session} />;
} 