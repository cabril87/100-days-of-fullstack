import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/utils/serverAuth';
import FamilySeedingPageContent from './FamilySeedingPageContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function FamilySeedingPage() {
  const { user, isAuthenticated } = await getServerAuth();

  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  // Check if user is global admin
  const isGlobalAdmin = user?.email === 'admin@tasktracker.com' || user?.role.toLowerCase() === 'globaladmin';
  if (!isGlobalAdmin) {
    redirect('/dashboard');
  }

  return <FamilySeedingPageContent user={user} />;
} 