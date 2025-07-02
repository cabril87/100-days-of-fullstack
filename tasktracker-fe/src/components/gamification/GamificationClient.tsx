'use client';

import React from 'react';
import Gamification from './Gamification';
import { useDashboardConnections } from '@/lib/hooks/useDashboardConnections';
import { GamificationClientProps } from '@/lib/props/components/GamificationClient.props';

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
