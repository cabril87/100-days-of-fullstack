/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Text Animation Engine
 * Enterprise-grade text animation system with smooth effects
 */

import { 
  TextAnimationConfig, 
  AnimationSystemConfig,
  AnimationQuality,
} from '@/lib/types/animations';

export interface TextAnimation {
  id: string;
  element: HTMLElement;
  config: TextAnimationConfig;
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number;
  pausedTime: number;
  onStart?: () => void;
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
  play(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  destroy(): void;
}

export class TextAnimationEngine {
  private container: HTMLElement | null = null;
  private config: AnimationSystemConfig | null = null;
  private activeAnimations = new Map<string, TextAnimation>();
  private animationId = 0;
  private quality: AnimationQuality = 'high';

  async initialize(container: HTMLElement, config: AnimationSystemConfig): Promise<void> {
    this.container = container;
    this.config = config;
    this.quality = config.qualityLevel;
    
    // Create text animation styles
    this.injectStyles();
  }

  async createAnimation(config: TextAnimationConfig): Promise<TextAnimation> {
    if (!this.container) {
      throw new Error('Text engine not initialized');
    }

    const id = `text_${++this.animationId}_${Date.now()}`;
    const element = this.createElement(config);
    
    const animation: TextAnimation = {
      id,
      element,
      config,
      isPlaying: false,
      isPaused: false,
      startTime: 0,
      pausedTime: 0,
      
      play: async () => {
        if (animation.isPlaying && !animation.isPaused) return;
        
        animation.isPlaying = true;
        animation.isPaused = false;
        animation.startTime = performance.now();
        
        animation.onStart?.();
        
        // Add to container
        this.container!.appendChild(element);
        
        // Apply animation based on type
        await this.applyTextAnimation(animation);
      },
      
      pause: () => {
        if (!animation.isPlaying || animation.isPaused) return;
        animation.isPaused = true;
        animation.pausedTime = performance.now();
        element.style.animationPlayState = 'paused';
      },
      
      resume: () => {
        if (!animation.isPaused) return;
        animation.isPaused = false;
        const pauseDuration = performance.now() - animation.pausedTime;
        animation.startTime += pauseDuration;
        element.style.animationPlayState = 'running';
      },
      
      stop: () => {
        animation.isPlaying = false;
        animation.isPaused = false;
        element.style.animation = 'none';
      },
      
      destroy: () => {
        animation.stop();
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.activeAnimations.delete(id);
      }
    };

    this.activeAnimations.set(id, animation);
    return animation;
  }

  setQuality(quality: AnimationQuality): void {
    this.quality = quality;
    // Adjust quality for active animations
    this.activeAnimations.forEach(animation => {
      this.adjustAnimationQuality(animation, quality);
    });
  }

  async preload(config: TextAnimationConfig): Promise<void> {
    // Pre-create elements and measure text for smooth animations
    const tempElement = this.createElement(config);
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
    this.activeAnimations.forEach(animation => animation.destroy());
    this.activeAnimations.clear();
  }

  private createElement(config: TextAnimationConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'enterprise-text-animation';
    
    // Position
    element.style.position = 'absolute';
    element.style.left = `${config.position.x}px`;
    element.style.top = `${config.position.y}px`;
    element.style.zIndex = (config.zIndex || 1000).toString();
    
    // Typography
    element.style.fontSize = typeof config.fontSize === 'number' ? 
      `${config.fontSize}px` : (config.fontSize || '16px');
    element.style.fontFamily = config.fontFamily || 'Inter, system-ui, sans-serif';
    element.style.fontWeight = (config.fontWeight || 500).toString();
    element.style.textAlign = config.textAlign || 'left';
    element.style.lineHeight = (config.lineHeight || 1.4).toString();
    element.style.letterSpacing = `${config.letterSpacing || 0}px`;
    element.style.wordSpacing = `${config.wordSpacing || 0}px`;
    
    // Color
    if (config.color?.hex) {
      element.style.color = config.color.hex;
    } else if (config.color?.gradient) {
      const gradient = config.color.gradient;
      element.style.background = `${gradient.type}-gradient(${gradient.angle || 0}deg, ${gradient.colors.join(', ')})`;
      element.style.backgroundClip = 'text';
      element.style.webkitBackgroundClip = 'text';
      element.style.webkitTextFillColor = 'transparent';
    }
    
    // Shadow
    if (config.shadowConfig) {
      const shadow = config.shadowConfig;
      element.style.textShadow = `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`;
    }
    
    // Anchor positioning
    this.applyAnchor(element, config.anchor || 'center');
    
    // Set text content
    element.textContent = config.text;
    
    return element;
  }

  private applyAnchor(element: HTMLElement, anchor: string): void {
    switch (anchor) {
      case 'center':
        element.style.transform = 'translate(-50%, -50%)';
        break;
      case 'top-left':
        element.style.transform = 'translate(0%, 0%)';
        break;
      case 'top-right':
        element.style.transform = 'translate(-100%, 0%)';
        break;
      case 'bottom-left':
        element.style.transform = 'translate(0%, -100%)';
        break;
      case 'bottom-right':
        element.style.transform = 'translate(-100%, -100%)';
        break;
    }
  }

  private async applyTextAnimation(animation: TextAnimation): Promise<void> {
    const { element, config } = animation;
    const duration = config.duration;
    const easing = config.easing || 'ease-out';
    
    switch (config.type) {
      case 'typewriter':
        await this.typewriterAnimation(animation);
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
        
      case 'slide-down':
        element.style.transform += ' translateY(-50px)';
        element.style.opacity = '0';
        element.style.animation = `textSlideDown ${duration}ms ${easing} forwards`;
        break;
        
      case 'slide-left':
        element.style.transform += ' translateX(50px)';
        element.style.opacity = '0';
        element.style.animation = `textSlideLeft ${duration}ms ${easing} forwards`;
        break;
        
      case 'slide-right':
        element.style.transform += ' translateX(-50px)';
        element.style.opacity = '0';
        element.style.animation = `textSlideRight ${duration}ms ${easing} forwards`;
        break;
        
      case 'scale-in':
        element.style.transform += ' scale(0)';
        element.style.opacity = '0';
        element.style.animation = `textScaleIn ${duration}ms ${easing} forwards`;
        break;
        
      case 'bounce-in':
        element.style.transform += ' scale(0)';
        element.style.animation = `textBounceIn ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
        break;
        
      case 'flip-in':
        element.style.transform += ' rotateY(90deg)';
        element.style.opacity = '0';
        element.style.animation = `textFlipIn ${duration}ms ${easing} forwards`;
        break;
        
      case 'rotate-in':
        element.style.transform += ' rotate(180deg)';
        element.style.opacity = '0';
        element.style.animation = `textRotateIn ${duration}ms ${easing} forwards`;
        break;
        
      case 'highlight':
        await this.highlightAnimation(animation);
        break;
        
      case 'glow':
        element.style.animation = `textGlow ${duration}ms ${easing} infinite alternate`;
        break;
        
      case 'rainbow':
        element.style.animation = `textRainbow ${duration}ms linear infinite`;
        break;
        
      case 'counter':
        await this.counterAnimation(animation);
        break;
        
      default:
        element.style.animation = `textFadeIn ${duration}ms ${easing} forwards`;
    }
    
    // Handle animation completion
    setTimeout(() => {
      animation.isPlaying = false;
      animation.onComplete?.();
      
      if (config.autoDestroy !== false) {
        setTimeout(() => animation.destroy(), 500);
      }
    }, duration + (config.delay || 0));
  }

  private async typewriterAnimation(animation: TextAnimation): Promise<void> {
    const { element, config } = animation;
    const text = config.text;
    const speed = config.typewriterSpeed || 50; // chars per second
    const charDelay = 1000 / speed;
    
    element.textContent = '';
    element.style.opacity = '1';
    
    for (let i = 0; i <= text.length; i++) {
      if (!animation.isPlaying) break;
      
      element.textContent = text.substring(0, i);
      config.onUpdate?.(i / text.length);
      
      if (i < text.length) {
        await new Promise(resolve => setTimeout(resolve, charDelay));
      }
    }
  }

  private async highlightAnimation(animation: TextAnimation): Promise<void> {
    const { element, config } = animation;
    const highlightColor = config.highlightColor?.hex || '#ffff00';
    
    element.style.background = `linear-gradient(90deg, transparent 0%, ${highlightColor} 50%, transparent 100%)`;
    element.style.backgroundSize = '200% 100%';
    element.style.backgroundPosition = '-100% 0';
    element.style.animation = `textHighlight ${config.duration}ms ease-in-out forwards`;
  }

  private async counterAnimation(animation: TextAnimation): Promise<void> {
    const { element, config } = animation;
    const targetValue = parseInt(config.text) || 0;
    const duration = config.duration;
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(targetValue * this.easeOutQuart(progress));
      
      element.textContent = currentValue.toLocaleString();
      config.onUpdate?.(progress);
      
      if (progress < 1 && animation.isPlaying) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  private easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }

  private adjustAnimationQuality(animation: TextAnimation, quality: AnimationQuality): void {
    const element = animation.element;
    const style = element.style as CSSStyleDeclaration & { 
      fontSmooth?: string; 
      webkitFontSmoothing?: string; 
    };
    
    switch (quality) {
      case 'low':
        element.style.textRendering = 'optimizeSpeed';
        style.fontSmooth = 'never';
        break;
      case 'medium':
        element.style.textRendering = 'auto';
        break;
      case 'high':
      case 'ultra':
        element.style.textRendering = 'optimizeLegibility';
        style.fontSmooth = 'always';
        style.webkitFontSmoothing = 'antialiased';
        break;
    }
  }

  private injectStyles(): void {
    if (typeof document === 'undefined') return;
    
    const styleId = 'enterprise-text-animations';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enterprise-text-animation {
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
      }
      
      @keyframes textFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes textSlideUp {
        from { 
          opacity: 0; 
          transform: translateY(50px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      @keyframes textSlideDown {
        from { 
          opacity: 0; 
          transform: translateY(-50px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      @keyframes textSlideLeft {
        from { 
          opacity: 0; 
          transform: translateX(50px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }
      
      @keyframes textSlideRight {
        from { 
          opacity: 0; 
          transform: translateX(-50px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }
      
      @keyframes textScaleIn {
        from { 
          opacity: 0; 
          transform: scale(0); 
        }
        to { 
          opacity: 1; 
          transform: scale(1); 
        }
      }
      
      @keyframes textBounceIn {
        0% { 
          transform: scale(0); 
          opacity: 0; 
        }
        50% { 
          transform: scale(1.1); 
          opacity: 1; 
        }
        100% { 
          transform: scale(1); 
          opacity: 1; 
        }
      }
      
      @keyframes textFlipIn {
        from { 
          opacity: 0; 
          transform: rotateY(90deg); 
        }
        to { 
          opacity: 1; 
          transform: rotateY(0deg); 
        }
      }
      
      @keyframes textRotateIn {
        from { 
          opacity: 0; 
          transform: rotate(180deg); 
        }
        to { 
          opacity: 1; 
          transform: rotate(0deg); 
        }
      }
      
      @keyframes textHighlight {
        from { background-position: -100% 0; }
        to { background-position: 100% 0; }
      }
      
      @keyframes textGlow {
        from { 
          text-shadow: 0 0 5px currentColor; 
        }
        to { 
          text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; 
        }
      }
      
      @keyframes textRainbow {
        0% { color: #ff0000; }
        16.66% { color: #ff8000; }
        33.33% { color: #ffff00; }
        50% { color: #80ff00; }
        66.66% { color: #00ff80; }
        83.33% { color: #0080ff; }
        100% { color: #8000ff; }
      }
    `;
    
    document.head.appendChild(style);
  }
} 