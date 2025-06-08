import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import Gamification from '@/components/gamification/Gamification';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function GamificationPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/gamification');

  return <Gamification user={session} />;
} 