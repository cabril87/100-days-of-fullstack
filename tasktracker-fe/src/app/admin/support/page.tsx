import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import CustomerSupport from '@/components/admin/CustomerSupport';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function CustomerSupportPage() {
  // Get auth session and redirect if not authenticated (role check can be done client-side)
  const { session } = await ProtectedPagePattern('/admin/support');

  // Pass authenticated user to client component
  return <CustomerSupport user={session!} />;
} 