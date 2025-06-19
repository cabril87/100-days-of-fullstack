/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Animation Container
 * React component for high-performance sprite animations
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { spriteAnimationService, AnimationType, AnimationConfig, TextAnimationConfig, AnimationMetrics } from '@/lib/services/spriteAnimationService';

interface EnterpriseAnimationContainerProps {
  enabled?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  showMetrics?: boolean;
  debugMode?: boolean;
  onAnimationComplete?: (animationId: string) => void;
  onAnimationStart?: (animationId: string) => void;
}

/**
 * Enterprise Animation Container Component
 * Provides smooth, high-performance animations for the application
 */
export const EnterpriseAnimationContainer: React.FC<EnterpriseAnimationContainerProps> = ({
  enabled = true,
  quality = 'high',
  showMetrics = false,
  debugMode = false,
  onAnimationComplete,
  onAnimationStart
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<AnimationMetrics | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize animation service
  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      try {
        spriteAnimationService.mount(containerRef.current);
        spriteAnimationService.setEnabled(enabled);
        spriteAnimationService.setQuality(quality);
        setIsInitialized(true);
        
        if (debugMode) {
          console.log('🎮 Enterprise Animation Container initialized');
        }
      } catch (error) {
        console.error('❌ Failed to initialize animation container:', error);
      }
    }

    return () => {
      if (isInitialized) {
        spriteAnimationService.unmount();
        setIsInitialized(false);
      }
    };
  }, [enabled, quality, debugMode, isInitialized]);

  // Update settings when props change
  useEffect(() => {
    if (isInitialized) {
      spriteAnimationService.setEnabled(enabled);
      spriteAnimationService.setQuality(quality);
    }
  }, [enabled, quality, isInitialized]);

  // Performance monitoring
  useEffect(() => {
    if (!showMetrics || !isInitialized) return;

    const interval = setInterval(() => {
      try {
        const currentMetrics = spriteAnimationService.getMetrics();
        setMetrics(currentMetrics);
      } catch (error) {
        console.error('Error getting animation metrics:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showMetrics, isInitialized]);

  // Animation testing functions for development
  const testAnimations = {
    achievementUnlock: () => {
      const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spriteAnimationService.playEnhancedAnimation({
        type: 'achievement-unlock',
        position,
        duration: 3000,
        intensity: 1,
        particles: 15,
        onStart: () => onAnimationStart?.('achievement-test'),
        onComplete: () => onAnimationComplete?.('achievement-test')
      });
    },

    levelUp: () => {
      const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spriteAnimationService.playEnhancedAnimation({
        type: 'level-up',
        position,
        duration: 4000,
        intensity: 1.5,
        particles: 25,
        onStart: () => onAnimationStart?.('level-up-test'),
        onComplete: () => onAnimationComplete?.('level-up-test')
      });
    },

    celebrationFireworks: () => {
      const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spriteAnimationService.playEnhancedAnimation({
        type: 'celebration-fireworks',
        position,
        duration: 5000,
        intensity: 2,
        particles: 30,
        onStart: () => onAnimationStart?.('fireworks-test'),
        onComplete: () => onAnimationComplete?.('fireworks-test')
      });
    },

    textAnimation: () => {
      const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spriteAnimationService.playTextAnimation({
        text: 'Enterprise Animation!',
        position,
        fontSize: 32,
        fontWeight: '700',
        color: '#00ff88',
        animation: 'bounce-in',
        duration: 2000,
        onStart: () => onAnimationStart?.('text-test'),
        onComplete: () => onAnimationComplete?.('text-test')
      });
    },

    characterDance: () => {
      const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spriteAnimationService.playEnhancedAnimation({
        type: 'character-dance',
        position,
        character: 'hero',
        duration: 3000,
        onStart: () => onAnimationStart?.('dance-test'),
        onComplete: () => onAnimationComplete?.('dance-test')
      });
    },

    energyWave: () => {
      const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      spriteAnimationService.playEnhancedAnimation({
        type: 'energy-wave',
        position,
        color: '#ff6b6b',
        duration: 2000,
        onStart: () => onAnimationStart?.('energy-test'),
        onComplete: () => onAnimationComplete?.('energy-test')
      });
    }
  };

  // Expose testing functions globally in debug mode
  useEffect(() => {
    if (debugMode && typeof window !== 'undefined') {
      (window as any).testAnimations = testAnimations;
      console.log('🎮 Animation testing functions available at window.testAnimations');
    }
  }, [debugMode]);

  return (
    <>
      {/* Main animation container */}
      <div
        ref={containerRef}
        id="enterprise-animation-root"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden'
        }}
      />

      {/* Performance metrics overlay */}
      {showMetrics && metrics && (
        <div
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            🎮 Animation Metrics
          </div>
          <div>Active: {metrics.activeAnimations}</div>
          <div>Total Played: {metrics.totalAnimationsPlayed}</div>
          <div>FPS: {Math.round(metrics.averageFrameRate)}</div>
          <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>
          <div>Dropped Frames: {metrics.droppedFrames}</div>
          <div>Smoothness: {Math.round(metrics.smoothnessScore)}%</div>
          <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.7 }}>
            Quality: {quality.toUpperCase()}
          </div>
        </div>
      )}

      {/* Debug controls */}
      {debugMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'system-ui',
            fontSize: '14px',
            zIndex: 10000,
            pointerEvents: 'auto',
            minWidth: '200px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            🎮 Animation Debug Controls
          </div>
          
          <div style={{ display: 'grid', gap: '8px' }}>
            <button
              onClick={testAnimations.achievementUnlock}
              style={{
                padding: '8px 12px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🏆 Achievement Unlock
            </button>
            
            <button
              onClick={testAnimations.levelUp}
              style={{
                padding: '8px 12px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⬆️ Level Up
            </button>
            
            <button
              onClick={testAnimations.celebrationFireworks}
              style={{
                padding: '8px 12px',
                background: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🎆 Celebration
            </button>
            
            <button
              onClick={testAnimations.textAnimation}
              style={{
                padding: '8px 12px',
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📝 Text Animation
            </button>
            
            <button
              onClick={testAnimations.characterDance}
              style={{
                padding: '8px 12px',
                background: '#E91E63',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              💃 Character Dance
            </button>
            
            <button
              onClick={testAnimations.energyWave}
              style={{
                padding: '8px 12px',
                background: '#00BCD4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⚡ Energy Wave
            </button>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
            Status: {enabled ? '✅ Enabled' : '❌ Disabled'} | Quality: {quality}
          </div>
        </div>
      )}
    </>
  );
};

// Hook for using animations in components
export const useEnterpriseAnimations = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if animation service is available
    if (spriteAnimationService) {
      setIsReady(true);
    }
  }, []);

  const playAnimation = async (config: AnimationConfig): Promise<string> => {
    if (!isReady) {
      console.warn('Animation service not ready');
      return '';
    }
    
    return spriteAnimationService.playEnhancedAnimation(config);
  };

  const playTextAnimation = async (config: TextAnimationConfig): Promise<string> => {
    if (!isReady) {
      console.warn('Animation service not ready');
      return '';
    }
    
    return spriteAnimationService.playTextAnimation(config);
  };

  const getMetrics = (): AnimationMetrics | null => {
    if (!isReady) return null;
    return spriteAnimationService.getMetrics();
  };

  const setQuality = (quality: 'low' | 'medium' | 'high' | 'ultra') => {
    if (isReady) {
      spriteAnimationService.setQuality(quality);
    }
  };

  return {
    isReady,
    playAnimation,
    playTextAnimation,
    getMetrics,
    setQuality
  };
};

export default EnterpriseAnimationContainer; 