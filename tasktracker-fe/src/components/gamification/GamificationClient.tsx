'use client';

import React from 'react';
import Gamification from './Gamification';
import { useDashboardConnections } from '@/lib/hooks/useDashboardConnections';
import type { User } from '@/lib/types/auth';

interface GamificationClientProps {
  user: User;
}

export default function GamificationClient({ user }: GamificationClientProps) {
  const { gamificationData, isConnected } = useDashboardConnections({ userId: user.id });

  return (
    <Gamification 
      user={user}
      gamificationData={gamificationData}
      isConnected={isConnected}
    />
  );
} 