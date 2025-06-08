import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import { redirect } from 'next/navigation';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Get auth session and redirect if not authenticated
  await ProtectedPagePattern('/settings');
  
  // Server-side redirect to profile as the default settings page
  redirect('/settings/profile');
} 