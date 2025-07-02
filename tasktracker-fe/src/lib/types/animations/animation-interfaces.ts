/*
 * Animation Interfaces
 * Enterprise-grade animation interfaces for type safety
 */

import { AnimationQuality, Vector2D, TextAnimationConfig, ParticleConfig, CharacterConfig } from './animations';

/**
 * Base Animation Interface
 */
export interface BaseAnimationInstance {
  id: string;
  destroy(): void;
  setQuality?(quality: AnimationQuality): void;
}

/**
 * Text Animation Instance Interface (matches TextAnimation from engine)
 */
export interface TextAnimationInstance extends BaseAnimationInstance {
  element: HTMLElement;
  config: TextAnimationConfig;
  isPlaying: boolean;
  play(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
}

/**
 * Particle System Instance Interface (matches ParticleSystem from engine)
 */
export interface ParticleSystemInstance extends BaseAnimationInstance {
  config: ParticleConfig;
  particles: HTMLElement[];
  isActive: boolean;
  container: HTMLElement;
  particleCount: number;
  startTime: number;
  duration: number;
  play(): void; // Note: ParticleSystem.play() returns void, not Promise<void>
  stop(): void;
  update(deltaTime: number): void;
}

/**
 * Character Instance Interface (matches Character from engine)
 */
export interface CharacterInstance extends BaseAnimationInstance {
  element: HTMLElement;
  config: CharacterConfig;
  position: Vector2D;
  isAnimating: boolean;
  currentAnimation: string;
  animationStartTime: number;
  type: string;
  play(animation: string): Promise<void>; // Note: Character.play(animation) takes a parameter
  playAnimation(animation: string): Promise<void>;
  moveTo(position: Vector2D, duration: number): Promise<void>;
  update(deltaTime: number): void;
  setPosition(position: Vector2D): void;
}

/**
 * Animation Union Type
 */
export type AnimationInstance = TextAnimationInstance | ParticleSystemInstance | CharacterInstance;

/**
 * Type Guards for Animation Instances
 */
export function isTextAnimation(animation: AnimationInstance): animation is TextAnimationInstance {
  return 'element' in animation && 'isPlaying' in animation && 'pause' in animation && 'resume' in animation;
}

export function isParticleSystem(animation: AnimationInstance): animation is ParticleSystemInstance {
  return 'particles' in animation && 'isActive' in animation && 'particleCount' in animation && 'update' in animation;
}

export function isCharacterInstance(animation: AnimationInstance): animation is CharacterInstance {
  return 'position' in animation && 'isAnimating' in animation && 'playAnimation' in animation && 'moveTo' in animation;
}

/**
 * Animation Event Data
 */
export interface AnimationEventData {
  animationId: string;
  timestamp: number;
  [key: string]: unknown;
} 