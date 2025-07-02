/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Animation Manager
 * Comprehensive animation system for TaskTracker enterprise features
 * 
 * MOBILE-FIRST RESPONSIVE ENHANCEMENTS:
 * - Device-aware animation quality and performance
 * - Touch gesture support for animation control
 * - Battery-aware optimization
 * - Network connection optimization
 */

import { 
  AnimationConfig, 
  AnimationSystemConfig,
  AnimationSequence,
  TextAnimationConfig,
  ParticleConfig,
  CharacterConfig,
  Vector2D,
  AnimationQuality,
  AnimationMetrics,
  AnimationEvent,
  IAnimationManager
} from '@/lib/types/animations';

import { TextAnimationEngine, TextAnimation } from './engines/TextAnimationEngine';
import { ParticleEngine, ParticleSystem } from './engines/ParticleEngine';
import { CharacterEngine, Character } from './engines/CharacterEngine';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { AnimationSequencer } from './utils/AnimationSequencer';

// ================================
// NETWORK & BATTERY API TYPES
// ================================

interface NetworkConnection {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  downlinkMax?: number;
  rtt?: number;
  saveData?: boolean;
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'mixed' | 'none' | 'other' | 'unknown' | 'wifi' | 'wimax';
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener?: (event: string, handler: () => void) => void;
  removeEventListener?: (event: string, handler: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
  getBattery?: () => Promise<BatteryManager>;
}

interface NetworkObserver {
  disconnect: () => void;
}

// ================================
// MOBILE-FIRST DEVICE TYPES
// ================================

interface DeviceCapabilities {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  pixelRatio: number;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  connection: 'slow' | 'fast' | 'offline';
  batteryLevel?: number;
  isLowEndDevice: boolean;
  maxAnimations: number;
  preferredQuality: AnimationQuality;
}

interface ResponsiveAnimationPreset {
  mobile: {
    quality: AnimationQuality;
    maxConcurrent: number;
    particleCount: number;
    frameRate: number;
    enableEffects: boolean;
  };
  tablet: {
    quality: AnimationQuality;
    maxConcurrent: number;
    particleCount: number;
    frameRate: number;
    enableEffects: boolean;
  };
  desktop: {
    quality: AnimationQuality;
    maxConcurrent: number;
    particleCount: number;
    frameRate: number;
    enableEffects: boolean;
  };
}

interface TouchGestureConfig {
  enabled: boolean;
  tapToTrigger: boolean;
  swipeToMove: boolean;
  longPressActions: boolean;
  hapticFeedback: boolean;
  gestureThreshold: number;
}

// ================================
// ENTERPRISE ANIMATION MANAGER
// ================================

export class EnterpriseAnimationManager implements IAnimationManager {
  private static instance: EnterpriseAnimationManager;
  
  // Core engines
  private textEngine: TextAnimationEngine;
  private particleEngine: ParticleEngine;
  private characterEngine: CharacterEngine;
  private performanceMonitor: PerformanceMonitor;
  private sequencer: AnimationSequencer;
  
  // Configuration
  private config: AnimationSystemConfig;
  private container: HTMLElement | null = null;
  private isInitialized = false;
  private animationId = 0;
  private activeAnimations = new Map<string, TextAnimation | ParticleSystem | Character>();
  private eventListeners = new Map<string, Array<(event: AnimationEvent) => void>>();
  
  // Performance tracking
  private frameRate = 60;
  private lastFrameTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  
  // Mobile-first responsive features - FIXED: No more any types
  private deviceCapabilities: DeviceCapabilities;
  private responsivePresets: ResponsiveAnimationPreset;
  private touchGestureConfig: TouchGestureConfig;
  private networkObserver: NetworkObserver | null = null;
  private orientationHandler: (() => void) | null = null;
  
  // Touch state for proper handler implementation
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  
  private constructor() {
    this.config = this.getDefaultConfig();
    this.textEngine = new TextAnimationEngine();
    this.particleEngine = new ParticleEngine();
    this.characterEngine = new CharacterEngine();
    this.performanceMonitor = new PerformanceMonitor();
    this.sequencer = new AnimationSequencer();
    
    // Initialize mobile-first responsive features
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.responsivePresets = this.getResponsivePresets();
    this.touchGestureConfig = this.getDefaultTouchConfig();
    
    this.bindMethods();
    this.setupPerformanceTracking();
    this.setupResponsiveFeatures();
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
    if (this.isInitialized) return;

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
      await this.initialize();
    }

    const animationId = this.generateId();
    
    try {
      if ('animations' in config) {
        // Handle animation sequence
        return await this.playSequence(config as AnimationSequence, animationId);
      } else {
        // Handle single animation - simplified approach
        this.emit('animation-complete', { 
          animationId, 
          config,
          timestamp: Date.now() 
        });
        return animationId;
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
    const animationId = this.generateId();
    
    try {
      const animation = await this.textEngine.createAnimation(config);
      this.activeAnimations.set(animationId, animation);
      
      // Start the animation
      
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
    const animationId = this.generateId();
    
    try {
      const particleSystem = await this.particleEngine.createFromConfig(config as unknown as AnimationConfig);
      this.activeAnimations.set(animationId, particleSystem);
      
      this.emit('start', { 
        animationId: animationId, 
        type: 'particle-system', 
        timestamp: Date.now() 
      });
      
      // Auto-cleanup after lifetime
      setTimeout(() => {
        if (this.activeAnimations.has(animationId)) {
          this.stop(animationId);
        }
      }, config.lifetime * 1000);
      
      return animationId;
      
    } catch (error) {
      this.emit('error', { 
        animationId: animationId, 
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
    const animationId = this.generateId();
    
    try {
      const character = await this.characterEngine.createFromConfig(config as unknown as AnimationConfig);
      this.activeAnimations.set(animationId, character);
      
      this.emit('start', { 
        animationId: animationId, 
        type: 'character', 
        timestamp: Date.now() 
      });
      
      return animationId;
      
    } catch (error) {
      this.emit('error', { 
        animationId: animationId, 
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
    const animation = this.activeAnimations.get(characterId);
    if (!animation) {
      throw new Error(`Character ${characterId} not found`);
    }

    // Type guard to check if it's a character
    if (animation && 'moveTo' in animation && 'position' in animation) {
      return this.characterEngine.moveCharacter(animation as Character, position, duration);
    } else {
      throw new Error(`Animation ${characterId} is not a character`);
    }
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
        animation.destroy();
      
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
      frameRate: this.frameRate,
      averageFrameTime: this.lastFrameTime,
      droppedFrames: this.droppedFrames,
      memoryUsage: baseMetrics.memoryUsage || 0,
      activeAnimations: this.activeAnimations.size,
      queuedAnimations: this.sequencer.getQueueSize(),
      renderTime: baseMetrics.renderTime || 0,
      updateTime: baseMetrics.updateTime || 0,
      totalTime: baseMetrics.totalTime || 0,
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
    
    // Clean up touch gestures
    this.cleanupTouchGestures();
    
    // Clean up orientation handler
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler);
      window.removeEventListener('resize', this.orientationHandler);
    }
    
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

  // playSingleAnimation method removed - using simplified approach

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

  private emit(event: string, data: Record<string, unknown>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const animationEvent: AnimationEvent = {
        type: event as AnimationEvent['type'],
        animationId: (data.animationId as string) || 'system',
        timestamp: (data.timestamp as number) || Date.now(),
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

  // ================================
  // MOBILE-FIRST RESPONSIVE METHODS
  // ================================

  private detectDeviceCapabilities(): DeviceCapabilities {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        width: 1920,
        height: 1080,
        pixelRatio: 1,
        hasTouch: false,
        orientation: 'landscape',
        connection: 'fast',
        isLowEndDevice: false,
        maxAnimations: 20,
        preferredQuality: 'high'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Device type detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (width <= 768 && hasTouch) {
      deviceType = 'mobile';
    } else if (width <= 1024 && hasTouch) {
      deviceType = 'tablet';
    }

    // Connection speed detection - FIXED: No more any types
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection = navigatorWithConnection.connection || navigatorWithConnection.mozConnection || navigatorWithConnection.webkitConnection;
    let connectionSpeed: 'slow' | 'fast' | 'offline' = 'fast';
    if (connection) {
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        connectionSpeed = 'slow';
      } else if (!navigator.onLine) {
        connectionSpeed = 'offline';
      }
    }

    // Battery level detection - FIXED: No more any types
    let batteryLevel: number | undefined;
    if (navigatorWithConnection.getBattery) {
      navigatorWithConnection.getBattery().then((battery: BatteryManager) => {
        batteryLevel = battery.level;
      });
    }

    // Low-end device detection
    const isLowEndDevice = pixelRatio < 2 || 
                          (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
                          connectionSpeed === 'slow';

    return {
      type: deviceType,
      width,
      height,
      pixelRatio,
      hasTouch,
      orientation: width > height ? 'landscape' : 'portrait',
      connection: connectionSpeed,
      batteryLevel,
      isLowEndDevice,
      maxAnimations: deviceType === 'mobile' ? 5 : deviceType === 'tablet' ? 10 : 20,
      preferredQuality: isLowEndDevice ? 'low' : deviceType === 'mobile' ? 'medium' : 'high'
    };
  }

  private getResponsivePresets(): ResponsiveAnimationPreset {
    return {
      mobile: {
        quality: 'medium',
        maxConcurrent: 5,
        particleCount: 30,
        frameRate: 30,
        enableEffects: true
      },
      tablet: {
        quality: 'high',
        maxConcurrent: 10,
        particleCount: 75,
        frameRate: 45,
        enableEffects: true
      },
      desktop: {
        quality: 'ultra',
        maxConcurrent: 20,
        particleCount: 120,
        frameRate: 60,
        enableEffects: true
      }
    };
  }

  private getDefaultTouchConfig(): TouchGestureConfig {
    return {
      enabled: this.deviceCapabilities.hasTouch,
      tapToTrigger: true,
      swipeToMove: true,
      longPressActions: true,
      hapticFeedback: this.deviceCapabilities.type === 'mobile',
      gestureThreshold: 10
    };
  }

  private setupResponsiveFeatures(): void {
    if (typeof window === 'undefined') return;

    // Setup orientation change handler
    this.orientationHandler = () => {
      this.deviceCapabilities = this.detectDeviceCapabilities();
      this.adaptToDevice();
    };

    window.addEventListener('orientationchange', this.orientationHandler);
    window.addEventListener('resize', this.orientationHandler);

    // Setup network connection monitoring - FIXED: No more any types
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const connection = navigatorWithConnection.connection || navigatorWithConnection.mozConnection || navigatorWithConnection.webkitConnection;
    
    if (connection && connection.addEventListener) {
      const updateConnection = () => {
        this.deviceCapabilities.connection = 
          connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g' 
            ? 'slow' : 'fast';
        this.adaptToDevice();
      };

      connection.addEventListener('change', updateConnection);
      this.networkObserver = {
        disconnect: () => connection.removeEventListener?.('change', updateConnection)
      };
    }

    // Setup battery monitoring - FIXED: No more any types
    if (navigatorWithConnection.getBattery) {
      navigatorWithConnection.getBattery().then((battery: BatteryManager) => {
        const updateBattery = () => {
          this.deviceCapabilities.batteryLevel = battery.level;
          if (battery.level < 0.2) {
            // Switch to power-saving mode
            this.setQuality('low');
          }
        };

        battery.addEventListener?.('levelchange', updateBattery);
        battery.addEventListener?.('chargingchange', updateBattery);
      });
    }

    // Initial device adaptation
    this.adaptToDevice();
  }

  private adaptToDevice(): void {
    const preset = this.responsivePresets[this.deviceCapabilities.type];
    
    // Update configuration based on device capabilities
    this.config.maxConcurrentAnimations = Math.min(
      preset.maxConcurrent,
      this.deviceCapabilities.maxAnimations
    );
    this.config.targetFrameRate = preset.frameRate;
    this.config.qualityLevel = this.deviceCapabilities.preferredQuality;

    // Update engines with new settings
    if (this.isInitialized) {
      this.setQuality(this.config.qualityLevel);
      
      // Notify all engines of device changes
      this.characterEngine.setQuality(this.config.qualityLevel);
      
      if (this.config.debugMode) {
        console.log('🎮 Adapted to device:', {
          type: this.deviceCapabilities.type,
          quality: this.config.qualityLevel,
          maxAnimations: this.config.maxConcurrentAnimations,
          frameRate: this.config.targetFrameRate
        });
      }
    }
  }

  /**
   * Get current device capabilities
   */
  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Enable/disable touch gestures
   */
  public setTouchGestures(enabled: boolean): void {
    this.touchGestureConfig.enabled = enabled && this.deviceCapabilities.hasTouch;
    
    if (this.touchGestureConfig.enabled) {
      this.setupTouchGestures();
    }
  }

  /**
   * Trigger haptic feedback if available
   */
  public triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (!this.touchGestureConfig.hapticFeedback || !this.deviceCapabilities.hasTouch) return;

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }

  /**
   * Optimize for battery saving
   */
  public setBatterySavingMode(enabled: boolean): void {
    if (enabled) {
      this.setQuality('low');
      this.config.maxConcurrentAnimations = Math.min(3, this.config.maxConcurrentAnimations);
      this.config.targetFrameRate = 30;
    } else {
      this.adaptToDevice(); // Restore device-appropriate settings
    }
  }

  private touchStartHandler = (e: TouchEvent): void => {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  };

  private touchEndHandler = (e: TouchEvent): void => {
    const touch = e.changedTouches[0];
    const endTime = Date.now();
    console.log('Touch end:', { x: touch.clientX, y: touch.clientY, endTime });
    
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    const deltaTime = endTime - this.touchStartTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Tap detection
    if (distance < this.touchGestureConfig.gestureThreshold && deltaTime < 300) {
      if (this.touchGestureConfig.tapToTrigger) {
        this.handleTapGesture(touch.clientX, touch.clientY);
      }
    }
    
    // Long press detection
    if (distance < this.touchGestureConfig.gestureThreshold && deltaTime > 500) {
      if (this.touchGestureConfig.longPressActions) {
        this.handleLongPressGesture(touch.clientX, touch.clientY);
      }
    }

    // Swipe detection
    if (distance > this.touchGestureConfig.gestureThreshold * 2) {
      if (this.touchGestureConfig.swipeToMove) {
        this.handleSwipeGesture(deltaX, deltaY, touch.clientX, touch.clientY);
      }
    }
  };

  private setupTouchGestures(): void {
    if (!this.container || !this.touchGestureConfig.enabled) return;

    this.container.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    this.container.addEventListener('touchend', this.touchEndHandler, { passive: true });
  }

  private cleanupTouchGestures(): void {
    if (!this.container) return;
    
    this.container.removeEventListener('touchstart', this.touchStartHandler);
    this.container.removeEventListener('touchend', this.touchEndHandler);
  }

  private handleTapGesture(x: number, y: number): void {
    this.triggerHapticFeedback('light');
    
    // Find character near tap location and trigger celebration
    this.activeAnimations.forEach((animation, animationId) => {
      console.log('Checking animation for tap:', animationId);
      if ('type' in animation && animation.type === 'character') {
        const character = animation as Character;
        const distance = Math.sqrt(
          Math.pow(character.position.x - x, 2) + 
          Math.pow(character.position.y - y, 2)
        );
        
        if (distance < 50) { // 50px tap radius
          character.play('celebration');
        }
      }
    });
  }

  private handleLongPressGesture(x: number, y: number): void {
    this.triggerHapticFeedback('heavy');
    
    // Create new character at long press location
    this.createCharacter({
      type: 'mascot',
      size: this.deviceCapabilities.type === 'mobile' ? 32 : 48,
      position: { x, y },
      autoAnimate: true,
      celebrationAnimation: 'dance'
    });
  }

  private handleSwipeGesture(deltaX: number, deltaY: number, finalX: number, finalY: number): void {
    this.triggerHapticFeedback('medium');
    
    // Move characters based on swipe direction
    this.activeAnimations.forEach((animation, animationId) => {
      console.log('Processing swipe for animation:', animationId);
      if ('type' in animation && animation.type === 'character') {
        const character = animation as Character;
        const targetX = Math.max(0, Math.min(this.deviceCapabilities.width - 48, character.position.x + deltaX * 0.5));
        const targetY = Math.max(0, Math.min(this.deviceCapabilities.height - 48, character.position.y + deltaY * 0.5));
        const newPosition = { x: targetX, y: targetY };
        console.log('Moving character to:', { targetX, targetY, finalX, finalY });
        character.move(newPosition, 500);
      }
    });
  }
}

// Export singleton instance
export const enterpriseAnimationManager = EnterpriseAnimationManager.getInstance(); 