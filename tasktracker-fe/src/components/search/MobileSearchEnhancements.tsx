/*
 * Mobile Search Enhancements
 * Enterprise-grade mobile search features for TaskTracker
 * Features: Voice search, haptic feedback, gesture navigation, mobile-first UX
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Vibrate, 
  ChevronLeft, 
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
  Smartphone,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/utils';
import { SearchResultItemDTO } from '@/lib/types/search';
import { 
  MobileSearchEnhancementsProps,
  VoiceSearchButtonProps,
  MobileSearchToolbarProps,
  VoiceSearchHookReturn,
  TouchGesturesHookReturn
} from '@/lib/types';

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

// MobileSearchEnhancementsProps now imported from lib/types

/**
 * Global haptic feedback function
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'start' | 'success' | 'error' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      start: [50, 100, 50],
      success: [100, 50, 100],
      error: [200, 100, 200, 100, 200]
    };
    
    navigator.vibrate(patterns[type]);
  }
}

/**
 * Voice Search Hook
 */
export function useVoiceSearch(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        triggerHapticFeedback('start');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const results = Array.from({ length: event.results.length }, (_, i) => event.results[i]);
        const currentTranscript = results
          .map(result => result[0].transcript)
          .join('');
        
        setTranscript(currentTranscript);
        
        if (results[results.length - 1].isFinal) {
          onResult?.(currentTranscript);
          triggerHapticFeedback('success');
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        triggerHapticFeedback('error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening
  };
}

/**
 * Touch Gesture Hook
 */
export function useTouchGestures(onGesture?: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe) {
      onGesture?.('left', Math.abs(distanceX));
      triggerHapticFeedback('light');
    } else if (isRightSwipe) {
      onGesture?.('right', Math.abs(distanceX));
      triggerHapticFeedback('light');
    } else if (isUpSwipe) {
      onGesture?.('up', Math.abs(distanceY));
      triggerHapticFeedback('light');
    } else if (isDownSwipe) {
      onGesture?.('down', Math.abs(distanceY));
      triggerHapticFeedback('light');
    }
  }, [touchStart, touchEnd, onGesture]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
}

/**
 * Voice Search Button Component
 */
// VoiceSearchButtonProps now imported from lib/types

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
  onGestureNavigation,
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