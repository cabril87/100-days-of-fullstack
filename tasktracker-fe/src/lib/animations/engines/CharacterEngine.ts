/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Character Engine
 * Enterprise character animation system with smooth sprite movements
 */

import { 
  CharacterConfig, 
  AnimationSystemConfig,
  AnimationQuality,
  Vector2D,
  AnimationConfig,
  CharacterType
} from '@/lib/types/animations';

export interface Character {
  id: string;
  element: HTMLElement;
  config: CharacterConfig;
  position: Vector2D;
  isAnimating: boolean;
  currentAnimation: string | null;
  animationStartTime: number;
  type: 'character';
  
  play(animation: string): Promise<void>;
  move(position: Vector2D, duration: number): Promise<void>;
  setExpression(expression: string): void;
  pause(): void;
  resume(): void;
  stop(): void;
  destroy(): void;
}

export class CharacterEngine {
  private container: HTMLElement | null = null;
  private config: AnimationSystemConfig | null = null;
  private activeCharacters = new Map<string, Character>();
  private characterId = 0;
  private quality: AnimationQuality = 'high';

  async initialize(container: HTMLElement, config: AnimationSystemConfig): Promise<void> {
    this.container = container;
    this.config = config;
    this.quality = config.qualityLevel;
    
    this.injectStyles();
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