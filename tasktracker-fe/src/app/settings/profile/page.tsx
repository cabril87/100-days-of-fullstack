import { requireAuth, serverApiCall } from '@/lib/utils/serverAuth';
import { User } from '@/lib/types/auth';
import ProfileSettingsContent from './ProfileSettingsContent';

export default async function ProfileSettingsPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();
  
  // Server-side data fetching for better performance
  let userProfile: User = user;
  
  try {
    // Fetch additional profile data if needed
    const profileData = await serverApiCall<{ user: User }>('/api/v1/auth/me');
    userProfile = profileData.user;
  } catch {
    console.warn('Failed to fetch extended profile data, using session data');
    // Continue with basic user data from session
  }
  
  // Pass server-fetched data to client component
  return <ProfileSettingsContent user={userProfile} />;
} 