/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Animation Manager
 * High-performance, type-safe animation system with enterprise features
 */

import { 
  AnimationConfig, 
  AnimationSequence, 
  TextAnimationConfig,
  ParticleConfig,
  CharacterConfig,
  AnimationMetrics,
  AnimationSystemConfig,
  AnimationEvent,
  AnimationQuality,
  IAnimationManager,
  Vector2D
} from '@/lib/types/animations';

import { TextAnimationEngine } from './engines/TextAnimationEngine';
import { ParticleEngine } from './engines/ParticleEngine';
import { CharacterEngine } from './engines/CharacterEngine';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { AnimationSequencer } from './utils/AnimationSequencer';
import { PredefinedSequences } from './sequences/PredefinedSequences';

/**
 * Enterprise-grade animation manager with comprehensive features
 */
export class EnterpriseAnimationManager implements IAnimationManager {
  private static instance: EnterpriseAnimationManager;
  
  // Core engines
  private textEngine: TextAnimationEngine;
  private particleEngine: ParticleEngine;
  private characterEngine: CharacterEngine;
  private performanceMonitor: PerformanceMonitor;
  private sequencer: AnimationSequencer;
  
  // Configuration and state
  private config: AnimationSystemConfig;
  private container: HTMLElement | null = null;
  private isInitialized = false;
  private animationId = 0;
  private activeAnimations = new Map<string, any>();
  private eventListeners = new Map<string, Function[]>();
  
  // Performance tracking
  private frameRate = 60;
  private lastFrameTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  
  private constructor() {
    this.config = this.getDefaultConfig();
    this.textEngine = new TextAnimationEngine();
    this.particleEngine = new ParticleEngine();
    this.characterEngine = new CharacterEngine();
    this.performanceMonitor = new PerformanceMonitor();
    this.sequencer = new AnimationSequencer();
    
    this.bindMethods();
    this.setupPerformanceTracking();
  }

  public static getInstance(): EnterpriseAnimationManager {
    if (!EnterpriseAnimationManager.instance) {
      EnterpriseAnimationManager.instance = new EnterpriseAnimationManager();
    }
    return EnterpriseAnimationManager.instance;
  }

  /**
   * Initialize the animation system
   */
  public async initialize(config: Partial<AnimationSystemConfig> = {}): Promise<void> {
    this.config = { ...this.config, ...config };
    
    try {
      // Create main container
      await this.createContainer();
      
      // Initialize engines
      await this.textEngine.initialize(this.container!, this.config);
      await this.particleEngine.initialize(this.container!, this.config);
      await this.characterEngine.initialize(this.container!, this.config);
      
      // Setup performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.performanceMonitor.start();
      }
      
      // Setup accessibility
      this.setupAccessibility();
      
      this.isInitialized = true;
      this.emit('system-initialized', { timestamp: Date.now() });
      
      if (this.config.debugMode) {
        console.log('🎮 Enterprise Animation Manager initialized:', this.config);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize animation manager:', error);
      throw error;
    }
  }

  /**
   * Play a single animation or sequence
   */
  public async play(config: AnimationConfig | AnimationSequence): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Animation manager not initialized');
    }

    const animationId = this.generateId();
    
    try {
      if ('animations' in config) {
        // Handle animation sequence
        return await this.playSequence(config, animationId);
      } else {
        // Handle single animation
        return await this.playSingleAnimation(config, animationId);
      }
    } catch (error) {
      this.emit('error', { 
        animationId, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Play text animation
   */
  public async playText(config: TextAnimationConfig): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Animation manager not initialized');
    }

    const animationId = this.generateId();
    
    try {
      const animation = await this.textEngine.createAnimation(config);
      this.activeAnimations.set(animationId, animation);
      
      // Setup callbacks
      animation.onStart = () => {
        this.emit('start', { animationId, type: 'text', timestamp: Date.now() });
        config.onStart?.();
      };
      
      animation.onComplete = () => {
        this.activeAnimations.delete(animationId);
        this.emit('complete', { animationId, type: 'text', timestamp: Date.now() });
        config.onComplete?.();
        
        if (config.autoDestroy !== false) {
          animation.destroy();
        }
      };
      
      await animation.play();
      return animationId;
      
    } catch (error) {
      this.emit('error', { 
        animationId, 
        error: error instanceof Error ? error.message : 'Text animation error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Create particle system
   */
  public async createParticleSystem(config: ParticleConfig): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Animation manager not initialized');
    }

    const systemId = this.generateId();
    
    try {
      const system = await this.particleEngine.createSystem(config);
      this.activeAnimations.set(systemId, system);
      
      this.emit('start', { 
        animationId: systemId, 
        type: 'particle-system', 
        timestamp: Date.now() 
      });
      
      // Auto-cleanup after lifetime
      setTimeout(() => {
        if (this.activeAnimations.has(systemId)) {
          this.stop(systemId);
        }
      }, config.lifetime * 1000);
      
      return systemId;
      
    } catch (error) {
      this.emit('error', { 
        animationId: systemId, 
        error: error instanceof Error ? error.message : 'Particle system error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Create character
   */
  public async createCharacter(config: CharacterConfig): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Animation manager not initialized');
    }

    const characterId = this.generateId();
    
    try {
      const character = await this.characterEngine.createCharacter(config);
      this.activeAnimations.set(characterId, character);
      
      this.emit('start', { 
        animationId: characterId, 
        type: 'character', 
        timestamp: Date.now() 
      });
      
      return characterId;
      
    } catch (error) {
      this.emit('error', { 
        animationId: characterId, 
        error: error instanceof Error ? error.message : 'Character creation error',
        timestamp: Date.now()
      });
      throw error;
    }
  }

  /**
   * Move character to new position
   */
  public async moveCharacter(
    characterId: string, 
    position: Vector2D, 
    duration = 1000
  ): Promise<void> {
    const character = this.activeAnimations.get(characterId);
    if (!character || character.type !== 'character') {
      throw new Error(`Character ${characterId} not found`);
    }

    return this.characterEngine.moveCharacter(character, position, duration);
  }

  /**
   * Pause animation
   */
  public pause(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation && animation.pause) {
      animation.pause();
      this.emit('pause', { animationId, timestamp: Date.now() });
    }
  }

  /**
   * Resume animation
   */
  public resume(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation && animation.resume) {
      animation.resume();
      this.emit('resume', { animationId, timestamp: Date.now() });
    }
  }

  /**
   * Stop specific animation
   */
  public stop(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      if (animation.stop) {
        animation.stop();
      }
      if (animation.destroy) {
        animation.destroy();
      }
      
      this.activeAnimations.delete(animationId);
      this.emit('stop', { animationId, timestamp: Date.now() });
    }
  }

  /**
   * Stop all animations
   */
  public stopAll(): void {
    const animationIds = Array.from(this.activeAnimations.keys());
    animationIds.forEach(id => this.stop(id));
    
    this.emit('stop-all', { 
      count: animationIds.length, 
      timestamp: Date.now() 
    });
  }

  /**
   * Get active animation IDs
   */
  public getActiveAnimations(): string[] {
    return Array.from(this.activeAnimations.keys());
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): AnimationMetrics {
    const baseMetrics = this.performanceMonitor.getMetrics();
    
    return {
      ...baseMetrics,
      frameRate: this.frameRate,
      averageFrameTime: this.lastFrameTime,
      droppedFrames: this.droppedFrames,
      activeAnimations: this.activeAnimations.size,
      queuedAnimations: this.sequencer.getQueueSize(),
      smoothnessScore: this.calculateSmoothnessScore(),
      responsiveness: this.calculateResponsiveness(),
      batteryImpact: this.calculateBatteryImpact()
    };
  }

  /**
   * Set animation quality
   */
  public setQuality(quality: AnimationQuality): void {
    this.config.qualityLevel = quality;
    
    // Update engines
    this.textEngine.setQuality(quality);
    this.particleEngine.setQuality(quality);
    this.characterEngine.setQuality(quality);
    
    this.emit('quality-changed', { quality, timestamp: Date.now() });
  }

  /**
   * Preload animation sequence
   */
  public async preloadSequence(sequence: AnimationSequence): Promise<void> {
    if (!this.config.enablePreloading) {
      return;
    }

    try {
      // Preload text animations
      for (const anim of sequence.animations) {
        if ('text' in anim) {
          await this.textEngine.preload(anim as TextAnimationConfig);
        }
      }
      
      // Preload particle systems
      if (sequence.particles) {
        for (const particle of sequence.particles) {
          await this.particleEngine.preload(particle);
        }
      }
      
      // Preload characters
      if (sequence.characters) {
        for (const character of sequence.characters) {
          await this.characterEngine.preload(character);
        }
      }
      
      this.emit('sequence-preloaded', { 
        sequenceId: sequence.id, 
        timestamp: Date.now() 
      });
      
    } catch (error) {
      this.emit('error', { 
        error: `Failed to preload sequence: ${error}`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Event system
   */
  public on(event: string, callback: (event: AnimationEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: (event: AnimationEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Destroy the animation system
   */
  public destroy(): void {
    // Stop all animations
    this.stopAll();
    
    // Destroy engines
    this.textEngine.destroy();
    this.particleEngine.destroy();
    this.characterEngine.destroy();
    this.performanceMonitor.destroy();
    
    // Clean up container
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Clear state
    this.activeAnimations.clear();
    this.eventListeners.clear();
    this.isInitialized = false;
    
    this.emit('system-destroyed', { timestamp: Date.now() });
  }

  // Private methods

  private async createContainer(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'enterprise-animation-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;

    document.body.appendChild(this.container);
  }

  private async playSingleAnimation(
    config: AnimationConfig, 
    animationId: string
  ): Promise<string> {
    // Route to appropriate engine based on animation type
    let animation: any;
    
    if (config.type.startsWith('text-')) {
      animation = await this.textEngine.createAnimation(config as any);
    } else if (config.type.includes('particle') || config.type.includes('confetti')) {
      animation = await this.particleEngine.createFromConfig(config);
    } else {
      animation = await this.characterEngine.createFromConfig(config);
    }
    
    this.activeAnimations.set(animationId, animation);
    
    // Setup callbacks
    animation.onStart = () => {
      this.emit('start', { animationId, type: config.type, timestamp: Date.now() });
      config.onStart?.();
    };
    
    animation.onComplete = () => {
      this.activeAnimations.delete(animationId);
      this.emit('complete', { animationId, type: config.type, timestamp: Date.now() });
      config.onComplete?.();
      
      if (config.autoDestroy !== false) {
        animation.destroy();
      }
    };
    
    await animation.play();
    return animationId;
  }

  private async playSequence(
    sequence: AnimationSequence, 
    sequenceId: string
  ): Promise<string> {
    return this.sequencer.playSequence(sequence, {
      onAnimationStart: (animId, type) => {
        this.emit('start', { animationId: animId, type, timestamp: Date.now() });
      },
      onAnimationComplete: (animId, type) => {
        this.emit('complete', { animationId: animId, type, timestamp: Date.now() });
      },
      onSequenceComplete: () => {
        this.emit('sequence-complete', { 
          sequenceId, 
          timestamp: Date.now() 
        });
      }
    });
  }

  private generateId(): string {
    return `anim_${++this.animationId}_${Date.now()}`;
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const animationEvent: AnimationEvent = {
        type: event as any,
        animationId: data.animationId || 'system',
        timestamp: data.timestamp || Date.now(),
        data,
        metrics: this.config.enablePerformanceMonitoring ? this.getMetrics() : undefined
      };
      
      listeners.forEach(callback => {
        try {
          callback(animationEvent);
        } catch (error) {
          console.error('Animation event callback error:', error);
        }
      });
    }
    
    if (this.config.logAnimationEvents) {
      console.log(`🎮 Animation Event [${event}]:`, data);
    }
  }

  private bindMethods(): void {
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.stop = this.stop.bind(this);
    this.stopAll = this.stopAll.bind(this);
  }

  private setupPerformanceTracking(): void {
    if (typeof window === 'undefined') return;

    const trackFrame = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const deltaTime = timestamp - this.lastFrameTime;
        const currentFps = 1000 / deltaTime;
        
        // Update frame rate (smoothed)
        this.frameRate = this.frameRate * 0.9 + currentFps * 0.1;
        
        // Track dropped frames
        if (deltaTime > (1000 / this.config.targetFrameRate) * 1.5) {
          this.droppedFrames++;
        }
        
        this.frameCount++;
        
        // Performance warnings
        if (this.frameRate < this.config.targetFrameRate * 0.8) {
          this.emit('performance-warning', {
            type: 'low-framerate',
            frameRate: this.frameRate,
            target: this.config.targetFrameRate,
            timestamp
          });
        }
      }
      
      this.lastFrameTime = timestamp;
      
      if (this.isInitialized) {
        requestAnimationFrame(trackFrame);
      }
    };

    requestAnimationFrame(trackFrame);
  }

  private setupAccessibility(): void {
    if (this.config.respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        this.setQuality('low');
      }
      
      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          this.setQuality('low');
        }
      });
    }
  }

  private calculateSmoothnessScore(): number {
    const targetFps = this.config.targetFrameRate;
    const actualFps = this.frameRate;
    const score = Math.min(100, (actualFps / targetFps) * 100);
    return Math.round(score);
  }

  private calculateResponsiveness(): number {
    // Based on frame consistency and dropped frames
    const consistency = Math.max(0, 100 - (this.droppedFrames / this.frameCount) * 100);
    return Math.round(consistency);
  }

  private calculateBatteryImpact(): 'low' | 'medium' | 'high' {
    const activeCount = this.activeAnimations.size;
    const quality = this.config.qualityLevel;
    
    if (activeCount > 10 || quality === 'ultra') return 'high';
    if (activeCount > 5 || quality === 'high') return 'medium';
    return 'low';
  }

  private getDefaultConfig(): AnimationSystemConfig {
    return {
      maxConcurrentAnimations: 20,
      targetFrameRate: 60,
      qualityLevel: 'high',
      enablePerformanceMonitoring: true,
      respectReducedMotion: true,
      enableHighContrast: false,
      enableAudioDescriptions: false,
      enableAnalytics: true,
      enableCaching: true,
      enablePreloading: true,
      enableFallbacks: true,
      debugMode: false,
      showPerformanceOverlay: false,
      logAnimationEvents: false
    };
  }
}

// Export singleton instance
export const enterpriseAnimationManager = EnterpriseAnimationManager.getInstance(); 