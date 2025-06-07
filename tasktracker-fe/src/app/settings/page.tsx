import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/utils/serverAuth';

export default async function SettingsPage() {
  // Server-side authentication - redirect if not authenticated
  await requireAuth();
  
  // Server-side redirect to profile as the default settings page
  redirect('/settings/profile');
} 