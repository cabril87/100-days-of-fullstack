/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Sprite Animation Service
 * High-performance, enterprise-grade sprite animations with smooth effects
 */

interface PerformanceWithMemory extends Performance {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Comprehensive animation types for enterprise use
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
  
  // Character Actions
  | 'character-celebration'
  | 'character-dance'
  | 'character-wave'
  | 'character-jump'
  | 'character-spin'
  
  // New Enhanced Animations
  | 'explosive-achievement'
  | 'mega-combo'
  | 'rainbow-celebration'
  | 'power-surge'
  | 'diamond-shower'
  | 'cosmic-explosion'
  | 'fire-explosion'
  | 'ice-crystal';

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
 * Animation quality levels
 */
export type AnimationQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  type: AnimationType;
  position: { x: number; y: number };
  duration?: number;
  intensity?: number;
  quality?: AnimationQuality;
  character?: CharacterType;
  text?: string;
  color?: string;
  size?: number;
  particles?: number;
  delay?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

/**
 * Text animation configuration
 */
export interface TextAnimationConfig {
  text: string;
  position: { x: number; y: number };
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  animation?: 'fade-in' | 'slide-up' | 'bounce-in' | 'typewriter' | 'glow' | 'rainbow';
  duration?: number;
  delay?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

/**
 * Performance metrics
 */
export interface AnimationMetrics {
  activeAnimations: number;
  totalAnimationsPlayed: number;
  averageFrameRate: number;
  memoryUsage: number;
  droppedFrames: number;
  smoothnessScore: number;
}

/**
 * Enterprise-grade CSS-based sprite animation service
 * High-performance animations with comprehensive features and monitoring
 */
class EnterpriseAnimationService {
  private static instance: EnterpriseAnimationService;
  private container: HTMLElement | null = null;
  private enabled = true;
  private quality: AnimationQuality = 'high';
  
  // Performance tracking
  private activeAnimations = new Set<string>();
  private totalAnimationsPlayed = 0;
  private frameRate = 60;
  private droppedFrames = 0;
  private memoryUsage = 0;
  private lastFrameTime = 0;
  private animationId = 0;
  
  // Event listeners
  private eventListeners = new Map<string, Array<(data: Record<string, unknown>) => void>>();
  
  // Quality settings
  private qualitySettings = {
    low: { particles: 0.3, duration: 0.7, effects: false },
    medium: { particles: 0.6, duration: 0.85, effects: true },
    high: { particles: 1.0, duration: 1.0, effects: true },
    ultra: { particles: 1.5, duration: 1.2, effects: true }
  };

  private constructor() {
    this.createContainer();
    this.setupPerformanceMonitoring();
    this.injectEnterpriseStyles();
  }

  public static getInstance(): EnterpriseAnimationService {
    if (!EnterpriseAnimationService.instance) {
      EnterpriseAnimationService.instance = new EnterpriseAnimationService();
    }
    return EnterpriseAnimationService.instance;
  }

  /**
   * Create animation container
   */
  private createContainer() {
    if (typeof window === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'sprite-animation-container';
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
  }

  /**
   * Mount the container
   */
  public mount(parentContainer: HTMLElement) {
    console.log('🎮 Mounting sprite animation service to:', parentContainer);
    
    if (!this.container) {
      console.log('❌ Internal container not created, creating now...');
      this.createContainer();
    }
    
    if (!this.container || !parentContainer) {
      console.log('❌ Failed to mount - missing container or parent');
      return;
    }
    
    console.log('✅ Appending sprite container to parent');
    parentContainer.appendChild(this.container);
  }

  /**
   * Unmount the container
   */
  public unmount() {
    console.log('🎮 Unmounting sprite animation service');
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  /**
   * Enable/disable animations
   */
  public setEnabled(enabled: boolean) {
    console.log('🎮 Setting sprite animations enabled:', enabled);
    this.enabled = enabled;
  }

  /**
   * Set animation quality
   */
  public setQuality(quality: AnimationQuality) {
    console.log('🎮 Setting animation quality:', quality);
    this.quality = quality;
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): AnimationMetrics {
    return {
      activeAnimations: this.activeAnimations.size,
      totalAnimationsPlayed: this.totalAnimationsPlayed,
      averageFrameRate: this.frameRate,
      memoryUsage: this.memoryUsage,
      droppedFrames: this.droppedFrames,
      smoothnessScore: Math.min(100, (this.frameRate / 60) * 100)
    };
  }

  /**
   * Play text animation
   */
  public async playTextAnimation(config: TextAnimationConfig): Promise<string> {
    if (!this.enabled || !this.container) {
      console.log('❌ Cannot play text animation - disabled or no container');
      return '';
    }

    const animationId = this.generateId();
    console.log('📝 Playing text animation:', config.text, 'at:', config.position);

    const element = document.createElement('div');
    element.className = 'enterprise-text-animation';
    element.textContent = config.text;
    
    const qualityMultiplier = this.qualitySettings[this.quality].duration;
    const duration = (config.duration || 2000) * qualityMultiplier;
    
    element.style.cssText = `
      position: absolute;
      left: ${config.position.x}px;
      top: ${config.position.y}px;
      font-size: ${config.fontSize || 24}px;
      font-weight: ${config.fontWeight || '600'};
      color: ${config.color || '#000000'};
      animation: text-${config.animation || 'fade-in'} ${duration}ms ease-out forwards;
      z-index: 10001;
      pointer-events: none;
      user-select: none;
      text-align: center;
      transform: translate(-50%, -50%);
    `;

    this.activeAnimations.add(animationId);
    this.container.appendChild(element);
    
    config.onStart?.();

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeAnimations.delete(animationId);
      config.onComplete?.();
      console.log('🧹 Cleaned up text animation:', animationId);
    }, duration + (config.delay || 0));

    return animationId;
  }

  /**
   * Play enhanced animation with configuration
   */
  public async playEnhancedAnimation(config: AnimationConfig): Promise<string> {
    if (!this.enabled || !this.container) {
      console.log('❌ Cannot play enhanced animation - disabled or no container');
      return '';
    }

    const animationId = this.generateId();
    this.totalAnimationsPlayed++;
    
    console.log('🎮 Playing enhanced animation:', config.type, 'at:', config.position);
    
    config.onStart?.();
    
    // Apply quality settings
    const qualitySettings = this.qualitySettings[config.quality || this.quality];
    const particleCount = Math.floor((config.particles || 10) * qualitySettings.particles);
    const duration = (config.duration || 2000) * qualitySettings.duration;
    
    switch (config.type) {
      case 'achievement-unlock':
        await this.playAchievementUnlock(config.position);
        break;
      case 'level-up':
        await this.playLevelUp(config.position);
        break;
      case 'task-complete':
        await this.playTaskComplete(config.position);
        break;
      case 'celebration-fireworks':
        await this.playCelebrationFireworks(config.position, particleCount);
        break;
      case 'character-dance':
        await this.playCharacterDance(config.position, config.character || 'hero');
        break;
      case 'energy-wave':
        await this.playEnergyWave(config.position, config.color || '#00ff88');
        break;
      case 'success-ripple':
        await this.playSuccessRipple(config.position);
        break;
      case 'explosive-achievement':
        await this.playExplosiveAchievement(config.position);
        break;
      case 'mega-combo':
        await this.playMegaCombo(config.position);
        break;
      case 'rainbow-celebration':
        await this.playRainbowCelebration(config.position);
        break;
      case 'power-surge':
        await this.playPowerSurge(config.position);
        break;
      case 'diamond-shower':
        await this.playDiamondShower(config.position);
        break;
      case 'cosmic-explosion':
        await this.playCosmicExplosion(config.position);
        break;
      case 'fire-explosion':
        await this.playFireExplosion(config.position);
        break;
      case 'ice-crystal':
        await this.playIceCrystal(config.position);
        break;
      default:
        console.log('🎯 Playing generic celebration for:', config.type);
        // For other types, create a generic celebration
        this.createStarBurst(config.position, 8);
        this.createConfettiExplosion(config.position, 10);
    }
    
    setTimeout(() => {
      config.onComplete?.();
    }, duration);
    
    return animationId;
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    const monitor = () => {
      const now = performance.now();
      if (this.lastFrameTime > 0) {
        const deltaTime = now - this.lastFrameTime;
        const currentFps = 1000 / deltaTime;
        
        // Smooth frame rate calculation
        this.frameRate = this.frameRate * 0.9 + currentFps * 0.1;
        
        // Track dropped frames
        if (deltaTime > 20) { // More than 50fps
          this.droppedFrames++;
        }
      }
      
      this.lastFrameTime = now;
      
      // Update memory usage
      if ('memory' in performance) {
        const memory = (performance as PerformanceWithMemory).memory;
        this.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  /**
   * Inject enterprise-grade CSS styles
   */
  private injectEnterpriseStyles() {
    if (typeof document === 'undefined') return;
    
    const styleId = 'enterprise-animation-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Enhanced Text Animations */
      @keyframes text-fade-in {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      
      @keyframes text-slide-up {
        from { opacity: 0; transform: translate(-50%, -50%) translateY(30px); }
        to { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
      }
      
      @keyframes text-bounce-in {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      
      @keyframes text-typewriter {
        from { width: 0; }
        to { width: 100%; }
      }
      
      @keyframes text-glow {
        0%, 100% { text-shadow: 0 0 5px currentColor; }
        50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
      }
      
      @keyframes text-rainbow {
        0% { color: #ff0000; }
        16.66% { color: #ff8000; }
        33.33% { color: #ffff00; }
        50% { color: #80ff00; }
        66.66% { color: #00ff80; }
        83.33% { color: #0080ff; }
        100% { color: #8000ff; }
      }
      
      /* Enhanced Character Animations */
      @keyframes character-dance {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-10deg) scale(1.1); }
        50% { transform: rotate(0deg) scale(1.2); }
        75% { transform: rotate(10deg) scale(1.1); }
      }
      
      @keyframes character-wave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-15deg); }
        50% { transform: rotate(15deg); }
        75% { transform: rotate(-10deg); }
      }
      
      @keyframes character-jump {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-30px) scale(1.1); }
      }
      
      @keyframes character-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* Enhanced Visual Effects */
      @keyframes energy-wave {
        0% { transform: scale(0); opacity: 0.8; }
        50% { transform: scale(2); opacity: 0.4; }
        100% { transform: scale(4); opacity: 0; }
      }
      
      @keyframes success-ripple {
        0% { transform: scale(0); opacity: 0.6; }
        100% { transform: scale(6); opacity: 0; }
      }
      
      @keyframes celebration-burst {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
        100% { transform: scale(3) rotate(360deg); opacity: 0; }
      }
      
      /* Enhanced Level Up Animations */
      @keyframes trophy-drop {
        0% { 
          transform: translateY(0) rotate(0deg) scale(0.5); 
          opacity: 0; 
        }
        30% { 
          transform: translateY(150px) rotate(15deg) scale(1.2); 
          opacity: 1; 
        }
        60% { 
          transform: translateY(200px) rotate(-10deg) scale(1); 
        }
        80% { 
          transform: translateY(220px) rotate(5deg) scale(1.1); 
        }
        100% { 
          transform: translateY(200px) rotate(0deg) scale(1); 
          opacity: 1; 
        }
      }
      
      @keyframes family-celebration {
        0% { 
          transform: scale(0) rotate(0deg); 
          opacity: 0; 
        }
        20% { 
          transform: scale(1.3) rotate(-20deg); 
          opacity: 1; 
        }
        40% { 
          transform: scale(0.9) rotate(15deg); 
        }
        60% { 
          transform: scale(1.2) rotate(-10deg); 
        }
        80% { 
          transform: scale(1) rotate(5deg); 
        }
        100% { 
          transform: scale(1) rotate(0deg); 
          opacity: 1; 
        }
      }
      
      @keyframes enhanced-ripple {
        0% { 
          transform: scale(0); 
          opacity: 0.8; 
          border-width: 3px; 
        }
        50% { 
          transform: scale(3); 
          opacity: 0.4; 
          border-width: 2px; 
        }
        100% { 
          transform: scale(8); 
          opacity: 0; 
          border-width: 1px; 
        }
      }
      
      @keyframes confetti-physics {
        0% { 
          transform: translate(0, 0) rotate(0deg); 
          opacity: 1; 
        }
        100% { 
          transform: translate(
            calc(cos(var(--angle)) * var(--velocity)), 
            calc(sin(var(--angle)) * var(--velocity) + 300px)
          ) rotate(calc(var(--spin) * 10)); 
          opacity: 0; 
        }
      }
      
      /* New Animation Types */
      @keyframes explosive-burst {
        0% { 
          transform: scale(0) rotate(0deg); 
          opacity: 1; 
          filter: brightness(1); 
        }
        50% { 
          transform: scale(2) rotate(180deg); 
          opacity: 0.8; 
          filter: brightness(2); 
        }
        100% { 
          transform: scale(4) rotate(360deg); 
          opacity: 0; 
          filter: brightness(0.5); 
        }
      }
      
      @keyframes achievement-orbit {
        0% { 
          transform: translate(0, 0) scale(0); 
          opacity: 0; 
        }
        20% { 
          transform: translate(0, 0) scale(1.2); 
          opacity: 1; 
        }
        100% { 
          transform: translate(
            calc(cos(var(--orbit-angle)) * 120px), 
            calc(sin(var(--orbit-angle)) * 120px)
          ) scale(0.8); 
          opacity: 0; 
        }
      }
      
      @keyframes combo-text {
        0% { 
          transform: translateX(-50%) scale(0); 
          opacity: 0; 
        }
        20% { 
          transform: translateX(-50%) scale(1.3); 
          opacity: 1; 
        }
        80% { 
          transform: translateX(-50%) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translateX(-50%) scale(0.8); 
          opacity: 0; 
        }
      }
      
      @keyframes lightning-strike {
        0% { 
          transform: scale(0) rotate(0deg); 
          opacity: 0; 
          filter: brightness(1); 
        }
        50% { 
          transform: scale(1.5) rotate(180deg); 
          opacity: 1; 
          filter: brightness(3); 
        }
        100% { 
          transform: scale(0.5) rotate(360deg); 
          opacity: 0; 
          filter: brightness(0.5); 
        }
      }
      
      @keyframes rainbow-arc {
        0% { 
          transform: translateY(0) scale(0); 
          opacity: 0; 
        }
        50% { 
          transform: translateY(-30px) scale(1.2); 
          opacity: 1; 
        }
        100% { 
          transform: translateY(-20px) scale(1); 
          opacity: 0.8; 
        }
      }
      
      @keyframes rainbow-particles {
        0% { 
          transform: translate(0, 0) scale(0); 
          opacity: 0; 
        }
        20% { 
          transform: translate(0, 0) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translate(
            calc(cos(var(--color-index) * 60deg) * 100px), 
            calc(sin(var(--color-index) * 60deg) * 100px)
          ) scale(0.5); 
          opacity: 0; 
        }
      }
      
      @keyframes energy-core {
        0% { 
          transform: scale(0); 
          opacity: 0; 
          filter: brightness(1); 
        }
        50% { 
          transform: scale(1.5); 
          opacity: 1; 
          filter: brightness(3); 
        }
        100% { 
          transform: scale(1); 
          opacity: 0.8; 
          filter: brightness(2); 
        }
      }
      
      @keyframes energy-wave-pulse {
        0% { 
          transform: scale(0); 
          opacity: 0.8; 
          border-color: #00ffff; 
        }
        100% { 
          transform: scale(6); 
          opacity: 0; 
          border-color: #0080ff; 
        }
      }
      
      @keyframes diamond-fall {
        0% { 
          transform: translateY(0) rotate(0deg); 
          opacity: 1; 
        }
        100% { 
          transform: translateY(400px) rotate(var(--rotation)); 
          opacity: 0; 
        }
      }
      
      @keyframes cosmic-star {
        0% { 
          transform: scale(0) rotate(0deg); 
          opacity: 0; 
          filter: brightness(1); 
        }
        50% { 
          transform: scale(2) rotate(180deg); 
          opacity: 1; 
          filter: brightness(3); 
        }
        100% { 
          transform: scale(1.5) rotate(360deg); 
          opacity: 0.8; 
          filter: brightness(2); 
        }
      }
      
      @keyframes cosmic-spiral {
        0% { 
          transform: translate(0, 0) rotate(0deg) scale(0); 
          opacity: 0; 
        }
        20% { 
          transform: translate(0, 0) rotate(0deg) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translate(
            calc(cos(var(--spiral-angle) * 3) * 150px), 
            calc(sin(var(--spiral-angle) * 3) * 150px)
          ) rotate(720deg) scale(0.3); 
          opacity: 0; 
        }
      }
      
      @keyframes fire-explosion {
        0% { 
          transform: scale(0); 
          opacity: 0; 
          filter: hue-rotate(0deg); 
        }
        50% { 
          transform: scale(2); 
          opacity: 1; 
          filter: hue-rotate(30deg); 
        }
        100% { 
          transform: scale(1.5); 
          opacity: 0.8; 
          filter: hue-rotate(60deg); 
        }
      }
      
      @keyframes fire-particles {
        0% { 
          transform: translate(0, 0) scale(0); 
          opacity: 0; 
        }
        20% { 
          transform: translate(0, 0) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translate(
            calc(cos(var(--fire-angle)) * 80px), 
            calc(sin(var(--fire-angle)) * 80px - 50px)
          ) scale(0.3); 
          opacity: 0; 
        }
      }
      
      @keyframes ice-crystal {
        0% { 
          transform: scale(0) rotate(0deg); 
          opacity: 0; 
        }
        50% { 
          transform: scale(1.3) rotate(180deg); 
          opacity: 1; 
        }
        100% { 
          transform: scale(1) rotate(360deg); 
          opacity: 0.9; 
        }
      }
      
      @keyframes ice-particles {
        0% { 
          transform: translateY(0) rotate(0deg) scale(0); 
          opacity: 0; 
        }
        20% { 
          transform: translateY(0) rotate(0deg) scale(1); 
          opacity: 1; 
        }
        100% { 
          transform: translateY(100px) rotate(360deg) scale(0.5); 
          opacity: 0; 
        }
      }
      
      @keyframes shockwave {
        0% { 
          transform: scale(0); 
          opacity: 0.8; 
          border-width: 4px; 
        }
        100% { 
          transform: scale(10); 
          opacity: 0; 
          border-width: 1px; 
        }
      }
      
      /* Performance optimizations */
      .enterprise-text-animation,
      .enterprise-character,
      .enterprise-particle {
        will-change: transform, opacity;
        backface-visibility: hidden;
        transform-style: preserve-3d;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Generate unique animation ID
   */
  private generateId(): string {
    return `anim_${++this.animationId}_${Date.now()}`;
  }

  /**
   * Create achievement unlock animation
   */
  public async playAchievementUnlock(position: { x: number; y: number }) {
    console.log('🏆 Playing achievement unlock animation at:', position);
    
    if (!this.enabled || !this.container) {
      console.log('❌ Cannot play achievement - disabled or no container');
      return;
    }

    // Create badge element
    const badge = document.createElement('div');
    badge.innerHTML = '🏆';
    badge.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      font-size: 50px;
      animation: achievement-bounce 2s ease-out forwards;
      z-index: 10000;
    `;

    // Create character element
    const character = document.createElement('div');
    character.innerHTML = '⭐';
    character.style.cssText = `
      position: absolute;
      left: ${position.x - 85}px;
      top: ${position.y - 25}px;
      font-size: 40px;
      animation: character-celebrate 2s ease-out forwards;
      z-index: 10000;
    `;

    console.log('✅ Adding elements to container');
    if (this.container) {
      this.container.appendChild(badge);
      this.container.appendChild(character);
    }

    // Create star burst
    this.createStarBurst(position, 8);

    // Clean up
    setTimeout(() => {
      if (badge.parentNode) badge.parentNode.removeChild(badge);
      if (character.parentNode) character.parentNode.removeChild(character);
      console.log('🧹 Cleaned up achievement animation elements');
    }, 2000);
  }

  /**
   * Create level up animation - Enhanced with trophy physics and massive celebration
   */
  public async playLevelUp(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Create animated trophy with physics
    const trophy = document.createElement('div');
    trophy.innerHTML = '🏆';
    trophy.style.cssText = `
      position: absolute;
      left: ${position.x - 30}px;
      top: ${position.y - 200}px;
      font-size: 60px;
      animation: trophy-drop 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      z-index: 10001;
      filter: drop-shadow(0 0 20px gold);
    `;

    // Create family characters with staggered celebration
    const characters = ['👨', '👩', '👧', '👦'];
    characters.forEach((char, index) => {
      const element = document.createElement('div');
      element.innerHTML = char;
      element.style.cssText = `
        position: absolute;
        left: ${position.x + (index - 1.5) * 80 - 20}px;
        top: ${position.y - 25}px;
        font-size: 45px;
        animation: family-celebration 3s ease-out forwards;
        animation-delay: ${index * 0.3}s;
        z-index: 10000;
        filter: drop-shadow(0 0 10px rgba(255,215,0,0.8));
      `;
      
      if (this.container) {
        this.container.appendChild(element);
      }
      
      setTimeout(() => {
        if (element.parentNode) element.parentNode.removeChild(element);
      }, 4000);
    });

    if (this.container) {
      this.container.appendChild(trophy);
    }

    // Massive confetti explosion in waves
    this.createConfettiWaves(position, 50);
    
    // Star burst around trophy
    this.createStarBurst(position, 16);
    
    // Success ripples
    this.createSuccessRipples(position, 5);

    setTimeout(() => {
      if (trophy.parentNode) trophy.parentNode.removeChild(trophy);
    }, 3000);
  }

  /**
   * Enhanced success ripple with multiple waves
   */
  private createSuccessRipples(center: { x: number; y: number }, count: number) {
    if (!this.container) return;

    for (let i = 0; i < count; i++) {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        left: ${center.x - 25}px;
        top: ${center.y - 25}px;
        width: 50px;
        height: 50px;
        border: 3px solid #00ff88;
        border-radius: 50%;
        animation: enhanced-ripple ${2000 + i * 300}ms ease-out forwards;
        animation-delay: ${i * 200}ms;
        z-index: 9999;
      `;
      
      this.container.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 3000);
    }
  }

  /**
   * Create confetti waves with realistic physics
   */
  private createConfettiWaves(center: { x: number; y: number }, count: number) {
    if (!this.container) return;

    const confettiTypes = ['🎊', '🎉', '✨', '💫', '🌟', '🎈', '🎁', '💎'];
    
    for (let wave = 0; wave < 3; wave++) {
      setTimeout(() => {
        for (let i = 0; i < count / 3; i++) {
          const confetti = document.createElement('div');
          confetti.innerHTML = confettiTypes[Math.floor(Math.random() * confettiTypes.length)];
          
          const angle = (Math.random() * Math.PI * 2);
          const velocity = 150 + Math.random() * 100;
          const gravity = 0.5 + Math.random() * 0.3;
          const spin = (Math.random() - 0.5) * 10;
          
          confetti.style.cssText = `
            position: absolute;
            left: ${center.x - 15}px;
            top: ${center.y - 15}px;
            font-size: ${20 + Math.random() * 15}px;
            animation: confetti-physics 4s ease-out forwards;
            z-index: 10000;
            --angle: ${angle}rad;
            --velocity: ${velocity}px;
            --gravity: ${gravity};
            --spin: ${spin}deg;
          `;
          
          if (this.container) {
            this.container.appendChild(confetti);
          }
          
          setTimeout(() => {
            if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
          }, 4000);
        }
      }, wave * 500);
    }
  }

  /**
   * Create task completion animation
   */
  public async playTaskComplete(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    const checkmark = document.createElement('div');
    checkmark.innerHTML = '✅';
    checkmark.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      font-size: 50px;
      animation: celebration-burst 1.5s ease-out forwards;
      z-index: 10000;
    `;

    if (this.container) {
      this.container.appendChild(checkmark);
    }

    // Small star burst
    this.createStarBurst(position, 5);

    setTimeout(() => {
      if (checkmark.parentNode) checkmark.parentNode.removeChild(checkmark);
    }, 1500);
  }

  /**
   * Create star burst effect
   */
  private createStarBurst(center: { x: number; y: number }, count: number) {
    if (!this.container) {
      console.log('❌ Cannot create star burst - no container');
      return;
    }

    console.log('⭐ Creating star burst with', count, 'stars');

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.innerHTML = '⭐';
      const angle = (i / count) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      
      star.style.cssText = `
        position: absolute;
        left: ${center.x - 15}px;
        top: ${center.y - 15}px;
        font-size: 30px;
        animation: celebration-burst 2s ease-out forwards;
        animation-delay: ${i * 0.1}s;
        z-index: 10000;
        --end-x: ${Math.cos(angle) * distance}px;
        --end-y: ${Math.sin(angle) * distance}px;
      `;
      
      this.container.appendChild(star);
      
      setTimeout(() => {
        if (star.parentNode) star.parentNode.removeChild(star);
      }, 2000);
    }
  }

  /**
   * Create confetti explosion
   */
  private createConfettiExplosion(center: { x: number; y: number }, count: number) {
    if (!this.container) return;

    const confettiChars = ['🎊', '🎉', '✨', '💫', '🌟'];
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.innerHTML = confettiChars[Math.floor(Math.random() * confettiChars.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 100;
      
      confetti.style.cssText = `
        position: absolute;
        left: ${center.x - 15}px;
        top: ${center.y - 15}px;
        font-size: 25px;
        animation: celebration-burst 3s ease-out forwards;
        z-index: 10000;
        --vel-x: ${Math.cos(angle) * speed}px;
        --vel-y: ${Math.sin(angle) * speed - 200}px;
      `;
      
      if (this.container) {
        this.container.appendChild(confetti);
      }
      
      setTimeout(() => {
        if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
      }, 3000);
    }
  }

  /**
   * Play celebration fireworks animation
   */
  private async playCelebrationFireworks(position: { x: number; y: number }, particleCount: number) {
    if (!this.enabled || !this.container) return;

    for (let i = 0; i < particleCount; i++) {
      const firework = document.createElement('div');
      firework.innerHTML = '🎆';
      firework.style.cssText = `
        position: absolute;
        left: ${position.x + (Math.random() - 0.5) * 200}px;
        top: ${position.y + (Math.random() - 0.5) * 200}px;
        font-size: ${20 + Math.random() * 20}px;
        animation: celebration-burst ${2000 + Math.random() * 1000}ms ease-out forwards;
        animation-delay: ${Math.random() * 500}ms;
        z-index: 10000;
      `;
      
      if (this.container) {
        this.container.appendChild(firework);
      }
      
      setTimeout(() => {
        if (firework.parentNode) firework.parentNode.removeChild(firework);
      }, 3000);
    }
  }

  /**
   * Play character dance animation
   */
  private async playCharacterDance(position: { x: number; y: number }, character: CharacterType) {
    if (!this.enabled || !this.container) return;

    const characterEmoji = this.getCharacterEmoji(character);
    const element = document.createElement('div');
    element.innerHTML = characterEmoji;
    element.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      font-size: 50px;
      animation: character-dance 2s ease-in-out infinite;
      z-index: 10000;
    `;
    
    if (this.container) {
      this.container.appendChild(element);
    }
    
    setTimeout(() => {
      if (element.parentNode) element.parentNode.removeChild(element);
    }, 4000);
  }

  /**
   * Play energy wave animation
   */
  private async playEnergyWave(position: { x: number; y: number }, color: string) {
    if (!this.enabled || !this.container) return;

    const wave = document.createElement('div');
    wave.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      width: 50px;
      height: 50px;
      border: 3px solid ${color};
      border-radius: 50%;
      animation: energy-wave 1500ms ease-out forwards;
      z-index: 10000;
    `;
    
    if (this.container) {
      this.container.appendChild(wave);
    }
    
    setTimeout(() => {
      if (wave.parentNode) wave.parentNode.removeChild(wave);
    }, 1500);
  }

  /**
   * Play success ripple animation
   */
  private async playSuccessRipple(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      width: 50px;
      height: 50px;
      border: 2px solid #00ff88;
      border-radius: 50%;
      animation: success-ripple 2s ease-out forwards;
      z-index: 10000;
    `;
    
    if (this.container) {
      this.container.appendChild(ripple);
    }
    
    setTimeout(() => {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 2000);
  }

  /**
   * Get character emoji
   */
  private getCharacterEmoji(character: CharacterType): string {
    const characterMap: Record<CharacterType, string> = {
      hero: '🦸',
      family: '👨‍👩‍👧‍👦',
      child: '🧒',
      teen: '🧑',
      adult: '👨',
      parent: '👨‍👩‍👧',
      grandparent: '👴',
      pet: '🐕',
      mascot: '🎭',
      robot: '🤖',
      avatar: '👤'
    };
    
    return characterMap[character] || '😊';
  }

  /**
   * Play explosive achievement animation
   */
  public async playExplosiveAchievement(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Central explosion
    const explosion = document.createElement('div');
    explosion.innerHTML = '💥';
    explosion.style.cssText = `
      position: absolute;
      left: ${position.x - 30}px;
      top: ${position.y - 30}px;
      font-size: 60px;
      animation: explosive-burst 1.5s ease-out forwards;
      z-index: 10001;
    `;

    if (this.container) {
      this.container.appendChild(explosion);
    }

    // Ring of achievements
    const achievements = ['🏆', '🥇', '⭐', '💎', '👑'];
    for (let i = 0; i < achievements.length; i++) {
      const element = document.createElement('div');
      element.innerHTML = achievements[i];
      const angle = (i / achievements.length) * Math.PI * 2;
      
      element.style.cssText = `
        position: absolute;
        left: ${position.x - 20}px;
        top: ${position.y - 20}px;
        font-size: 40px;
        animation: achievement-orbit 3s ease-out forwards;
        animation-delay: ${i * 0.1}s;
        z-index: 10000;
        --orbit-angle: ${angle}rad;
      `;
      
      if (this.container) {
        this.container.appendChild(element);
      }
      
      setTimeout(() => {
        if (element.parentNode) element.parentNode.removeChild(element);
      }, 3000);
    }

    this.createShockwave(position, 3);
    
    setTimeout(() => {
      if (explosion.parentNode) explosion.parentNode.removeChild(explosion);
    }, 1500);
  }

  /**
   * Play mega combo animation
   */
  public async playMegaCombo(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Combo text
    const comboText = document.createElement('div');
    comboText.textContent = 'MEGA COMBO!';
    comboText.style.cssText = `
      position: absolute;
      left: ${position.x}px;
      top: ${position.y - 50}px;
      font-size: 36px;
      font-weight: bold;
      color: #ff6b35;
      text-shadow: 0 0 20px #ff6b35;
      animation: combo-text 2s ease-out forwards;
      z-index: 10001;
      transform: translateX(-50%);
    `;

    if (this.container) {
      this.container.appendChild(comboText);
    }

    // Lightning effects
    for (let i = 0; i < 8; i++) {
      const lightning = document.createElement('div');
      lightning.innerHTML = '⚡';
      lightning.style.cssText = `
        position: absolute;
        left: ${position.x + (Math.random() - 0.5) * 200}px;
        top: ${position.y + (Math.random() - 0.5) * 200}px;
        font-size: 30px;
        animation: lightning-strike 1s ease-out forwards;
        animation-delay: ${i * 0.1}s;
        z-index: 10000;
      `;
      
      if (this.container) {
        this.container.appendChild(lightning);
      }
      
      setTimeout(() => {
        if (lightning.parentNode) lightning.parentNode.removeChild(lightning);
      }, 1500);
    }

    setTimeout(() => {
      if (comboText.parentNode) comboText.parentNode.removeChild(comboText);
    }, 2000);
  }

  /**
   * Play rainbow celebration animation
   */
  public async playRainbowCelebration(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Rainbow arc
    const rainbow = document.createElement('div');
    rainbow.innerHTML = '🌈';
    rainbow.style.cssText = `
      position: absolute;
      left: ${position.x - 40}px;
      top: ${position.y - 80}px;
      font-size: 80px;
      animation: rainbow-arc 3s ease-in-out forwards;
      z-index: 10001;
    `;

    if (this.container) {
      this.container.appendChild(rainbow);
    }

    // Colorful particles
    const colors = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    colors.forEach((color, index) => {
      const particle = document.createElement('div');
      particle.innerHTML = color;
      particle.style.cssText = `
        position: absolute;
        left: ${position.x - 15}px;
        top: ${position.y - 15}px;
        font-size: 25px;
        animation: rainbow-particles 2.5s ease-out forwards;
        animation-delay: ${index * 0.2}s;
        z-index: 10000;
        --color-index: ${index};
      `;
      
      if (this.container) {
        this.container.appendChild(particle);
      }
      
      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 3000);
    });

    setTimeout(() => {
      if (rainbow.parentNode) rainbow.parentNode.removeChild(rainbow);
    }, 3000);
  }

  /**
   * Play power surge animation
   */
  public async playPowerSurge(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Energy core
    const core = document.createElement('div');
    core.innerHTML = '⚡';
    core.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      font-size: 50px;
      animation: energy-core 2s ease-out forwards;
      z-index: 10001;
      filter: drop-shadow(0 0 30px #00ffff);
    `;

    if (this.container) {
      this.container.appendChild(core);
    }

    // Energy waves
    for (let i = 0; i < 6; i++) {
      const wave = document.createElement('div');
      wave.style.cssText = `
        position: absolute;
        left: ${position.x - 25}px;
        top: ${position.y - 25}px;
        width: 50px;
        height: 50px;
        border: 2px solid #00ffff;
        border-radius: 50%;
        animation: energy-wave-pulse ${1500 + i * 200}ms ease-out forwards;
        animation-delay: ${i * 100}ms;
        z-index: 9999;
      `;
      
      if (this.container) {
        this.container.appendChild(wave);
      }
      
      setTimeout(() => {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
      }, 2500);
    }

    setTimeout(() => {
      if (core.parentNode) core.parentNode.removeChild(core);
    }, 2000);
  }

  /**
   * Play diamond shower animation
   */
  public async playDiamondShower(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    for (let i = 0; i < 20; i++) {
      const diamond = document.createElement('div');
      diamond.innerHTML = '💎';
      diamond.style.cssText = `
        position: absolute;
        left: ${position.x + (Math.random() - 0.5) * 300}px;
        top: ${position.y - 200 - Math.random() * 100}px;
        font-size: ${20 + Math.random() * 20}px;
        animation: diamond-fall ${2000 + Math.random() * 1000}ms ease-in forwards;
        animation-delay: ${Math.random() * 1000}ms;
        z-index: 10000;
        --rotation: ${Math.random() * 360}deg;
      `;
      
      if (this.container) {
        this.container.appendChild(diamond);
      }
      
      setTimeout(() => {
        if (diamond.parentNode) diamond.parentNode.removeChild(diamond);
      }, 4000);
    }
  }

  /**
   * Play cosmic explosion animation
   */
  public async playCosmicExplosion(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Central star
    const star = document.createElement('div');
    star.innerHTML = '⭐';
    star.style.cssText = `
      position: absolute;
      left: ${position.x - 30}px;
      top: ${position.y - 30}px;
      font-size: 60px;
      animation: cosmic-star 2s ease-out forwards;
      z-index: 10001;
    `;

    if (this.container) {
      this.container.appendChild(star);
    }

    // Cosmic particles
    const cosmicElements = ['🌟', '✨', '💫', '🌠', '🪐', '🌙'];
    for (let i = 0; i < 15; i++) {
      const element = document.createElement('div');
      element.innerHTML = cosmicElements[Math.floor(Math.random() * cosmicElements.length)];
      const angle = (i / 15) * Math.PI * 2;
      
      element.style.cssText = `
        position: absolute;
        left: ${position.x - 15}px;
        top: ${position.y - 15}px;
        font-size: 30px;
        animation: cosmic-spiral 3s ease-out forwards;
        animation-delay: ${i * 0.1}s;
        z-index: 10000;
        --spiral-angle: ${angle}rad;
      `;
      
      if (this.container) {
        this.container.appendChild(element);
      }
      
      setTimeout(() => {
        if (element.parentNode) element.parentNode.removeChild(element);
      }, 3000);
    }

    setTimeout(() => {
      if (star.parentNode) star.parentNode.removeChild(star);
    }, 2000);
  }

  /**
   * Play fire explosion animation
   */
  public async playFireExplosion(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Fire core
    const fire = document.createElement('div');
    fire.innerHTML = '🔥';
    fire.style.cssText = `
      position: absolute;
      left: ${position.x - 25}px;
      top: ${position.y - 25}px;
      font-size: 50px;
      animation: fire-explosion 2s ease-out forwards;
      z-index: 10001;
    `;

    if (this.container) {
      this.container.appendChild(fire);
    }

    // Fire particles
    for (let i = 0; i < 12; i++) {
      const ember = document.createElement('div');
      ember.innerHTML = '🔥';
      const angle = (i / 12) * Math.PI * 2;
      
      ember.style.cssText = `
        position: absolute;
        left: ${position.x - 15}px;
        top: ${position.y - 15}px;
        font-size: 25px;
        animation: fire-particles 2.5s ease-out forwards;
        animation-delay: ${i * 0.05}s;
        z-index: 10000;
        --fire-angle: ${angle}rad;
      `;
      
      if (this.container) {
        this.container.appendChild(ember);
      }
      
      setTimeout(() => {
        if (ember.parentNode) ember.parentNode.removeChild(ember);
      }, 2500);
    }

    setTimeout(() => {
      if (fire.parentNode) fire.parentNode.removeChild(fire);
    }, 2000);
  }

  /**
   * Play ice crystal animation
   */
  public async playIceCrystal(position: { x: number; y: number }) {
    if (!this.enabled || !this.container) return;

    // Ice crystal
    const crystal = document.createElement('div');
    crystal.innerHTML = '❄️';
    crystal.style.cssText = `
      position: absolute;
      left: ${position.x - 30}px;
      top: ${position.y - 30}px;
      font-size: 60px;
      animation: ice-crystal 2.5s ease-out forwards;
      z-index: 10001;
      filter: drop-shadow(0 0 20px #87ceeb);
    `;

    if (this.container) {
      this.container.appendChild(crystal);
    }

    // Ice particles
    for (let i = 0; i < 10; i++) {
      const ice = document.createElement('div');
      ice.innerHTML = '❄️';
      
      ice.style.cssText = `
        position: absolute;
        left: ${position.x + (Math.random() - 0.5) * 150}px;
        top: ${position.y + (Math.random() - 0.5) * 150}px;
        font-size: ${15 + Math.random() * 15}px;
        animation: ice-particles 3s ease-out forwards;
        animation-delay: ${Math.random() * 500}ms;
        z-index: 10000;
      `;
      
      if (this.container) {
        this.container.appendChild(ice);
      }
      
      setTimeout(() => {
        if (ice.parentNode) ice.parentNode.removeChild(ice);
      }, 3000);
    }

    setTimeout(() => {
      if (crystal.parentNode) crystal.parentNode.removeChild(crystal);
    }, 2500);
  }

  /**
   * Create shockwave effect
   */
  private createShockwave(center: { x: number; y: number }, count: number) {
    if (!this.container) return;

    for (let i = 0; i < count; i++) {
      const wave = document.createElement('div');
      wave.style.cssText = `
        position: absolute;
        left: ${center.x - 25}px;
        top: ${center.y - 25}px;
        width: 50px;
        height: 50px;
        border: 4px solid #ff6b35;
        border-radius: 50%;
        animation: shockwave ${1000 + i * 300}ms ease-out forwards;
        animation-delay: ${i * 100}ms;
        z-index: 9998;
      `;
      
      this.container.appendChild(wave);
      
      setTimeout(() => {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
      }, 2000);
    }
  }
}

// Export singleton instance
export const spriteAnimationService = EnterpriseAnimationService.getInstance(); 