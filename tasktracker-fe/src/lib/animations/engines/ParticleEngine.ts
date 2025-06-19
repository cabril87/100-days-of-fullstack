/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Particle Engine
 * High-performance particle system for enterprise animations
 */

import { 
  ParticleConfig, 
  AnimationSystemConfig,
  AnimationQuality,
  Vector2D,
  AnimationConfig
} from '@/lib/types/animations';

interface Particle {
  id: string;
  element: HTMLElement;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationVelocity: number;
  opacity: number;
  color: string;
}

export interface ParticleSystem {
  id: string;
  particles: Particle[];
  config: ParticleConfig;
  isActive: boolean;
  startTime: number;
  lastUpdate: number;
  emissionTimer: number;
  play(): void;
  pause(): void;
  resume(): void;
  stop(): void;
  destroy(): void;
}

export class ParticleEngine {
  private container: HTMLElement | null = null;
  private config: AnimationSystemConfig | null = null;
  private activeSystems = new Map<string, ParticleSystem>();
  private systemId = 0;
  private quality: AnimationQuality = 'high';
  private animationFrame: number | null = null;

  async initialize(container: HTMLElement, config: AnimationSystemConfig): Promise<void> {
    this.container = container;
    this.config = config;
    this.quality = config.qualityLevel;
    
    this.startUpdateLoop();
  }

  async createSystem(config: ParticleConfig): Promise<ParticleSystem> {
    if (!this.container) {
      throw new Error('Particle engine not initialized');
    }

    const id = `particle_${++this.systemId}_${Date.now()}`;
    
    const system: ParticleSystem = {
      id,
      particles: [],
      config,
      isActive: false,
      startTime: 0,
      lastUpdate: 0,
      emissionTimer: 0,
      
      play: () => {
        system.isActive = true;
        system.startTime = performance.now();
        system.lastUpdate = system.startTime;
      },
      
      pause: () => {
        system.isActive = false;
      },
      
      resume: () => {
        system.isActive = true;
        system.lastUpdate = performance.now();
      },
      
      stop: () => {
        system.isActive = false;
        system.particles.forEach(particle => {
          if (particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
          }
        });
        system.particles = [];
      },
      
      destroy: () => {
        system.stop();
        this.activeSystems.delete(id);
      }
    };

    this.activeSystems.set(id, system);
    system.play();
    
    return system;
  }

  async createFromConfig(config: AnimationConfig): Promise<ParticleSystem> {
    // Convert animation config to particle config
    const particleConfig: ParticleConfig = {
      type: this.getParticleTypeFromAnimation(config.type),
      count: this.getParticleCount(config.type),
      lifetime: config.duration / 1000,
      velocity: {
        initial: { x: 0, y: -100 },
        variation: { x: 50, y: 50 }
      },
      size: {
        start: 4,
        end: 0,
        variation: 2
      },
      color: {
        start: config.color || { hex: '#FFD700' }
      }
    };

    return this.createSystem(particleConfig);
  }

  setQuality(quality: AnimationQuality): void {
    this.quality = quality;
    
    // Adjust particle counts based on quality
    this.activeSystems.forEach(system => {
      const multiplier = this.getQualityMultiplier(quality);
      const targetCount = Math.floor(system.config.count * multiplier);
      
      // Adjust particle count
      while (system.particles.length > targetCount) {
        const particle = system.particles.pop();
        if (particle && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      }
    });
  }

  async preload(config: ParticleConfig): Promise<void> {
    // Pre-create particle elements for smooth performance
    const tempElements = [];
    
    for (let i = 0; i < Math.min(config.count, 50); i++) {
      const element = this.createParticleElement(config);
      element.style.visibility = 'hidden';
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      
      this.container?.appendChild(element);
      tempElements.push(element);
    }
    
    // Force layout calculation
    tempElements.forEach(el => el.offsetHeight);
    
    // Remove temp elements
    tempElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }

  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.activeSystems.forEach(system => system.destroy());
    this.activeSystems.clear();
  }

  private startUpdateLoop(): void {
    const update = () => {
      const now = performance.now();
      
      this.activeSystems.forEach(system => {
        if (system.isActive) {
          this.updateSystem(system, now);
        }
      });
      
      this.animationFrame = requestAnimationFrame(update);
    };
    
    update();
  }

  private updateSystem(system: ParticleSystem, now: number): void {
    const deltaTime = (now - system.lastUpdate) / 1000;
    system.lastUpdate = now;
    
    // Emit new particles
    if (system.config.emissionRate && system.particles.length < system.config.count) {
      system.emissionTimer += deltaTime;
      const emissionInterval = 1 / system.config.emissionRate;
      
      while (system.emissionTimer >= emissionInterval && system.particles.length < system.config.count) {
        this.emitParticle(system);
        system.emissionTimer -= emissionInterval;
      }
    } else if (!system.config.emissionRate && system.particles.length === 0) {
      // Burst emission
      for (let i = 0; i < system.config.count; i++) {
        this.emitParticle(system);
      }
    }
    
    // Update existing particles
    for (let i = system.particles.length - 1; i >= 0; i--) {
      const particle = system.particles[i];
      
      // Update life
      particle.life += deltaTime;
      
      if (particle.life >= particle.maxLife) {
        // Remove dead particle
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
        system.particles.splice(i, 1);
        continue;
      }
      
      // Update physics
      this.updateParticle(particle, deltaTime);
      
      // Update visual
      this.updateParticleVisual(particle, system.config);
    }
    
    // Check if system should be destroyed
    if (system.particles.length === 0 && now - system.startTime > system.config.lifetime * 1000) {
      system.destroy();
    }
  }

  private emitParticle(system: ParticleSystem): void {
    if (!this.container) return;
    
    const config = system.config;
    const element = this.createParticleElement(config);
    
    // Position
    const position = this.getEmissionPosition(config);
    
    // Velocity with variation
    const velocity = {
      x: config.velocity.initial.x + (Math.random() - 0.5) * config.velocity.variation.x,
      y: config.velocity.initial.y + (Math.random() - 0.5) * config.velocity.variation.y
    };
    
    // Size with variation
    const sizeVariation = config.size.variation || 0;
    const size = config.size.start + (Math.random() - 0.5) * sizeVariation;
    
    const particle: Particle = {
      id: `particle_${Date.now()}_${Math.random()}`,
      element,
      position: { ...position },
      velocity,
      acceleration: config.acceleration || { x: 0, y: 0 },
      life: 0,
      maxLife: config.lifetime,
      size,
      rotation: config.rotation?.initial || 0,
      rotationVelocity: config.rotation?.velocity || 0,
      opacity: 1,
      color: this.getParticleColor(config.color.start)
    };
    
    this.container.appendChild(element);
    system.particles.push(particle);
    
    // Initial visual update
    this.updateParticleVisual(particle, config);
  }

  private updateParticle(particle: Particle, deltaTime: number): void {
    // Apply physics
    particle.velocity.x += particle.acceleration.x * deltaTime;
    particle.velocity.y += particle.acceleration.y * deltaTime;
    
    // Apply gravity if configured
    if (this.config && 'gravity' in this.config) {
      particle.velocity.y += (this.config as any).gravity * deltaTime;
    }
    
    // Apply friction if configured
    if (this.config && 'friction' in this.config) {
      const friction = (this.config as any).friction;
      particle.velocity.x *= (1 - friction * deltaTime);
      particle.velocity.y *= (1 - friction * deltaTime);
    }
    
    // Update position
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    
    // Update rotation
    particle.rotation += particle.rotationVelocity * deltaTime;
  }

  private updateParticleVisual(particle: Particle, config: ParticleConfig): void {
    const element = particle.element;
    const lifeProgress = particle.life / particle.maxLife;
    
    // Position
    element.style.left = `${particle.position.x}px`;
    element.style.top = `${particle.position.y}px`;
    
    // Size interpolation
    const currentSize = config.size.start + (config.size.end - config.size.start) * lifeProgress;
    element.style.width = `${currentSize}px`;
    element.style.height = `${currentSize}px`;
    
    // Opacity
    particle.opacity = 1 - lifeProgress;
    element.style.opacity = particle.opacity.toString();
    
    // Rotation
    element.style.transform = `rotate(${particle.rotation}deg)`;
    
    // Color interpolation
    if (config.color.end) {
      const color = this.interpolateColor(
        config.color.start,
        config.color.end,
        lifeProgress
      );
      element.style.backgroundColor = color;
    }
  }

  private createParticleElement(config: ParticleConfig): HTMLElement {
    const element = document.createElement('div');
    element.className = 'enterprise-particle';
    
    // Base styles
    element.style.position = 'absolute';
    element.style.pointerEvents = 'none';
    element.style.borderRadius = '50%';
    element.style.zIndex = '9998';
    
    // Type-specific styles
    switch (config.type) {
      case 'confetti':
        element.style.borderRadius = '2px';
        element.style.backgroundColor = this.getParticleColor(config.color.start);
        break;
        
      case 'stars':
        element.textContent = '⭐';
        element.style.fontSize = `${config.size.start}px`;
        element.style.backgroundColor = 'transparent';
        break;
        
      case 'hearts':
        element.textContent = '❤️';
        element.style.fontSize = `${config.size.start}px`;
        element.style.backgroundColor = 'transparent';
        break;
        
      case 'sparkles':
        element.textContent = '✨';
        element.style.fontSize = `${config.size.start}px`;
        element.style.backgroundColor = 'transparent';
        break;
        
      case 'bubbles':
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        element.style.border = '1px solid rgba(255, 255, 255, 0.5)';
        break;
        
      default:
        element.style.backgroundColor = this.getParticleColor(config.color.start);
    }
    
    return element;
  }

  private getEmissionPosition(config: ParticleConfig): Vector2D {
    // Default to center if no emission area specified
    const baseX = 0;
    const baseY = 0;
    
    if (!config.emissionArea) {
      return { x: baseX, y: baseY };
    }
    
    switch (config.emissionShape) {
      case 'circle':
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(config.emissionArea.x, config.emissionArea.y);
        return {
          x: baseX + Math.cos(angle) * radius,
          y: baseY + Math.sin(angle) * radius
        };
        
      case 'rectangle':
        return {
          x: baseX + (Math.random() - 0.5) * config.emissionArea.x,
          y: baseY + (Math.random() - 0.5) * config.emissionArea.y
        };
        
      case 'line':
        return {
          x: baseX + (Math.random() - 0.5) * config.emissionArea.x,
          y: baseY
        };
        
      default:
        return { x: baseX, y: baseY };
    }
  }

  private getParticleColor(colorConfig: any): string {
    if (colorConfig.hex) {
      return colorConfig.hex;
    }
    
    if (colorConfig.rgb) {
      const { r, g, b } = colorConfig.rgb;
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    if (colorConfig.hsl) {
      const { h, s, l } = colorConfig.hsl;
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    return '#FFD700'; // Default gold
  }

  private interpolateColor(start: any, end: any, progress: number): string {
    // Simple color interpolation
    if (start.hex && end.hex) {
      return this.interpolateHexColor(start.hex, end.hex, progress);
    }
    
    return this.getParticleColor(start);
  }

  private interpolateHexColor(start: string, end: string, progress: number): string {
    const startRgb = this.hexToRgb(start);
    const endRgb = this.hexToRgb(end);
    
    if (!startRgb || !endRgb) return start;
    
    const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
    const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
    const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private getParticleTypeFromAnimation(animationType: string): any {
    if (animationType.includes('confetti')) return 'confetti';
    if (animationType.includes('star')) return 'stars';
    if (animationType.includes('sparkle')) return 'sparkles';
    if (animationType.includes('celebration')) return 'celebration';
    return 'confetti';
  }

  private getParticleCount(animationType: string): number {
    const qualityMultiplier = this.getQualityMultiplier(this.quality);
    
    switch (animationType) {
      case 'confetti-explosion':
        return Math.floor(50 * qualityMultiplier);
      case 'star-burst':
        return Math.floor(20 * qualityMultiplier);
      case 'celebration-fireworks':
        return Math.floor(100 * qualityMultiplier);
      default:
        return Math.floor(30 * qualityMultiplier);
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
} 