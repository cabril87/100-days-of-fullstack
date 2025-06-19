/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Enterprise Animation System
 * Complete high-performance animation system with enterprise features
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
  Vector2D,
  AnimationType,
  TextAnimationStyle,
  ParticleType,
  CharacterType
} from '@/lib/types/animations';

/**
 * Enterprise Animation System - Complete Implementation
 * Provides smooth, high-performance animations with enterprise features
 */
export class EnterpriseAnimationSystem implements IAnimationManager {
  private static instance: EnterpriseAnimationSystem;
  
  // Core system
  private container: HTMLElement | null = null;
  private config: AnimationSystemConfig;
  private isInitialized = false;
  private animationId = 0;
  
  // Active animations tracking
  private activeAnimations = new Map<string, any>();
  private activeTextAnimations = new Map<string, TextAnimationInstance>();
  private activeParticleSystems = new Map<string, ParticleSystemInstance>();
  private activeCharacters = new Map<string, CharacterInstance>();
  
  // Event system
  private eventListeners = new Map<string, Function[]>();
  
  // Performance monitoring
  private frameRate = 60;
  private lastFrameTime = 0;
  private frameCount = 0;
  private droppedFrames = 0;
  private memoryUsage = 0;
  private isMonitoring = false;
  
  // Animation queue for sequences
  private animationQueue: AnimationSequence[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.bindMethods();
  }

  public static getInstance(): EnterpriseAnimationSystem {
    if (!EnterpriseAnimationSystem.instance) {
      EnterpriseAnimationSystem.instance = new EnterpriseAnimationSystem();
    }
    return EnterpriseAnimationSystem.instance;
  }

  /**
   * Initialize the animation system
   */
  public async initialize(config: Partial<AnimationSystemConfig> = {}): Promise<void> {
    this.config = { ...this.config, ...config };
    
    try {
      await this.createContainer();
      this.injectStyles();
      this.setupPerformanceMonitoring();
      this.setupAccessibility();
      
      this.isInitialized = true;
      this.emit('system-initialized', { timestamp: Date.now() });
      
      if (this.config.debugMode) {
        console.log('🎮 Enterprise Animation System initialized:', this.config);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize animation system:', error);
      throw error;
    }
  }

  /**
   * Play animation or sequence
   */
  public async play(config: AnimationConfig | AnimationSequence): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Animation system not initialized');
    }

    const animationId = this.generateId();
    
    try {
      if ('animations' in config) {
        return await this.playSequence(config, animationId);
      } else {
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
      throw new Error('Animation system not initialized');
    }

    const animationId = this.generateId();
    
    try {
      const textAnimation = await this.createTextAnimation(config, animationId);
      this.activeTextAnimations.set(animationId, textAnimation);
      
      await textAnimation.play();
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
      throw new Error('Animation system not initialized');
    }

    const systemId = this.generateId();
    
    try {
      const particleSystem = await this.createParticleSystemInstance(config, systemId);
      this.activeParticleSystems.set(systemId, particleSystem);
      
      particleSystem.start();
      
      // Auto-cleanup
      setTimeout(() => {
        if (this.activeParticleSystems.has(systemId)) {
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
      throw new Error('Animation system not initialized');
    }

    const characterId = this.generateId();
    
    try {
      const character = await this.createCharacterInstance(config, characterId);
      this.activeCharacters.set(characterId, character);
      
      if (config.autoAnimate && config.idleAnimation) {
        character.playAnimation(config.idleAnimation);
      }
      
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
   * Move character
   */
  public async moveCharacter(
    characterId: string, 
    position: Vector2D, 
    duration = 1000
  ): Promise<void> {
    const character = this.activeCharacters.get(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    return character.moveTo(position, duration);
  }

  /**
   * Animation control methods
   */
  public pause(animationId: string): void {
    const animation = this.getAnimationById(animationId);
    if (animation && animation.pause) {
      animation.pause();
      this.emit('pause', { animationId, timestamp: Date.now() });
    }
  }

  public resume(animationId: string): void {
    const animation = this.getAnimationById(animationId);
    if (animation && animation.resume) {
      animation.resume();
      this.emit('resume', { animationId, timestamp: Date.now() });
    }
  }

  public stop(animationId: string): void {
    const animation = this.getAnimationById(animationId);
    if (animation) {
      if (animation.stop) animation.stop();
      if (animation.destroy) animation.destroy();
      
      // Remove from appropriate collection
      this.activeAnimations.delete(animationId);
      this.activeTextAnimations.delete(animationId);
      this.activeParticleSystems.delete(animationId);
      this.activeCharacters.delete(animationId);
      
      this.emit('stop', { animationId, timestamp: Date.now() });
    }
  }

  public stopAll(): void {
    const allIds = [
      ...this.activeAnimations.keys(),
      ...this.activeTextAnimations.keys(),
      ...this.activeParticleSystems.keys(),
      ...this.activeCharacters.keys()
    ];
    
    allIds.forEach(id => this.stop(id));
    
    this.emit('stop-all', { 
      count: allIds.length, 
      timestamp: Date.now() 
    });
  }

  /**
   * System management
   */
  public getActiveAnimations(): string[] {
    return [
      ...this.activeAnimations.keys(),
      ...this.activeTextAnimations.keys(),
      ...this.activeParticleSystems.keys(),
      ...this.activeCharacters.keys()
    ];
  }

  public getMetrics(): AnimationMetrics {
    return {
      frameRate: this.frameRate,
      averageFrameTime: this.lastFrameTime,
      droppedFrames: this.droppedFrames,
      memoryUsage: this.memoryUsage,
      activeAnimations: this.getActiveAnimations().length,
      queuedAnimations: this.animationQueue.length,
      renderTime: 0,
      updateTime: 0,
      totalTime: performance.now(),
      smoothnessScore: this.calculateSmoothnessScore(),
      responsiveness: this.calculateResponsiveness(),
      batteryImpact: this.calculateBatteryImpact()
    };
  }

  public setQuality(quality: AnimationQuality): void {
    this.config.qualityLevel = quality;
    
    // Update all active animations
    this.activeTextAnimations.forEach(anim => anim.setQuality(quality));
    this.activeParticleSystems.forEach(system => system.setQuality(quality));
    this.activeCharacters.forEach(char => char.setQuality(quality));
    
    this.emit('quality-changed', { quality, timestamp: Date.now() });
  }

  public async preloadSequence(sequence: AnimationSequence): Promise<void> {
    if (!this.config.enablePreloading) return;

    try {
      // Preload all animations in sequence
      for (const anim of sequence.animations) {
        if ('text' in anim) {
          await this.preloadTextAnimation(anim as TextAnimationConfig);
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
   * Destroy system
   */
  public destroy(): void {
    this.stopAll();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.activeAnimations.clear();
    this.activeTextAnimations.clear();
    this.activeParticleSystems.clear();
    this.activeCharacters.clear();
    this.eventListeners.clear();
    
    this.isInitialized = false;
    this.isMonitoring = false;
    
    this.emit('system-destroyed', { timestamp: Date.now() });
  }

  // Private implementation methods

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

  private async playSingleAnimation(config: AnimationConfig, animationId: string): Promise<string> {
    // Create appropriate animation based on type
    if (config.type.startsWith('text-')) {
      const textConfig: TextAnimationConfig = {
        ...config,
        type: config.type.replace('text-', '') as TextAnimationStyle,
        text: 'Animation Text',
        fontSize: 24,
        fontWeight: 600
      };
      return this.playText(textConfig);
    }
    
    // Handle other animation types
    const element = this.createAnimationElement(config);
    this.container!.appendChild(element);
    
    this.activeAnimations.set(animationId, {
      element,
      config,
      stop: () => {
        element.style.animation = 'none';
      },
      destroy: () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }
    });
    
    // Apply animation
    this.applyAnimationToElement(element, config);
    
    // Auto-cleanup
    setTimeout(() => {
      if (this.activeAnimations.has(animationId)) {
        this.stop(animationId);
      }
    }, config.duration + (config.delay || 0));
    
    return animationId;
  }

  private async playSequence(sequence: AnimationSequence, sequenceId: string): Promise<string> {
    if (sequence.simultaneousAnimations) {
      // Play all animations at once
      const promises = sequence.animations.map(anim => this.playSingleAnimation(anim, this.generateId()));
      await Promise.all(promises);
    } else {
      // Play animations sequentially
      for (const anim of sequence.animations) {
        await this.playSingleAnimation(anim, this.generateId());
      }
    }
    
    this.emit('sequence-complete', { 
      sequenceId, 
      timestamp: Date.now() 
    });
    
    return sequenceId;
  }

  private createAnimationElement(config: AnimationConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'enterprise-animation-element';
    
    element.style.position = 'absolute';
    element.style.left = `${config.position.x}px`;
    element.style.top = `${config.position.y}px`;
    element.style.pointerEvents = 'none';
    element.style.zIndex = (config.zIndex || 9998).toString();
    
    // Set content based on animation type
    element.textContent = this.getAnimationEmoji(config.type);
    element.style.fontSize = '32px';
    
    return element;
  }

  private applyAnimationToElement(element: HTMLElement, config: AnimationConfig): void {
    const duration = config.duration;
    const easing = config.easing || 'ease-out';
    const animationName = this.getAnimationName(config.type);
    
    element.style.animation = `${animationName} ${duration}ms ${easing}`;
  }

  private getAnimationEmoji(type: AnimationType): string {
    const emojiMap: Record<string, string> = {
      'achievement-unlock': '🏆',
      'badge-earned': '🏅',
      'level-up': '⬆️',
      'task-complete': '✅',
      'star-burst': '⭐',
      'confetti-explosion': '🎊',
      'celebration-fireworks': '🎆',
      'family-notification': '👨‍👩‍👧‍👦',
      'success-ripple': '✨',
      'points-earned': '💎',
      'streak-milestone': '🔥'
    };
    
    return emojiMap[type] || '✨';
  }

  private getAnimationName(type: AnimationType): string {
    const animationMap: Record<string, string> = {
      'achievement-unlock': 'achievementBounce',
      'badge-earned': 'badgeGlow',
      'level-up': 'levelUpBurst',
      'task-complete': 'taskCompleteCheck',
      'star-burst': 'starBurst',
      'confetti-explosion': 'confettiBurst',
      'celebration-fireworks': 'fireworksExplode',
      'success-ripple': 'successRipple'
    };
    
    return animationMap[type] || 'defaultBounce';
  }

  private async createTextAnimation(config: TextAnimationConfig, id: string): Promise<TextAnimationInstance> {
    const element = this.createTextElement(config);
    
    const textAnimation: TextAnimationInstance = {
      id,
      element,
      config,
      isPlaying: false,
      
      play: async () => {
        textAnimation.isPlaying = true;
        this.container!.appendChild(element);
        
        this.emit('start', { animationId: id, type: 'text', timestamp: Date.now() });
        
        await this.applyTextAnimation(element, config);
        
        textAnimation.isPlaying = false;
        this.emit('complete', { animationId: id, type: 'text', timestamp: Date.now() });
        
        if (config.autoDestroy !== false) {
          setTimeout(() => textAnimation.destroy(), 500);
        }
      },
      
      pause: () => {
        element.style.animationPlayState = 'paused';
      },
      
      resume: () => {
        element.style.animationPlayState = 'running';
      },
      
      stop: () => {
        element.style.animation = 'none';
        textAnimation.isPlaying = false;
      },
      
      destroy: () => {
        textAnimation.stop();
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      },
      
      setQuality: (quality: AnimationQuality) => {
        this.adjustTextQuality(element, quality);
      }
    };
    
    return textAnimation;
  }

  private createTextElement(config: TextAnimationConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'enterprise-text-animation';
    
    // Position
    element.style.position = 'absolute';
    element.style.left = `${config.position.x}px`;
    element.style.top = `${config.position.y}px`;
    element.style.zIndex = (config.zIndex || 1000).toString();
    
    // Typography
    element.style.fontSize = typeof config.fontSize === 'number' ? 
      `${config.fontSize}px` : (config.fontSize || '24px');
    element.style.fontFamily = config.fontFamily || 'Inter, system-ui, sans-serif';
    element.style.fontWeight = (config.fontWeight || 600).toString();
    element.style.color = config.color?.hex || '#000000';
    
    // Anchor positioning
    element.style.transform = 'translate(-50%, -50%)';
    
    element.textContent = config.text;
    
    return element;
  }

  private async applyTextAnimation(element: HTMLElement, config: TextAnimationConfig): Promise<void> {
    const duration = config.duration;
    const easing = config.easing || 'ease-out';
    
    switch (config.type) {
      case 'typewriter':
        await this.typewriterEffect(element, config);
        break;
      case 'fade-in':
        element.style.opacity = '0';
        element.style.animation = `textFadeIn ${duration}ms ${easing} forwards`;
        break;
      case 'slide-up':
        element.style.transform += ' translateY(50px)';
        element.style.opacity = '0';
        element.style.animation = `textSlideUp ${duration}ms ${easing} forwards`;
        break;
      case 'bounce-in':
        element.style.transform += ' scale(0)';
        element.style.animation = `textBounceIn ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
        break;
      case 'glow':
        element.style.animation = `textGlow ${duration}ms ${easing} infinite alternate`;
        break;
      default:
        element.style.animation = `textFadeIn ${duration}ms ${easing} forwards`;
    }
    
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  private async typewriterEffect(element: HTMLElement, config: TextAnimationConfig): Promise<void> {
    const text = config.text;
    const speed = config.typewriterSpeed || 50;
    const charDelay = 1000 / speed;
    
    element.textContent = '';
    element.style.opacity = '1';
    
    for (let i = 0; i <= text.length; i++) {
      element.textContent = text.substring(0, i);
      if (i < text.length) {
        await new Promise(resolve => setTimeout(resolve, charDelay));
      }
    }
  }

  private async createParticleSystemInstance(config: ParticleConfig, id: string): Promise<ParticleSystemInstance> {
    const particles: HTMLElement[] = [];
    
    const particleSystem: ParticleSystemInstance = {
      id,
      config,
      particles,
      isActive: false,
      
      start: () => {
        particleSystem.isActive = true;
        this.emit('start', { animationId: id, type: 'particle-system', timestamp: Date.now() });
        
        // Create particles
        for (let i = 0; i < config.count; i++) {
          const particle = this.createParticle(config, i);
          particles.push(particle);
          this.container!.appendChild(particle);
        }
      },
      
      stop: () => {
        particleSystem.isActive = false;
        particles.forEach(particle => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        });
        particles.length = 0;
      },
      
      destroy: () => {
        particleSystem.stop();
      },
      
      setQuality: (quality: AnimationQuality) => {
        // Adjust particle count based on quality
        const multiplier = this.getQualityMultiplier(quality);
        const targetCount = Math.floor(config.count * multiplier);
        
        while (particles.length > targetCount) {
          const particle = particles.pop();
          if (particle && particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }
      }
    };
    
    return particleSystem;
  }

  private createParticle(config: ParticleConfig, index: number): HTMLElement {
    const particle = document.createElement('div');
    particle.className = 'enterprise-particle';
    
    particle.style.position = 'absolute';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9998';
    
    // Type-specific styling
    switch (config.type) {
      case 'confetti':
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.backgroundColor = this.getRandomColor();
        particle.style.borderRadius = '2px';
        break;
      case 'stars':
        particle.textContent = '⭐';
        particle.style.fontSize = '16px';
        break;
      case 'sparkles':
        particle.textContent = '✨';
        particle.style.fontSize = '12px';
        break;
      default:
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.backgroundColor = '#FFD700';
        particle.style.borderRadius = '50%';
    }
    
    // Random position and animation
    const angle = (Math.PI * 2 * index) / config.count;
    const velocity = 50 + Math.random() * 50;
    const x = Math.cos(angle) * velocity;
    const y = Math.sin(angle) * velocity;
    
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.transform = 'translate(-50%, -50%)';
    
    // Animate particle
    particle.animate([
      { 
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1
      },
      { 
        transform: `translate(${x - 50}%, ${y - 50}%) scale(0)`,
        opacity: 0
      }
    ], {
      duration: config.lifetime * 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    return particle;
  }

  private async createCharacterInstance(config: CharacterConfig, id: string): Promise<CharacterInstance> {
    const element = this.createCharacterElement(config);
    
    const character: CharacterInstance = {
      id,
      element,
      config,
      position: { ...config.position },
      
      playAnimation: async (animation: string) => {
        const duration = 1000;
        element.style.animation = `character${animation} ${duration}ms ease-out`;
        return new Promise(resolve => setTimeout(resolve, duration));
      },
      
      moveTo: async (position: Vector2D, duration: number) => {
        const startPos = { ...character.position };
        const startTime = performance.now();
        
        return new Promise(resolve => {
          const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = startPos.x + (position.x - startPos.x) * progress;
            const currentY = startPos.y + (position.y - startPos.y) * progress;
            
            element.style.left = `${currentX}px`;
            element.style.top = `${currentY}px`;
            
            character.position.x = currentX;
            character.position.y = currentY;
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          animate();
        });
      },
      
      destroy: () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      },
      
      setQuality: (quality: AnimationQuality) => {
        this.adjustCharacterQuality(element, quality);
      }
    };
    
    this.container!.appendChild(element);
    return character;
  }

  private createCharacterElement(config: CharacterConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'enterprise-character';
    
    element.style.position = 'absolute';
    element.style.left = `${config.position.x}px`;
    element.style.top = `${config.position.y}px`;
    element.style.width = `${config.size}px`;
    element.style.height = `${config.size}px`;
    element.style.fontSize = `${config.size}px`;
    element.style.zIndex = '9997';
    element.style.pointerEvents = 'none';
    
    element.textContent = this.getCharacterEmoji(config.type);
    
    return element;
  }

  private getCharacterEmoji(type: CharacterType): string {
    const characterMap: Record<string, string> = {
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
    
    return characterMap[type] || '😊';
  }

  private getAnimationById(animationId: string): any {
    return this.activeAnimations.get(animationId) ||
           this.activeTextAnimations.get(animationId) ||
           this.activeParticleSystems.get(animationId) ||
           this.activeCharacters.get(animationId);
  }

  private async preloadTextAnimation(config: TextAnimationConfig): Promise<void> {
    const tempElement = this.createTextElement(config);
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.top = '-9999px';
    
    this.container?.appendChild(tempElement);
    tempElement.offsetHeight; // Force layout
    
    if (tempElement.parentNode) {
      tempElement.parentNode.removeChild(tempElement);
    }
  }

  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;
    
    this.isMonitoring = true;
    
    const monitor = () => {
      if (!this.isMonitoring) return;
      
      const now = performance.now();
      if (this.lastFrameTime > 0) {
        const deltaTime = now - this.lastFrameTime;
        const currentFps = 1000 / deltaTime;
        
        this.frameRate = this.frameRate * 0.9 + currentFps * 0.1;
        
        if (deltaTime > (1000 / this.config.targetFrameRate) * 1.5) {
          this.droppedFrames++;
        }
        
        this.frameCount++;
      }
      
      this.lastFrameTime = now;
      
      // Update memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.memoryUsage = memory.usedJSHeapSize / 1024 / 1024;
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
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

  private adjustTextQuality(element: HTMLElement, quality: AnimationQuality): void {
    switch (quality) {
      case 'low':
        element.style.textRendering = 'optimizeSpeed';
        break;
      case 'high':
      case 'ultra':
        element.style.textRendering = 'optimizeLegibility';
        element.style.webkitFontSmoothing = 'antialiased';
        break;
    }
  }

  private adjustCharacterQuality(element: HTMLElement, quality: AnimationQuality): void {
    switch (quality) {
      case 'low':
        element.style.imageRendering = 'pixelated';
        break;
      case 'high':
      case 'ultra':
        element.style.imageRendering = 'high-quality';
        break;
    }
  }

  private getQualityMultiplier(quality: AnimationQuality): number {
    switch (quality) {
      case 'low': return 0.3;
      case 'medium': return 0.6;
      case 'high': return 1.0;
      case 'ultra': return 1.5;
      default: return 1.0;
    }
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private calculateSmoothnessScore(): number {
    const targetFps = this.config.targetFrameRate;
    const actualFps = this.frameRate;
    return Math.min(100, Math.round((actualFps / targetFps) * 100));
  }

  private calculateResponsiveness(): number {
    if (this.frameCount === 0) return 100;
    const consistency = Math.max(0, 100 - (this.droppedFrames / this.frameCount) * 100);
    return Math.round(consistency);
  }

  private calculateBatteryImpact(): 'low' | 'medium' | 'high' {
    const activeCount = this.getActiveAnimations().length;
    const quality = this.config.qualityLevel;
    
    if (activeCount > 10 || quality === 'ultra') return 'high';
    if (activeCount > 5 || quality === 'high') return 'medium';
    return 'low';
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

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    
    const styleId = 'enterprise-animation-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enterprise-animation-element,
      .enterprise-text-animation,
      .enterprise-particle,
      .enterprise-character {
        pointer-events: none;
        user-select: none;
      }
      
      /* Text Animations */
      @keyframes textFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes textSlideUp {
        from { opacity: 0; transform: translate(-50%, -50%) translateY(50px); }
        to { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
      }
      
      @keyframes textBounceIn {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
      
      @keyframes textGlow {
        from { text-shadow: 0 0 5px currentColor; }
        to { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
      }
      
      /* Element Animations */
      @keyframes achievementBounce {
        0% { transform: scale(0) rotate(0deg); }
        50% { transform: scale(1.3) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
      }
      
      @keyframes badgeGlow {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.2); filter: brightness(1.5) drop-shadow(0 0 20px gold); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      
      @keyframes levelUpBurst {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.5); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      @keyframes taskCompleteCheck {
        0% { transform: scale(0) rotate(-45deg); }
        50% { transform: scale(1.2) rotate(0deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes starBurst {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
        100% { transform: scale(0.8) rotate(360deg); opacity: 0; }
      }
      
      @keyframes confettiBurst {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2) rotate(720deg); opacity: 0; }
      }
      
      @keyframes fireworksExplode {
        0% { transform: scale(0); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.8; }
        100% { transform: scale(3); opacity: 0; }
      }
      
      @keyframes successRipple {
        0% { transform: scale(0); opacity: 0.8; }
        100% { transform: scale(4); opacity: 0; }
      }
      
      @keyframes defaultBounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      /* Character Animations */
      @keyframes characterCelebration {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.2) rotate(-5deg); }
        50% { transform: scale(1.3) rotate(5deg); }
        75% { transform: scale(1.1) rotate(-2deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes characterIdle {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-2px) scale(1.02); }
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Type definitions for internal instances
interface TextAnimationInstance {
  id: string;
  element: HTMLElement;
  config: TextAnimationConfig;
  isPlaying: boolean;
  play(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  destroy(): void;
  setQuality(quality: AnimationQuality): void;
}

interface ParticleSystemInstance {
  id: string;
  config: ParticleConfig;
  particles: HTMLElement[];
  isActive: boolean;
  start(): void;
  stop(): void;
  destroy(): void;
  setQuality(quality: AnimationQuality): void;
}

interface CharacterInstance {
  id: string;
  element: HTMLElement;
  config: CharacterConfig;
  position: Vector2D;
  playAnimation(animation: string): Promise<void>;
  moveTo(position: Vector2D, duration: number): Promise<void>;
  destroy(): void;
  setQuality(quality: AnimationQuality): void;
}

// Export singleton instance
export const enterpriseAnimationSystem = EnterpriseAnimationSystem.getInstance(); 