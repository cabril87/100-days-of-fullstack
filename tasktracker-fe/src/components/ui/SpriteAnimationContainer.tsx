/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Sprite Animation Container Component
 * Provides a React wrapper for CSS-based sprite animations
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { spriteAnimationService } from '@/lib/services/spriteAnimationService';

interface SpriteAnimationContainerProps {
  enabled?: boolean;
  className?: string;
}

/**
 * Container component for sprite animations
 * Mounts the CSS-based animation container and manages lifecycle
 */
export function SpriteAnimationContainer({ 
  enabled = true, 
  className = '' 
}: SpriteAnimationContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mountedRef.current) return;

    // Mount the sprite animation service container
    spriteAnimationService.mount(containerRef.current);
    spriteAnimationService.setEnabled(enabled);
    mountedRef.current = true;

    return () => {
      if (mountedRef.current) {
        spriteAnimationService.unmount();
        mountedRef.current = false;
      }
    };
  }, [enabled]);

  useEffect(() => {
    spriteAnimationService.setEnabled(enabled);
  }, [enabled]);

  return (
    <div 
      ref={containerRef}
      className={`sprite-animation-container ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    />
  );
} 