/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Celebration Component Interfaces
 * Following .cursorrules - NO interfaces allowed in component files
 */

// ================================
// RESPONSIVE CONFETTI CONFIGURATION
// ================================

export interface ResponsiveConfettiConfig {
  mobile: {
    particleCount: number;
    spread: number;
    startVelocity: number;
    decay: number;
    gravity: number;
    colors: string[];
  };
  tablet: {
    particleCount: number;
    spread: number;
    startVelocity: number;
    decay: number;
    gravity: number;
    colors: string[];
  };
  desktop: {
    particleCount: number;
    spread: number;
    startVelocity: number;
    decay: number;
    gravity: number;
    colors: string[];
  };
}

// ================================
// CELEBRATION CARD GESTURE HANDLING
// ================================

export interface CelebrationCardGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  velocity: number;
} 