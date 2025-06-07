import React from 'react';
import { redirect } from 'next/navigation';
import { getServerAuth } from '@/lib/utils/serverAuth';
import FamiliesContent from './FamiliesContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function MyFamiliesPage() {
  const { user, isAuthenticated } = await getServerAuth();

  if (!isAuthenticated || !user) {
    redirect('/auth/login');
  }

  return <FamiliesContent user={user} />;
} 