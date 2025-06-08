import { ProtectedPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';
import { User } from '@/lib/types/auth';
import ProfileSettings from '@/components/settings/ProfileSettings';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/settings/profile');
  
  // Server-side data fetching for better performance
  let userProfile: User | null = session;
  
  try {
    // Fetch additional profile data if needed
    const profileData = await fetchAuthenticatedData<{ user: User }>('/v1/auth/me', { user: session! });
    if (profileData?.user) {
      userProfile = profileData.user;
    }
  } catch {
    console.warn('Failed to fetch extended profile data, using session data');
    // Continue with basic user data from session
  }
  
  // Pass server-fetched data to client component
  return <ProfileSettings user={userProfile!} />;
} 