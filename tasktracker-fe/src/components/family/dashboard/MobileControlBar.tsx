'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Volume2, VolumeX, Vibrate, Sparkles } from 'lucide-react';
import { triggerHapticFeedback } from '@/components/search/MobileSearchEnhancements';
import { cn } from '@/lib/utils/utils';

interface MobileControlBarProps {
  enableHaptic: boolean;
  setEnableHaptic: (enabled: boolean) => void;
  enableAnimations: boolean;
  setEnableAnimations: (enabled: boolean) => void;
}

/**
 * Mobile Control Bar Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Container with p-1.5 sm:p-2 padding (6px mobile)
 * - Badge with text and icon
 * - Two 44px touch target buttons
 * - Flex layout with space-x-1 gaps
 * 
 * Total estimated width: ~200px on mobile
 */
export default function MobileControlBar({
  enableHaptic,
  setEnableHaptic,
  enableAnimations,
  setEnableAnimations
}: MobileControlBarProps) {
  return (
    <div className={cn(
      "lg:hidden flex items-center justify-between p-1.5 sm:p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 mb-2 sm:mb-3 max-w-full overflow-hidden",
      "min-h-[44px]" // Enterprise touch target compliance
    )}>
      {/* Left side - Badge and text */}
      <div className="flex items-center space-x-1 min-w-0 flex-1">
        <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 flex-shrink-0 px-1.5">
          <Smartphone className="w-3 h-3 mr-1" />
          <span className="hidden xs:inline">Mobile</span>
        </Badge>
        <span className="text-xs text-purple-600 dark:text-purple-400 truncate max-w-[120px] sm:max-w-none">
          Swipe tabs
        </span>
      </div>
      
      {/* Right side - Control buttons */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {/* Haptic feedback toggle */}
        <Button
          variant={enableHaptic ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setEnableHaptic(!enableHaptic);
            if (!enableHaptic) {
              triggerHapticFeedback('medium');
            }
          }}
          className="w-8 h-8 p-0 min-h-[44px] min-w-[44px]"
          title={enableHaptic ? 'Disable haptic feedback' : 'Enable haptic feedback'}
        >
          {enableHaptic ? (
            <Vibrate className="w-3 h-3" />
          ) : (
            <VolumeX className="w-3 h-3" />
          )}
        </Button>
        
        {/* Animation toggle */}
        <Button
          variant={enableAnimations ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setEnableAnimations(!enableAnimations);
            if (enableHaptic) {
              triggerHapticFeedback('light');
            }
          }}
          className="w-8 h-8 p-0 min-h-[44px] min-w-[44px]"
          title={enableAnimations ? 'Disable animations' : 'Enable animations'}
        >
          {enableAnimations ? (
            <Sparkles className="w-3 h-3" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
} 