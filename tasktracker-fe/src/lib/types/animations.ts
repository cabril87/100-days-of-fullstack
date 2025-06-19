/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Animation System - Type Definitions
 * Comprehensive TypeScript types for sprite animations, text effects, and enterprise features
 */

/**
 * Core animation types supported by the enterprise system
 */
export type AnimationType = 
  // Achievement & Gamification
  | 'achievement-unlock'
  | 'achievement-progress'
  | 'badge-earned'
  | 'level-up'
  | 'level-progress'
  | 'streak-milestone'
  | 'points-earned'
  | 'xp-gained'
  | 'rank-promotion'
  
  // Task & Productivity
  | 'task-complete'
  | 'task-assigned'
  | 'task-overdue'
  | 'subtask-complete'
  | 'project-complete'
  | 'deadline-warning'
  
  // Family & Collaboration
  | 'family-notification'
  | 'member-joined'
  | 'collaboration-success'
  | 'team-achievement'
  | 'family-milestone'
  
  // Visual Effects
  | 'star-burst'
  | 'confetti-explosion'
  | 'particle-trail'
  | 'energy-wave'
  | 'celebration-fireworks'
  | 'success-ripple'
  | 'error-shake'
  | 'warning-pulse'
  
  // Text & UI Effects
  | 'text-typewriter'
  | 'text-reveal'
  | 'text-highlight'
  | 'text-counter'
  | 'ui-slide-in'
  | 'ui-fade-in'
  | 'ui-bounce-in'
  | 'ui-scale-in';

/**
 * Character types for sprite animations
 */
export type CharacterType = 
  | 'hero'
  | 'family'
  | 'child'
  | 'teen'
  | 'adult'
  | 'parent'
  | 'grandparent'
  | 'pet'
  | 'mascot'
  | 'robot'
  | 'avatar';

/**
 * Animation timing and easing options
 */
export type AnimationEasing = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | 'back'
  | 'spring'
  | 'custom';

/**
 * Animation quality levels for performance optimization
 */
export type AnimationQuality = 
  | 'low'      // Reduced particles, simple effects
  | 'medium'   // Standard quality
  | 'high'     // Full effects, maximum particles
  | 'ultra';   // Enterprise-grade with advanced effects

/**
 * Text animation styles
 */
export type TextAnimationStyle = 
  | 'typewriter'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale-in'
  | 'bounce-in'
  | 'flip-in'
  | 'rotate-in'
  | 'highlight'
  | 'glow'
  | 'rainbow'
  | 'gradient'
  | 'counter';

/**
 * Particle system types
 */
export type ParticleType = 
  | 'confetti'
  | 'stars'
  | 'hearts'
  | 'sparkles'
  | 'fireworks'
  | 'bubbles'
  | 'snowflakes'
  | 'leaves'
  | 'energy'
  | 'magic'
  | 'celebration'
  | 'success'
  | 'warning'
  | 'error';

/**
 * 2D Vector for positions and velocities
 */
export interface Vector2D {
  x: number;
  y: number;
}

/**
 * Color configuration with multiple formats
 */
export interface ColorConfig {
  hex?: string;
  rgb?: { r: number; g: number; b: number };
  hsl?: { h: number; s: number; l: number };
  name?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
}

/**
 * Comprehensive animation configuration
 */
export interface AnimationConfig {
  // Core properties
  type: AnimationType;
  duration: number;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  easing?: AnimationEasing | string;
  
  // Positioning
  position: Vector2D;
  offset?: Vector2D;
  anchor?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  // Visual properties
  scale?: number | { start: number; end: number };
  rotation?: number | { start: number; end: number };
  opacity?: number | { start: number; end: number };
  color?: ColorConfig;
  
  // Advanced properties
  quality?: AnimationQuality;
  autoDestroy?: boolean;
  zIndex?: number;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
  
  // Callbacks
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: () => void;
  onDestroy?: () => void;
}

/**
 * Text animation specific configuration
 */
export interface TextAnimationConfig extends Omit<AnimationConfig, 'type'> {
  type: TextAnimationStyle;
  text: string;
  fontSize?: number | string;
  fontFamily?: string;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  
  // Text-specific effects
  typewriterSpeed?: number; // characters per second
  highlightColor?: ColorConfig;
  glowIntensity?: number;
  shadowConfig?: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
}

/**
 * Particle system configuration
 */
export interface ParticleConfig {
  type: ParticleType;
  count: number;
  lifetime: number;
  
  // Emission properties
  emissionRate?: number;
  emissionShape?: 'point' | 'circle' | 'rectangle' | 'line';
  emissionArea?: Vector2D;
  
  // Physics properties
  velocity: {
    initial: Vector2D;
    variation: Vector2D;
  };
  acceleration?: Vector2D;
  gravity?: number;
  friction?: number;
  
  // Visual properties
  size: {
    start: number;
    end: number;
    variation?: number;
  };
  color: {
    start: ColorConfig;
    end?: ColorConfig;
    variation?: boolean;
  };
  
  // Advanced properties
  rotation?: {
    initial: number;
    velocity: number;
    variation?: number;
  };
  texture?: string | HTMLCanvasElement;
  blendMode?: string;
}

/**
 * Character sprite configuration
 */
export interface CharacterConfig {
  type: CharacterType;
  size: number;
  position: Vector2D;
  
  // Animation properties
  idleAnimation?: string;
  celebrationAnimation?: string;
  movementSpeed?: number;
  
  // Visual customization
  color?: ColorConfig;
  outfit?: string;
  accessories?: string[];
  expression?: 'happy' | 'excited' | 'focused' | 'surprised' | 'proud';
  
  // Behavior
  autoAnimate?: boolean;
  interactionRadius?: number;
  followMouse?: boolean;
}

/**
 * Enterprise animation sequence for complex effects
 */
export interface AnimationSequence {
  id: string;
  name: string;
  description?: string;
  
  // Sequence properties
  animations: (AnimationConfig | TextAnimationConfig)[];
  characters?: CharacterConfig[];
  particles?: ParticleConfig[];
  
  // Timing
  totalDuration: number;
  simultaneousAnimations?: boolean;
  
  // Enterprise features
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: 'achievement' | 'task' | 'family' | 'system' | 'celebration';
  ageAppropriate?: boolean;
  accessibilityCompliant?: boolean;
  
  // Performance
  maxConcurrent?: number;
  qualityFallback?: AnimationQuality;
  
  // Metadata
  version: string;
  author?: string;
  tags?: string[];
  createdAt?: Date;
  lastModified?: Date;
}

/**
 * Animation performance metrics
 */
export interface AnimationMetrics {
  frameRate: number;
  averageFrameTime: number;
  droppedFrames: number;
  memoryUsage: number;
  activeAnimations: number;
  queuedAnimations: number;
  
  // Quality metrics
  renderTime: number;
  updateTime: number;
  totalTime: number;
  
  // User experience metrics
  smoothnessScore: number; // 0-100
  responsiveness: number;  // 0-100
  batteryImpact: 'low' | 'medium' | 'high';
}

/**
 * Animation system configuration
 */
export interface AnimationSystemConfig {
  // Performance settings
  maxConcurrentAnimations: number;
  targetFrameRate: number;
  qualityLevel: AnimationQuality;
  enablePerformanceMonitoring: boolean;
  
  // Accessibility
  respectReducedMotion: boolean;
  enableHighContrast: boolean;
  enableAudioDescriptions: boolean;
  
  // Enterprise features
  enableAnalytics: boolean;
  enableCaching: boolean;
  enablePreloading: boolean;
  enableFallbacks: boolean;
  
  // Development
  debugMode: boolean;
  showPerformanceOverlay: boolean;
  logAnimationEvents: boolean;
}

/**
 * Animation event types for enterprise monitoring
 */
export interface AnimationEvent {
  type: 'start' | 'update' | 'complete' | 'error' | 'performance-warning';
  animationId: string;
  timestamp: number;
  data?: any;
  metrics?: Partial<AnimationMetrics>;
}

/**
 * Enterprise animation manager interface
 */
export interface IAnimationManager {
  // Core methods
  play(config: AnimationConfig | AnimationSequence): Promise<string>;
  pause(animationId: string): void;
  resume(animationId: string): void;
  stop(animationId: string): void;
  stopAll(): void;
  
  // Text animations
  playText(config: TextAnimationConfig): Promise<string>;
  
  // Particle systems
  createParticleSystem(config: ParticleConfig): Promise<string>;
  
  // Character animations
  createCharacter(config: CharacterConfig): Promise<string>;
  moveCharacter(characterId: string, position: Vector2D, duration?: number): Promise<void>;
  
  // Management
  getActiveAnimations(): string[];
  getMetrics(): AnimationMetrics;
  setQuality(quality: AnimationQuality): void;
  preloadSequence(sequence: AnimationSequence): Promise<void>;
  
  // Events
  on(event: string, callback: (event: AnimationEvent) => void): void;
  off(event: string, callback: (event: AnimationEvent) => void): void;
  
  // Lifecycle
  initialize(config: AnimationSystemConfig): Promise<void>;
  destroy(): void;
}

/**
 * Predefined animation sequences for common enterprise scenarios
 */
export interface PredefinedSequences {
  ACHIEVEMENT_UNLOCK: AnimationSequence;
  LEVEL_UP_CELEBRATION: AnimationSequence;
  TASK_COMPLETION: AnimationSequence;
  FAMILY_MILESTONE: AnimationSequence;
  PROJECT_SUCCESS: AnimationSequence;
  WELCOME_NEW_USER: AnimationSequence;
  STREAK_MILESTONE: AnimationSequence;
  BADGE_COLLECTION: AnimationSequence;
  LEADERBOARD_CLIMB: AnimationSequence;
  COLLABORATION_WIN: AnimationSequence;
}

/**
 * Export all types for easy importing
 */
export type {
  AnimationType,
  CharacterType,
  AnimationEasing,
  AnimationQuality,
  TextAnimationStyle,
  ParticleType,
  Vector2D,
  ColorConfig,
  AnimationConfig,
  TextAnimationConfig,
  ParticleConfig,
  CharacterConfig,
  AnimationSequence,
  AnimationMetrics,
  AnimationSystemConfig,
  AnimationEvent,
  IAnimationManager,
  PredefinedSequences
}; 