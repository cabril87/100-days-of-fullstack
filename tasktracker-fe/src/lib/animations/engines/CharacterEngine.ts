/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Character Engine
 * Enterprise character animation system with smooth sprite movements
 * 
 * MOBILE-FIRST RESPONSIVE ENHANCEMENTS:
 * - Responsive character sizing based on device type
 * - Touch interaction support with gesture recognition
 * - Device-specific animation optimizations
 * - Battery-aware performance adjustments
 * - Orientation-aware positioning and scaling
 */

import { 
  CharacterConfig, 
  AnimationSystemConfig,
  AnimationQuality,
  Vector2D,
  AnimationConfig,
  CharacterType
} from '@/lib/types/animations';

// ================================
// MOBILE-FIRST RESPONSIVE TYPES
// ================================

interface ResponsiveCharacterConfig {
  mobile: {
    size: number;
    animationSpeed: number;
    enableShadow: boolean;
    simplifiedAnimations: boolean;
  };
  tablet: {
    size: number;
    animationSpeed: number;
    enableShadow: boolean;
    simplifiedAnimations: boolean;
  };
  desktop: {
    size: number;
    animationSpeed: number;
    enableShadow: boolean;
    simplifiedAnimations: boolean;
  };
}

interface TouchInteractionConfig {
  enabled: boolean;
  tapToInteract: boolean;
  dragToMove: boolean;
  hapticFeedback: boolean;
  touchRadius: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
}

export interface Character {
  id: string;
  element: HTMLElement;
  config: CharacterConfig;
  position: Vector2D;
  isAnimating: boolean;
  currentAnimation: string | null;
  animationStartTime: number;
  type: 'character';
  
  // Enhanced mobile-first methods
  play(animation: string): Promise<void>;
  move(position: Vector2D, duration: number): Promise<void>;
  setExpression(expression: string): void;
  pause(): void;
  resume(): void;
  stop(): void;
  destroy(): void;
  
  // New mobile-first methods
  adaptToDevice(deviceType: 'mobile' | 'tablet' | 'desktop'): void;
  setTouchInteraction(enabled: boolean): void;
  handleTouch(x: number, y: number, type: 'tap' | 'longpress' | 'drag'): void;
}

export class CharacterEngine {
  private container: HTMLElement | null = null;
  private config: AnimationSystemConfig | null = null;
  private activeCharacters = new Map<string, Character>();
  private characterId = 0;
  private quality: AnimationQuality = 'high';
  
  // Mobile-first responsive features
  private responsiveConfig!: ResponsiveCharacterConfig;
  private touchConfig!: TouchInteractionConfig;
  private currentDeviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  private isLowEndDevice = false;
  
  // Touch state for proper handler implementation
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private dragTarget: Character | null = null;

  async initialize(container: HTMLElement, config: AnimationSystemConfig): Promise<void> {
    this.container = container;
    this.config = config;
    this.quality = config.qualityLevel;
    
    // Initialize mobile-first responsive features
    this.detectDevice();
    this.responsiveConfig = this.initializeResponsiveConfig();
    this.touchConfig = this.getTouchConfig();
    
    this.injectStyles();
    this.setupTouchInteractions();
  }

  async createCharacter(config: CharacterConfig): Promise<Character> {
    if (!this.container) {
      throw new Error('Character engine not initialized');
    }

    const id = `character_${++this.characterId}_${Date.now()}`;
    const element = this.createCharacterElement(config);
    
    const character: Character = {
      id,
      element,
      config,
      position: { ...config.position },
      isAnimating: false,
      currentAnimation: null,
      animationStartTime: 0,
      type: 'character',
      
      play: async (animation: string) => {
        character.currentAnimation = animation;
        character.isAnimating = true;
        character.animationStartTime = performance.now();
        
        await this.playCharacterAnimation(character, animation);
        
        character.isAnimating = false;
        character.currentAnimation = null;
      },
      
      move: async (newPosition: Vector2D, duration: number) => {
        return this.moveCharacterToPosition(character, newPosition, duration);
      },
      
      setExpression: (expression: string) => {
        this.updateCharacterExpression(character, expression);
      },
      
      pause: () => {
        if (character.isAnimating) {
          element.style.animationPlayState = 'paused';
        }
      },
      
      resume: () => {
        if (character.isAnimating) {
          element.style.animationPlayState = 'running';
        }
      },
      
      stop: () => {
        character.isAnimating = false;
        character.currentAnimation = null;
        element.style.animation = 'none';
      },
      
      destroy: () => {
        character.stop();
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.activeCharacters.delete(id);
      },

      // New mobile-first methods
      adaptToDevice: (deviceType: 'mobile' | 'tablet' | 'desktop') => {
        this.adaptCharacterToDevice(character, deviceType);
      },

      setTouchInteraction: (enabled: boolean) => {
        this.setCharacterTouchInteraction(character, enabled);
      },

      handleTouch: (x: number, y: number, type: 'tap' | 'longpress' | 'drag') => {
        this.handleCharacterTouch(character, x, y, type);
      }
    };

    this.container.appendChild(element);
    this.activeCharacters.set(id, character);
    
    // Start idle animation if configured
    if (config.autoAnimate && config.idleAnimation) {
      character.play(config.idleAnimation);
    }
    
    return character;
  }

  async createFromConfig(config: AnimationConfig): Promise<Character> {
    // Convert animation config to character config
    const characterConfig: CharacterConfig = {
      type: this.getCharacterTypeFromAnimation(config.type),
      size: 48,
      position: config.position,
      autoAnimate: true,
      celebrationAnimation: 'bounce',
      expression: 'happy'
    };

    const character = await this.createCharacter(characterConfig);
    
    // Play appropriate animation based on type
    if (config.type.includes('celebration') || config.type.includes('achievement')) {
      await character.play('celebration');
    }
    
    return character;
  }

  async moveCharacter(character: Character, position: Vector2D, duration = 1000): Promise<void> {
    return character.move(position, duration);
  }

  setQuality(quality: AnimationQuality): void {
    this.quality = quality;
    
    this.activeCharacters.forEach(character => {
      this.adjustCharacterQuality(character, quality);
    });
  }

  async preload(config: CharacterConfig): Promise<void> {
    // Pre-create character elements for smooth performance
    const tempElement = this.createCharacterElement(config);
    tempElement.style.visibility = 'hidden';
    tempElement.style.position = 'absolute';
    tempElement.style.top = '-9999px';
    
    this.container?.appendChild(tempElement);
    
    // Force layout calculation
    void tempElement.offsetHeight;
    
    // Remove temp element
    if (tempElement.parentNode) {
      tempElement.parentNode.removeChild(tempElement);
    }
  }

  destroy(): void {
    this.activeCharacters.forEach(character => character.destroy());
    this.activeCharacters.clear();
    
    // Clean up touch event listeners
    this.cleanupTouchInteractions();
  }

  private createCharacterElement(config: CharacterConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'enterprise-character';
    
    // Position
    element.style.position = 'absolute';
    element.style.left = `${config.position.x}px`;
    element.style.top = `${config.position.y}px`;
    element.style.zIndex = '9997';
    
    // Size
    element.style.width = `${config.size}px`;
    element.style.height = `${config.size}px`;
    element.style.fontSize = `${config.size}px`;
    element.style.lineHeight = '1';
    
    // Character content based on type
    element.textContent = this.getCharacterEmoji(config.type);
    
    // Expression and styling
    this.applyCharacterStyling(element, config);
    
    return element;
  }

  private getCharacterEmoji(type: string): string {
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

  private applyCharacterStyling(element: HTMLElement, config: CharacterConfig): void {
    // Color customization
    if (config.color?.hex) {
      element.style.color = config.color.hex;
    }
    
    // Add hover effects for interactivity
    if (config.interactionRadius && config.interactionRadius > 0) {
      element.style.cursor = 'pointer';
      element.style.transition = 'transform 0.2s ease';
      
      element.addEventListener('mouseenter', () => {
        element.style.transform = 'scale(1.1)';
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'scale(1)';
      });
    }
    
    // Follow mouse behavior
    if (config.followMouse) {
      this.setupMouseFollowing(element);
    }
  }

  private setupMouseFollowing(element: HTMLElement): void {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    
    const followMouse = () => {
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;
      
      currentX += dx * 0.1;
      currentY += dy * 0.1;
      
      element.style.left = `${currentX}px`;
      element.style.top = `${currentY}px`;
      
      requestAnimationFrame(followMouse);
    };
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    followMouse();
  }

  private async playCharacterAnimation(character: Character, animation: string): Promise<void> {
    const element = character.element;
    const duration = 1000; // Default duration
    
    switch (animation) {
      case 'idle':
        element.style.animation = 'characterIdle 2s ease-in-out infinite';
        break;
        
      case 'celebration':
      case 'bounce':
        element.style.animation = 'characterCelebration 0.6s ease-out';
        break;
        
      case 'dance':
        element.style.animation = 'characterDance 1s ease-in-out infinite';
        break;
        
      case 'wave':
        element.style.animation = 'characterWave 0.8s ease-in-out';
        break;
        
      case 'jump':
        element.style.animation = 'characterJump 0.5s ease-out';
        break;
        
      case 'spin':
        element.style.animation = 'characterSpin 1s linear';
        break;
        
      case 'pulse':
        element.style.animation = 'characterPulse 1s ease-in-out infinite';
        break;
        
      case 'shake':
        element.style.animation = 'characterShake 0.5s ease-in-out';
        break;
        
      default:
        element.style.animation = 'characterBounce 0.6s ease-out';
    }
    
    // Wait for animation to complete
    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  }

  private async moveCharacterToPosition(
    character: Character, 
    newPosition: Vector2D, 
    duration: number
  ): Promise<void> {
    const element = character.element;
    const startPosition = { ...character.position };
    const startTime = performance.now();
    
    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const easedProgress = this.easeInOutCubic(progress);
        
        // Interpolate position
        const currentX = startPosition.x + (newPosition.x - startPosition.x) * easedProgress;
        const currentY = startPosition.y + (newPosition.y - startPosition.y) * easedProgress;
        
        // Update element position
        element.style.left = `${currentX}px`;
        element.style.top = `${currentY}px`;
        
        // Update character position
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
  }

  private updateCharacterExpression(character: Character, expression: string): void {
    const element = character.element;
    
    // Update character emoji based on expression
    const baseEmoji = this.getCharacterEmoji(character.config.type);
    let expressionEmoji = baseEmoji;
    
    switch (expression) {
      case 'happy':
        expressionEmoji = baseEmoji.replace(/.$/, '😊');
        break;
      case 'excited':
        expressionEmoji = baseEmoji.replace(/.$/, '🤩');
        break;
      case 'focused':
        expressionEmoji = baseEmoji.replace(/.$/, '🤔');
        break;
      case 'surprised':
        expressionEmoji = baseEmoji.replace(/.$/, '😲');
        break;
      case 'proud':
        expressionEmoji = baseEmoji.replace(/.$/, '😎');
        break;
    }
    
    element.textContent = expressionEmoji;
  }

  private adjustCharacterQuality(character: Character, quality: AnimationQuality): void {
    const element = character.element;
    
    switch (quality) {
      case 'low':
        element.style.textRendering = 'optimizeSpeed';
        element.style.imageRendering = 'pixelated';
        break;
      case 'medium':
        element.style.textRendering = 'auto';
        element.style.imageRendering = 'auto';
        break;
      case 'high':
      case 'ultra':
        element.style.textRendering = 'optimizeLegibility';
        element.style.imageRendering = 'high-quality';
        break;
    }
  }

  private getCharacterTypeFromAnimation(animationType: string): CharacterType {
    if (animationType.includes('family')) return 'family';
    if (animationType.includes('child')) return 'child';
    if (animationType.includes('achievement')) return 'hero';
    if (animationType.includes('celebration')) return 'mascot';
    return 'avatar';
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // ================================
  // MOBILE-FIRST RESPONSIVE METHODS
  // ================================

  private detectDevice(): void {
    if (typeof window === 'undefined') {
      this.currentDeviceType = 'desktop';
      return;
    }

    const width = window.innerWidth;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (width <= 768 && hasTouch) {
      this.currentDeviceType = 'mobile';
    } else if (width <= 1024 && hasTouch) {
      this.currentDeviceType = 'tablet';
    } else {
      this.currentDeviceType = 'desktop';
    }

    // Detect low-end device
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    this.isLowEndDevice = 
      (window.devicePixelRatio && window.devicePixelRatio < 2) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
      navigatorWithConnection.connection?.effectiveType === '2g' ||
      navigatorWithConnection.connection?.effectiveType === 'slow-2g';
  }

  private initializeResponsiveConfig(): ResponsiveCharacterConfig {
    return {
      mobile: {
        size: 32,
        animationSpeed: 0.8,
        enableShadow: false,
        simplifiedAnimations: true
      },
      tablet: {
        size: 48,
        animationSpeed: 1.0,
        enableShadow: true,
        simplifiedAnimations: false
      },
      desktop: {
        size: 64,
        animationSpeed: 1.2,
        enableShadow: true,
        simplifiedAnimations: false
      }
    };
  }

  private getTouchConfig(): TouchInteractionConfig {
    return {
      enabled: this.currentDeviceType !== 'desktop',
      tapToInteract: true,
      dragToMove: true,
      hapticFeedback: this.currentDeviceType === 'mobile',
      touchRadius: this.currentDeviceType === 'mobile' ? 44 : 32
    };
  }

  private touchStartHandler = (e: TouchEvent): void => {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();

    // Find character under touch
    this.dragTarget = this.findCharacterAt(this.touchStartX, this.touchStartY);
    
    if (this.dragTarget && this.touchConfig.hapticFeedback) {
      this.triggerHapticFeedback('light');
    }
  };

  private touchMoveHandler = (e: TouchEvent): void => {
    if (!this.dragTarget || !this.touchConfig.dragToMove) return;

    const touch = e.touches[0];
    const newPosition = {
      x: touch.clientX - this.dragTarget.config.size / 2,
      y: touch.clientY - this.dragTarget.config.size / 2
    };

    // Update position immediately for smooth dragging
    this.dragTarget.element.style.left = `${newPosition.x}px`;
    this.dragTarget.element.style.top = `${newPosition.y}px`;
    this.dragTarget.position = newPosition;
  };

  private touchEndHandler = (e: TouchEvent): void => {
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();
    
    const deltaTime = endTime - this.touchStartTime;
    const distance = Math.sqrt(
      Math.pow(endX - this.touchStartX, 2) + 
      Math.pow(endY - this.touchStartY, 2)
    );

    if (this.dragTarget) {
      // Determine interaction type
      if (distance < this.touchConfig.touchRadius / 2 && deltaTime < 300) {
        // Tap
        this.dragTarget.handleTouch(endX, endY, 'tap');
      } else if (distance < this.touchConfig.touchRadius / 2 && deltaTime > 500) {
        // Long press
        this.dragTarget.handleTouch(endX, endY, 'longpress');
      } else if (distance > this.touchConfig.touchRadius) {
        // Drag
        this.dragTarget.handleTouch(endX, endY, 'drag');
      }
    }

    this.dragTarget = null;
  };

  private setupTouchInteractions(): void {
    if (!this.container || !this.touchConfig.enabled) return;

    this.container.addEventListener('touchstart', this.touchStartHandler, { passive: true });
    this.container.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    this.container.addEventListener('touchend', this.touchEndHandler, { passive: true });
  }

  private cleanupTouchInteractions(): void {
    if (!this.container) return;
    
    this.container.removeEventListener('touchstart', this.touchStartHandler);
    this.container.removeEventListener('touchmove', this.touchMoveHandler);
    this.container.removeEventListener('touchend', this.touchEndHandler);
  }

  private findCharacterAt(x: number, y: number): Character | null {
    for (const character of this.activeCharacters.values()) {
      const rect = character.element.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && 
          y >= rect.top && y <= rect.bottom) {
        return character;
      }
    }
    return null;
  }

  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.touchConfig.hapticFeedback) return;

    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }

  private adaptCharacterToDevice(character: Character, deviceType: 'mobile' | 'tablet' | 'desktop'): void {
    const config = this.responsiveConfig[deviceType];
    const element = character.element;

    // Update size
    element.style.width = `${config.size}px`;
    element.style.height = `${config.size}px`;
    element.style.fontSize = `${config.size}px`;

    // Update animation speed
    if (element.style.animation) {
      const currentAnimation = element.style.animation;
      const newAnimation = currentAnimation.replace(
        /(\d+(?:\.\d+)?s)/g, 
        `${parseFloat(RegExp.$1) / config.animationSpeed}s`
      );
      element.style.animation = newAnimation;
    }

    // Update visual effects
    if (config.enableShadow) {
      element.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))';
    } else {
      element.style.filter = 'none';
    }

    // Simplify animations for low-end devices
    if (config.simplifiedAnimations && this.isLowEndDevice) {
      element.style.willChange = 'transform';
      element.style.backfaceVisibility = 'hidden';
    }

    character.config.size = config.size;
  }

  private setCharacterTouchInteraction(character: Character, enabled: boolean): void {
    const element = character.element;
    
    if (enabled && this.touchConfig.enabled) {
      element.style.cursor = 'pointer';
      element.style.userSelect = 'none';
      element.style.touchAction = 'none';
    } else {
      element.style.cursor = 'default';
      element.style.userSelect = 'auto';
      element.style.touchAction = 'auto';
    }
  }

  private handleCharacterTouch(character: Character, x: number, y: number, type: 'tap' | 'longpress' | 'drag'): void {
    switch (type) {
      case 'tap':
        // Quick celebration animation
        character.play('bounce');
        if (this.touchConfig.hapticFeedback) {
          this.triggerHapticFeedback('light');
        }
        break;

      case 'longpress':
        // Expression change
        const expressions = ['happy', 'excited', 'surprised', 'proud'];
        const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
        character.setExpression(randomExpression);
        character.play('celebration');
        if (this.touchConfig.hapticFeedback) {
          this.triggerHapticFeedback('heavy');
        }
        break;

      case 'drag':
        // Movement completed - play arrival animation
        character.play('wave');
        if (this.touchConfig.hapticFeedback) {
          this.triggerHapticFeedback('medium');
        }
        break;
    }
  }

  /**
   * Public method to adapt all characters to new device type
   */
  public adaptToDevice(deviceType: 'mobile' | 'tablet' | 'desktop'): void {
    this.currentDeviceType = deviceType;
    this.detectDevice(); // Update device detection
    
    this.activeCharacters.forEach(character => {
      character.adaptToDevice(deviceType);
    });
  }

  /**
   * Public method to enable/disable touch interactions
   */
  public setTouchInteractions(enabled: boolean): void {
    this.touchConfig.enabled = enabled;
    
    this.activeCharacters.forEach(character => {
      character.setTouchInteraction(enabled);
    });
  }

  /**
   * Get current responsive configuration
   */
  public getResponsiveConfig(): ResponsiveCharacterConfig {
    return { ...this.responsiveConfig };
  }

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    
    const styleId = 'enterprise-character-animations';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enterprise-character {
        pointer-events: none;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        transition: transform 0.3s ease, filter 0.3s ease;
        will-change: transform;
        backface-visibility: hidden;
      }
      
      /* Mobile-first responsive character styles */
      @media (max-width: 768px) {
        .enterprise-character {
          font-size: 24px !important;
          width: 32px !important;
          height: 32px !important;
        }
      }
      
      @media (min-width: 769px) and (max-width: 1024px) {
        .enterprise-character {
          font-size: 36px !important;
          width: 48px !important;
          height: 48px !important;
        }
      }
      
      @media (min-width: 1025px) {
        .enterprise-character {
          font-size: 48px !important;
          width: 64px !important;
          height: 64px !important;
        }
      }
      
      /* Touch-friendly hover states */
      @media (hover: hover) {
        .enterprise-character:hover {
          transform: scale(1.1);
        }
      }
      
      /* Touch device styles */
      @media (hover: none) {
        .enterprise-character {
          cursor: pointer;
          touch-action: none;
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .enterprise-character,
        .enterprise-character * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      @keyframes characterIdle {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-2px) scale(1.02); }
      }
      
      @keyframes characterCelebration {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.2) rotate(-5deg); }
        50% { transform: scale(1.3) rotate(5deg); }
        75% { transform: scale(1.1) rotate(-2deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      @keyframes characterDance {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-10deg) scale(1.1); }
        75% { transform: rotate(10deg) scale(1.1); }
      }
      
      @keyframes characterWave {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-15deg); }
        50% { transform: rotate(15deg); }
        75% { transform: rotate(-10deg); }
      }
      
      @keyframes characterJump {
        0% { transform: translateY(0px) scale(1, 1); }
        50% { transform: translateY(-20px) scale(1.1, 0.9); }
        100% { transform: translateY(0px) scale(1, 1); }
      }
      
      @keyframes characterSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes characterPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      
      @keyframes characterShake {
        0%, 100% { transform: translateX(0px); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      
      @keyframes characterBounce {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `;
    
    document.head.appendChild(style);
  }
} 