'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Shows a full-screen overlay during deletion operations to prevent UI glitches
 */
export default function DeletionOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Immediately check for deletion state
    const isDeletingFamily = localStorage.getItem('family_deletion_in_progress') === 'true';
    if (isDeletingFamily) {
      console.log('[DeletionOverlay] Detected deletion in progress, showing overlay');
      setIsVisible(true);
      
      // Start a countdown for navigation
      setCountdown(1);
    }

    // Check if we're in a deletion state
    const checkDeletionState = () => {
      const isDeletingFamily = localStorage.getItem('family_deletion_in_progress') === 'true';
      
      if (isDeletingFamily && !isVisible) {
        console.log('[DeletionOverlay] Detected new deletion in progress');
        setIsVisible(true);
        setCountdown(1);
      }
      
      if (!isDeletingFamily && isVisible) {
        console.log('[DeletionOverlay] Deletion complete, hiding overlay');
        // Only hide after a delay to ensure smooth transition
        setTimeout(() => setIsVisible(false), 500);
      }
    };
    
    // Set up interval to check for deletion state changes
    const interval = setInterval(checkDeletionState, 100);
    
    // Clean up
    return () => clearInterval(interval);
  }, [isVisible]);
  
  // Handle countdown navigation
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        // Navigate back to family page directly from here
        console.log('[DeletionOverlay] Navigating to family page from overlay');
        
        // Clear the flag
        localStorage.removeItem('family_deletion_in_progress');
        
        // Use hard navigation to force a clean state
        window.location.href = '/family';
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown, router]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-black/90 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="bg-card rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-border/30">
        <div className="mb-6 relative">
          {/* Professional circular spinner with dual rings */}
          <div className="w-20 h-20 mx-auto relative">
            {/* Outer ring - slower rotation */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary border-r-primary/40 animate-spin" style={{ animationDuration: '1.5s' }}></div>
            {/* Inner ring - faster rotation in opposite direction */}
            <div className="absolute inset-2 rounded-full border-4 border-primary/20 border-b-primary border-l-primary/40 animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>
            {/* Center dot */}
            <div className="absolute inset-1/3 bg-primary/20 rounded-full"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-foreground">Deleting Family</h2>
        <p className="text-muted-foreground mb-2">
          Please wait while we process your request...
        </p>
        <p className="text-xs text-muted-foreground/70">
          You'll be redirected automatically when complete
        </p>
      </div>
    </div>
  );
} 