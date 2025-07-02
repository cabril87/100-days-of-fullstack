/*
 * Mobile Search Enhancements
 * Enterprise-grade mobile search features for TaskTracker
 * Features: Voice search, haptic feedback, gesture navigation, mobile-first UX
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Vibrate, 
  VolumeX,
  Smartphone,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/helpers/utils';
import { 
  MobileSearchEnhancementsProps,
  VoiceSearchButtonProps,
  MobileSearchToolbarProps,
} from '@/lib/types';
import { triggerHapticFeedback, useVoiceSearch } from '@/lib/helpers/mobile';


// Type definitions for Speech Recognition API
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  [index: number]: {
    readonly transcript: string;
    readonly confidence: number;
  };
}

interface SpeechRecognitionEvent extends Event {
  readonly results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((ev: Event) => void) | null;
  onresult: ((ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// Voice search hook now imported from lib/helpers/mobile

export function VoiceSearchButton({ onVoiceResult, className, size = 'md' }: VoiceSearchButtonProps) {
  const { isSupported, isListening, transcript, startListening, stopListening } = useVoiceSearch(onVoiceResult);

  const sizeConfig = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant={isListening ? 'destructive' : 'outline'}
        size="icon"
        onClick={isListening ? stopListening : startListening}
        className={cn(
          sizeConfig[size],
          "transition-all duration-200 hover:scale-105 active:scale-95",
          isListening && "animate-pulse bg-red-500 hover:bg-red-600",
          className
        )}
        title={isListening ? 'Stop voice search' : 'Start voice search'}
      >
        {isListening ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
      
      {isListening && (
        <div className="absolute -top-2 -right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
      )}
      
      {transcript && isListening && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-black text-white text-xs rounded-md whitespace-nowrap z-50">
          {transcript}
        </div>
      )}
    </div>
  );
}

/**
 * Mobile Search Toolbar Component
 */
// MobileSearchToolbarProps now imported from lib/types

export function MobileSearchToolbar({ 
  onVoiceSearch, 
  onHapticToggle, 
  enableVoice = true, 
  enableHaptic = true,
  className 
}: MobileSearchToolbarProps) {
  const [hapticEnabled, setHapticEnabled] = useState(enableHaptic);

  const handleHapticToggle = useCallback(() => {
    const newState = !hapticEnabled;
    setHapticEnabled(newState);
    onHapticToggle?.(newState);
    
    if (newState) {
      triggerHapticFeedback('medium');
    }
  }, [hapticEnabled, onHapticToggle]);

  return (
    <div className={cn(
      "flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg",
      "border border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          <Smartphone className="w-3 h-3 mr-1" />
          Mobile
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Voice Search */}
        {enableVoice && onVoiceSearch && (
          <VoiceSearchButton 
            onVoiceResult={onVoiceSearch}
            size="sm"
          />
        )}
        
        {/* Haptic Feedback Toggle */}
        {typeof navigator !== 'undefined' && 'vibrate' in navigator && (
          <Button
            variant={hapticEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={handleHapticToggle}
            className="w-8 h-8 p-0"
            title={hapticEnabled ? 'Disable haptic feedback' : 'Enable haptic feedback'}
          >
            {hapticEnabled ? (
              <Vibrate className="w-3 h-3" />
            ) : (
              <VolumeX className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Main Mobile Search Enhancements Component
 */
export function MobileSearchEnhancements({
  onVoiceSearch,

  enableHapticFeedback = true,
  enableVoiceSearch = true,
  enableGestureNavigation = true,
  className
}: MobileSearchEnhancementsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <MobileSearchToolbar
        onVoiceSearch={onVoiceSearch}
        enableVoice={enableVoiceSearch}
        enableHaptic={enableHapticFeedback}
      />
      
      {/* Mobile-specific search hints */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Mobile Search Tips
          </span>
        </div>
        <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
          {enableVoiceSearch && <div>• Tap the mic icon for voice search</div>}
          {enableGestureNavigation && <div>• Swipe left/right on results for quick actions</div>}
          {enableHapticFeedback && <div>• Haptic feedback confirms your actions</div>}
          <div>• Pull down to refresh search results</div>
        </div>
      </div>
    </div>
  );
}

export default MobileSearchEnhancements; 
