import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/utils/serverAuth';
import UserCreationPageContent from './UserCreationPageContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function AdminUserCreationPage() {
  const { user, isAuthenticated } = await getServerAuth();

  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  // Check if user is global admin
  const isGlobalAdmin = user?.email?.toLowerCase() === 'admin@tasktracker.com';
  if (!isGlobalAdmin) {
    redirect('/dashboard');
  }

  return <UserCreationPageContent user={user} />;
} 