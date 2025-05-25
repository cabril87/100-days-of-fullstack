'use client';

import { useAuthenticatedSignalR } from '@/lib/hooks/useAuthenticatedSignalR';

/**
 * Component that automatically manages SignalR connection based on authentication status
 * This component doesn't render anything but handles the SignalR lifecycle
 */
export default function SignalRManager() {
  const { isConnected, isConnecting } = useAuthenticatedSignalR();

  // This component doesn't render anything visible
  // It just manages the SignalR connection in the background
  return null;
} 