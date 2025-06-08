import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import UserCreation from '@/components/admin/UserCreation';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function AdminUserCreationPage() {
  // Get auth session and redirect if not authenticated (admin check can be done client-side)
  const { session } = await ProtectedPagePattern('/admin/user-creation');

  return <UserCreation user={session!} />;
} 