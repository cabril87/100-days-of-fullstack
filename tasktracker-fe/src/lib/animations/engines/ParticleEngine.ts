/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Particle Engine
 * High-performance particle system for enterprise animations
 * 
 * MOBILE-FIRST RESPONSIVE ENHANCEMENTS:
 * - Device-specific particle count limits (mobile: 30, tablet: 75, desktop: 120)
 * - Battery-aware performance settings with automatic scaling
 * - Touch interaction support for particle effects
 * - Responsive particle sizing based on screen dimensions
 * - Performance throttling for low-end devices
 * - GPU acceleration detection and optimization
 */

import { 
  ParticleConfig, 
  AnimationSystemConfig,
  AnimationQuality,
  Vector2D,
  AnimationConfig,
  ColorConfig,
  ParticleType
} from '@/lib/types/animations';

// ================================
// MOBILE-FIRST RESPONSIVE TYPES
// ================================

interface ResponsiveParticleConfig {
  mobile: {
    maxParticles: number;
    particleSize: number;
    animationSpeed: number;
    enableGPU: boolean;
    simplifiedPhysics: boolean;
  };
  tablet: {
    maxParticles: number;
    particleSize: number;
    animationSpeed: number;
    enableGPU: boolean;
    simplifiedPhysics: boolean;
  };
  desktop: {
    maxParticles: number;
    particleSize: number;
    animationSpeed: number;
    enableGPU: boolean;
    simplifiedPhysics: boolean;
  };
}

interface TouchInteractionConfig {
  enabled: boolean;
  tapToEmit: boolean;
  swipeToAccelerate: boolean;
  dragToMove: boolean;
  pinchToScale: boolean;
  longPressToExplode: boolean;
  hapticFeedback: boolean;
  touchRadius: number;
}

interface DeviceCapabilities {
  type: 'mobile' | 'tablet' | 'desktop';
  hasGPU: boolean;
  gpuTier: 'low' | 'medium' | 'high';
  memoryMB: number;
  batteryLevel: number;
  isLowEnd: boolean;
  supportsTouchscreen: boolean;
  supportsVibration: boolean;
  supportsDeviceOrientation: boolean;
  pixelRatio: number;
  maxTouchPoints: number;
  networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
}

interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener?: (event: string, handler: () => void) => void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    type?: string;
    downlink?: number;
    rtt?: number;
    addEventListener?: (type: string, listener: EventListener) => void;
  };
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

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

  // Mobile-first responsive features
  private responsiveConfig!: ResponsiveParticleConfig;
  private touchConfig!: TouchInteractionConfig;
  private deviceCapabilities!: DeviceCapabilities;
  private batteryManager: BatteryManager | null = null;
  private performanceScaling = 1.0;
  private lastPerformanceCheck = 0;
  
  // Enhanced touch state management (following CharacterEngine patterns)
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private isLongPress = false;
  private longPressTimer: number | null = null;
  private dragThreshold = 10;
  private longPressDelay = 500;
  
  // Network-aware optimizations
  private networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' = 'unknown';
  private effectiveConnectionType: string = '4g';

  async initialize(container: HTMLElement, config: AnimationSystemConfig): Promise<void> {
    this.container = container;
    this.config = config;
    this.quality = config.qualityLevel;
    
    // Initialize mobile-first responsive features
    await this.detectDeviceCapabilities();
    this.responsiveConfig = this.getResponsiveConfig();
    this.touchConfig = this.getTouchConfig();
    
    this.injectResponsiveStyles();
    this.setupTouchInteractions();
    this.setupBatteryMonitoring();
    this.addPerformanceOptimizations();
    
    this.startUpdateLoop();
  }

  async createSystem(config: ParticleConfig): Promise<ParticleSystem> {
    if (!this.container) {
      throw new Error('Particle engine not initialized');
    }

    const id = `particle_${++this.systemId}_${Date.now()}`;
    
    // Apply responsive particle count limits
    const adaptedConfig = this.adaptConfigForDevice(config);
    
    const system: ParticleSystem = {
      id,
      particles: [],
      config: adaptedConfig,
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
    // Convert animation config to particle config with responsive sizing
    const responsiveSize = this.getResponsiveParticleSize(4);
    
    const particleConfig: ParticleConfig = {
      type: this.getParticleTypeFromAnimation(config.type),
      count: this.getResponsiveParticleCount(config.type),
      lifetime: config.duration / 1000,
      velocity: {
        initial: { x: 0, y: -100 },
        variation: { x: 50, y: 50 }
      },
      size: {
        start: responsiveSize,
        end: 0,
        variation: responsiveSize * 0.5
      },
      color: {
        start: config.color || { hex: '#FFD700' }
      }
    };

    return this.createSystem(particleConfig);
  }

  setQuality(quality: AnimationQuality): void {
    this.quality = quality;
    
    // Adjust particle counts based on quality and device capabilities
    this.activeSystems.forEach(system => {
      const multiplier = this.getQualityMultiplier(quality);
      const deviceMultiplier = this.getDeviceParticleMultiplier();
      const targetCount = Math.floor(system.config.count * multiplier * deviceMultiplier);
      
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
    // Pre-create particle elements for smooth performance with device-aware limits
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const preloadCount = Math.min(config.count, deviceConfig.maxParticles, 50);
    const tempElements = [];
    
    for (let i = 0; i < preloadCount; i++) {
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

    // Clean up touch event listeners
    this.cleanupTouchInteractions();
  }

  // ================================
  // MOBILE-FIRST RESPONSIVE METHODS
  // ================================

  private async detectDeviceCapabilities(): Promise<void> {
         // Enhanced device detection following CharacterEngine patterns
     const screenWidth = window.innerWidth;
     const userAgent = navigator.userAgent.toLowerCase();
    
    // Advanced device type detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);
    
    if (isMobile && screenWidth <= 768) {
      deviceType = 'mobile';
    } else if (isTablet || (screenWidth > 768 && screenWidth <= 1024)) {
      deviceType = 'tablet';
    }

         // Enhanced GPU detection with tier assessment
     const canvas = document.createElement('canvas');
     const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
     const hasGPU = !!gl;
     let gpuTier: 'low' | 'medium' | 'high' = 'medium';
     
            if (gl && 'getParameter' in gl) {
         const glContext = gl as WebGLRenderingContext;
         const renderer = glContext.getParameter(glContext.RENDERER) || '';
         const rendererLower = renderer.toString().toLowerCase();
      
      // GPU tier detection based on common mobile GPUs
      if (rendererLower.includes('adreno') && (rendererLower.includes('530') || rendererLower.includes('540') || rendererLower.includes('640'))) {
        gpuTier = 'high';
      } else if (rendererLower.includes('mali') && rendererLower.includes('g76')) {
        gpuTier = 'high';
      } else if (rendererLower.includes('adreno') && rendererLower.includes('4')) {
        gpuTier = 'low';
      } else if (rendererLower.includes('mali-4') || rendererLower.includes('powervr sgx')) {
        gpuTier = 'low';
      }
      
      canvas.remove();
    }

    // Enhanced memory detection
    let memoryMB = 1024;
    const performanceWithMemory = performance as PerformanceWithMemory;
    if ('memory' in performance && performanceWithMemory.memory) {
      const memory = performanceWithMemory.memory;
      memoryMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    }

    // Network detection
    this.detectNetworkCapabilities();

    // Enhanced battery detection
    let batteryLevel = 1.0;
    try {
      const navigatorWithBattery = navigator as NavigatorWithBattery;
      if ('getBattery' in navigator && navigatorWithBattery.getBattery) {
        const battery = await navigatorWithBattery.getBattery();
        batteryLevel = battery.level;
        this.batteryManager = battery;
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }

    // Enhanced low-end device detection
    const isLowEnd = (
      (deviceType === 'mobile' && memoryMB < 2048) ||
      (gpuTier === 'low') ||
      (batteryLevel < 0.15) ||
      (this.networkType === 'cellular' && this.effectiveConnectionType === '2g')
    );

    this.deviceCapabilities = {
      type: deviceType,
      hasGPU,
      gpuTier,
      memoryMB,
      batteryLevel,
      isLowEnd,
      supportsTouchscreen: 'ontouchstart' in window,
      supportsVibration: 'vibrate' in navigator,
      supportsDeviceOrientation: 'DeviceOrientationEvent' in window,
      pixelRatio: window.devicePixelRatio || 1,
      maxTouchPoints: navigator.maxTouchPoints || 1,
      networkType: this.networkType
    };

    console.log('🎮 ParticleEngine Enhanced Device Capabilities:', this.deviceCapabilities);
  }

  private getResponsiveConfig(): ResponsiveParticleConfig {
    return {
      mobile: {
        maxParticles: 30,
        particleSize: 3,
        animationSpeed: 0.7,
        enableGPU: this.deviceCapabilities.hasGPU,
        simplifiedPhysics: true
      },
      tablet: {
        maxParticles: 75,
        particleSize: 4,
        animationSpeed: 0.85,
        enableGPU: this.deviceCapabilities.hasGPU,
        simplifiedPhysics: false
      },
      desktop: {
        maxParticles: 120,
        particleSize: 5,
        animationSpeed: 1.0,
        enableGPU: this.deviceCapabilities.hasGPU,
        simplifiedPhysics: false
      }
    };
  }

  private getTouchConfig(): TouchInteractionConfig {
    return {
      enabled: this.deviceCapabilities.supportsTouchscreen,
      tapToEmit: true,
      swipeToAccelerate: true,
      dragToMove: this.deviceCapabilities.type !== 'desktop',
      pinchToScale: this.deviceCapabilities.maxTouchPoints > 1,
      longPressToExplode: true,
      hapticFeedback: this.deviceCapabilities.supportsVibration,
      touchRadius: this.deviceCapabilities.type === 'mobile' ? 44 : 32
    };
  }
  
  // Enhanced network detection method
  private detectNetworkCapabilities(): void {
    try {
      const navigatorWithConnection = navigator as NavigatorWithConnection;
      if (navigatorWithConnection.connection) {
        const connection = navigatorWithConnection.connection;
        this.effectiveConnectionType = connection.effectiveType || '4g';
        
        // Determine network type
        if (connection.type === 'wifi') {
          this.networkType = 'wifi';
        } else if (connection.type === 'ethernet') {
          this.networkType = 'ethernet';
        } else if (connection.type === 'cellular') {
          this.networkType = 'cellular';
        } else {
          this.networkType = 'unknown';
        }
        
        // Monitor network changes
        connection.addEventListener?.('change', () => {
          this.effectiveConnectionType = connection.effectiveType || '4g';
          this.adjustForNetwork();
        });
      }
    } catch (error) {
      console.warn('Network detection not available:', error);
    }
  }
  
  // Network-aware performance adjustment
  private adjustForNetwork(): void {
         if (this.networkType === 'cellular' && (this.effectiveConnectionType === '2g' || this.effectiveConnectionType === 'slow-2g')) {
       this.performanceScaling = Math.min(this.performanceScaling, 0.5);
       console.log('📡 Reducing performance for slow network connection');
     }
   }

   // Enhanced touch event handlers following CharacterEngine patterns
   private touchEndHandler = (e: TouchEvent): void => {
     e.preventDefault();
     const touch = e.changedTouches[0];
     const rect = this.container!.getBoundingClientRect();
     const x = touch.clientX - rect.left;
     const y = touch.clientY - rect.top;
     
     // Clear long press timer
     if (this.longPressTimer) {
       clearTimeout(this.longPressTimer);
       this.longPressTimer = null;
     }
     
     // Handle tap if not a long press or drag
     const deltaX = x - this.touchStartX;
     const deltaY = y - this.touchStartY;
     const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
     const touchDuration = performance.now() - this.touchStartTime;
     
     if (!this.isLongPress && distance < this.dragThreshold && touchDuration < this.longPressDelay) {
       if (this.touchConfig.tapToEmit) {
         this.handleTouchEmission(x, y);
       }
     }
     
     // Reset touch state
     this.isLongPress = false;
   };

   private handleLongPress(x: number, y: number): void {
     if (!this.touchConfig.longPressToExplode) return;
     
            // Create explosion effect at long press position
       const explosionConfig: ParticleConfig = {
         type: 'sparkles',
       count: Math.min(25, this.responsiveConfig[this.deviceCapabilities.type].maxParticles / 2),
       lifetime: 1.5,
       velocity: {
         initial: { x: 0, y: 0 },
         variation: { x: 150, y: 150 }
       },
       size: {
         start: this.getResponsiveParticleSize(6),
         end: 0,
         variation: 2
       },
       color: {
         start: { hex: '#FF4500' },
         end: { hex: '#FFD700' }
       },
       emissionArea: { x: 5, y: 5 },
       emissionShape: 'circle'
     };

     this.createSystem(explosionConfig).then(system => {
       // Position explosion at long press point
       system.particles.forEach((particle, index) => {
         const angle = (index / system.particles.length) * Math.PI * 2;
         const radius = Math.random() * 20;
         particle.position.x = x + Math.cos(angle) * radius;
         particle.position.y = y + Math.sin(angle) * radius;
         particle.element.style.left = `${particle.position.x}px`;
         particle.element.style.top = `${particle.position.y}px`;
         
         // Add radial velocity
         particle.velocity.x = Math.cos(angle) * (50 + Math.random() * 100);
         particle.velocity.y = Math.sin(angle) * (50 + Math.random() * 100);
       });

       // Auto-cleanup explosion
       setTimeout(() => system.destroy(), 3000);
     }).catch(error => {
       console.warn('Failed to create explosion system:', error);
     });
   }

   private handleDragMove(x: number, y: number, deltaX: number, deltaY: number): void {
     // Find nearby particles and apply drag force
     this.activeSystems.forEach(system => {
       system.particles.forEach(particle => {
         const dx = particle.position.x - x;
         const dy = particle.position.y - y;
         const distance = Math.sqrt(dx * dx + dy * dy);
         
         if (distance < this.touchConfig.touchRadius * 2) {
           const influence = Math.max(0, 1 - distance / (this.touchConfig.touchRadius * 2));
           particle.position.x += deltaX * influence * 0.5;
           particle.position.y += deltaY * influence * 0.5;
           particle.velocity.x += deltaX * influence * 0.1;
           particle.velocity.y += deltaY * influence * 0.1;
         }
       });
     });
   }

   // Gesture handlers for pinch-to-scale functionality
   private gestureStartHandler = (e: Event): void => {
     e.preventDefault();
     if (this.touchConfig.hapticFeedback) {
       this.triggerHapticFeedback('medium');
     }
   };

   private gestureChangeHandler = (e: Event): void => {
     e.preventDefault();
            const gestureEvent = e as TouchEvent & { scale?: number };
     if (gestureEvent.scale) {
       const scale = gestureEvent.scale;
       this.handlePinchScale(scale);
     }
   };

   private gestureEndHandler = (e: Event): void => {
     e.preventDefault();
   };

   private handlePinchScale(scale: number): void {
     // Adjust particle sizes based on pinch gesture
     const scaleMultiplier = Math.max(0.5, Math.min(2.0, scale));
     
     this.activeSystems.forEach(system => {
       system.particles.forEach(particle => {
         const newSize = particle.size * scaleMultiplier;
         particle.size = Math.max(1, Math.min(20, newSize));
         particle.element.style.width = `${particle.size}px`;
         particle.element.style.height = `${particle.size}px`;
       });
     });
   }

  private adaptConfigForDevice(config: ParticleConfig): ParticleConfig {
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const batteryScaling = this.getBatteryScaling();
    
    return {
      ...config,
      count: Math.min(
        config.count, 
        Math.floor(deviceConfig.maxParticles * batteryScaling)
      ),
      size: {
        ...config.size,
        start: Math.min(config.size.start, deviceConfig.particleSize),
        end: Math.min(config.size.end || 0, deviceConfig.particleSize * 0.5)
      }
    };
  }

  private getBatteryScaling(): number {
    if (!this.batteryManager || this.deviceCapabilities.batteryLevel >= 0.5) {
      return 1.0;
    }
    
    if (this.deviceCapabilities.batteryLevel < 0.2) {
      return 0.3; // Severely reduce particles on low battery
    }
    
    if (this.deviceCapabilities.batteryLevel < 0.4) {
      return 0.6; // Moderately reduce particles
    }
    
    return 0.8; // Slightly reduce particles
  }

  private getDeviceParticleMultiplier(): number {
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const baseMultiplier = deviceConfig.maxParticles / 120; // Desktop as baseline
    
    return baseMultiplier * this.performanceScaling;
  }

  private getResponsiveParticleSize(baseSize: number): number {
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    return Math.min(baseSize, deviceConfig.particleSize);
  }

  private getResponsiveParticleCount(animationType: string): number {
    const baseCount = this.getParticleCount(animationType);
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const batteryScaling = this.getBatteryScaling();
    
    return Math.min(
      Math.floor(baseCount * batteryScaling),
      deviceConfig.maxParticles
    );
  }

  private setupTouchInteractions(): void {
    if (!this.touchConfig.enabled || !this.container) return;

    this.container.addEventListener('touchstart', this.touchStartHandler, { passive: false });
    this.container.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
    this.container.addEventListener('touchend', this.touchEndHandler, { passive: false });
    
    // Add pinch gesture support for multi-touch devices
    if (this.touchConfig.pinchToScale) {
      this.container.addEventListener('gesturestart', this.gestureStartHandler, { passive: false });
      this.container.addEventListener('gesturechange', this.gestureChangeHandler, { passive: false });
      this.container.addEventListener('gestureend', this.gestureEndHandler, { passive: false });
    }
  }

  private cleanupTouchInteractions(): void {
    if (!this.container) return;
    
    // Remove all touch event listeners using proper cleanup references
    this.container.removeEventListener('touchstart', this.touchStartHandler);
    this.container.removeEventListener('touchmove', this.touchMoveHandler);
    this.container.removeEventListener('touchend', this.touchEndHandler);
    this.container.removeEventListener('gesturestart', this.gestureStartHandler);
    this.container.removeEventListener('gesturechange', this.gestureChangeHandler);
    this.container.removeEventListener('gestureend', this.gestureEndHandler);
    
    // Clear any active timers
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private touchStartHandler = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.container!.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Store touch start information
    this.touchStartX = x;
    this.touchStartY = y;
    this.touchStartTime = performance.now();
    this.isLongPress = false;
    
    // Setup long press detection
    if (this.touchConfig.longPressToExplode) {
      this.longPressTimer = window.setTimeout(() => {
        this.isLongPress = true;
        this.handleLongPress(x, y);
        if (this.touchConfig.hapticFeedback) {
          this.triggerHapticFeedback('heavy');
        }
      }, this.longPressDelay);
    }
    
    if (this.touchConfig.hapticFeedback) {
      this.triggerHapticFeedback('light');
    }
  };

  private touchMoveHandler = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.container!.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Calculate movement distance
    const deltaX = x - this.touchStartX;
    const deltaY = y - this.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Cancel long press if moved beyond threshold
    if (distance > this.dragThreshold && this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    // Handle drag to move particles
    if (this.touchConfig.dragToMove && distance > this.dragThreshold) {
      this.handleDragMove(x, y, deltaX, deltaY);
    }
    
    // Handle swipe acceleration
    if (this.touchConfig.swipeToAccelerate) {
      this.handleSwipeAcceleration(x, y);
    }
  };

  private handleTouchEmission(x: number, y: number): void {
    // Create a small burst of particles at touch position
    const burstConfig: ParticleConfig = {
      type: 'sparkles',
      count: Math.min(10, this.responsiveConfig[this.deviceCapabilities.type].maxParticles),
      lifetime: 1.0,
      velocity: {
        initial: { x: 0, y: -50 },
        variation: { x: 30, y: 30 }
      },
      size: {
        start: this.getResponsiveParticleSize(3),
        end: 0,
        variation: 1
      },
      color: {
        start: { hex: '#FFD700' }
      },
      emissionArea: { x: 20, y: 20 },
      emissionShape: 'circle'
    };

    // Create system and emit particles at touch position
    this.createSystem(burstConfig).then(system => {
      // Override emission position for initial burst
      system.particles.forEach(particle => {
        particle.position.x = x;
        particle.position.y = y;
        particle.element.style.left = `${x}px`;
        particle.element.style.top = `${y}px`;
      });
      
      // Auto-destroy touch burst after short duration
      setTimeout(() => {
        system.destroy();
      }, 2000);
    }).catch(error => {
      console.warn('Failed to create touch burst system:', error);
    });
  }

  private handleSwipeAcceleration(x: number, y: number): void {
    // Apply acceleration to nearby particles
    this.activeSystems.forEach(system => {
      system.particles.forEach(particle => {
        const dx = particle.position.x - x;
        const dy = particle.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.touchConfig.touchRadius) {
          const acceleration = Math.max(0, 1 - distance / this.touchConfig.touchRadius);
          particle.velocity.x += (dx / distance) * acceleration * 100;
          particle.velocity.y += (dy / distance) * acceleration * 100;
        }
      });
    });
  }

  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): void {
    if (!this.deviceCapabilities.supportsVibration) return;

    const vibrationPatterns = {
      light: [10],
      medium: [10, 50, 10],
      heavy: [20, 100, 20]
    };

    try {
      navigator.vibrate(vibrationPatterns[intensity]);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  private setupBatteryMonitoring(): void {
    if (!this.batteryManager) return;

    const updateBatteryStatus = () => {
      if (this.batteryManager) {
        this.deviceCapabilities.batteryLevel = this.batteryManager.level;
        
        // Adjust performance scaling based on battery level
        const prevScaling = this.performanceScaling;
        this.performanceScaling = this.getBatteryScaling();
        
        if (Math.abs(prevScaling - this.performanceScaling) > 0.1) {
          console.log(`🔋 Battery level: ${Math.round(this.deviceCapabilities.batteryLevel * 100)}%, performance scaling: ${this.performanceScaling}`);
        }
      }
    };

    this.batteryManager.addEventListener?.('levelchange', updateBatteryStatus);
    this.batteryManager.addEventListener?.('chargingchange', updateBatteryStatus);
  }

  private injectResponsiveStyles(): void {
    const styleId = 'particle-engine-responsive-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enterprise-particle {
        will-change: transform, opacity;
        backface-visibility: hidden;
      }
      
      /* GPU acceleration for supported devices */
      ${this.deviceCapabilities.hasGPU ? `
        .enterprise-particle {
          transform: translateZ(0);
        }
      ` : ''}
      
      /* Mobile-specific optimizations */
      @media (max-width: 768px) {
        .enterprise-particle {
          ${this.deviceCapabilities.isLowEnd ? 'will-change: auto;' : ''}
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .enterprise-particle {
          animation-duration: 0.01s !important;
          transition-duration: 0.01s !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  // ================================
  // ENHANCED PERFORMANCE MONITORING
  // ================================

  private addPerformanceOptimizations(): void {
    // Battery level monitoring with dynamic adjustment
    if (this.deviceCapabilities.batteryLevel < 0.3) {
      this.responsiveConfig[this.deviceCapabilities.type].maxParticles *= 0.6;
      console.log('🔋 Low battery detected, reducing particle count by 40%');
    }

    // Memory pressure monitoring
    const memoryThreshold = this.deviceCapabilities.memoryMB * 0.8;
    if (performance && 'memory' in performance) {
      const performanceWithMemory = performance as PerformanceWithMemory;
      if (performanceWithMemory.memory && performanceWithMemory.memory.usedJSHeapSize > memoryThreshold * 1024 * 1024) {
        this.performanceScaling *= 0.7;
        console.log('💾 Memory pressure detected, reducing performance scaling');
      }
    }

    // GPU tier optimizations
    if (this.deviceCapabilities.gpuTier === 'low') {
      this.responsiveConfig[this.deviceCapabilities.type].simplifiedPhysics = true;
      this.responsiveConfig[this.deviceCapabilities.type].enableGPU = false;
      console.log('🎮 Low-tier GPU detected, enabling simplified physics');
    }
  }

  // ================================
  // ENHANCED EXISTING METHODS
  // ================================

  private startUpdateLoop(): void {
    const update = () => {
      const now = performance.now();
      
      // Performance monitoring for mobile devices
      if (now - this.lastPerformanceCheck > 1000) {
        this.checkPerformance();
        this.lastPerformanceCheck = now;
      }
      
      this.activeSystems.forEach(system => {
        if (system.isActive) {
          this.updateSystem(system, now);
        }
      });
      
      this.animationFrame = requestAnimationFrame(update);
    };
    
    update();
  }

  private checkPerformance(): void {
    // Monitor frame rate and adjust performance scaling if needed
    const totalParticles = Array.from(this.activeSystems.values())
      .reduce((sum, system) => sum + system.particles.length, 0);
    
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    
    if (totalParticles > deviceConfig.maxParticles * 1.5) {
      this.performanceScaling = Math.max(0.3, this.performanceScaling * 0.9);
      console.warn(`🐌 Performance scaling reduced to ${this.performanceScaling.toFixed(2)} (${totalParticles} particles)`);
    } else if (totalParticles < deviceConfig.maxParticles * 0.5 && this.performanceScaling < 1.0) {
      this.performanceScaling = Math.min(1.0, this.performanceScaling * 1.1);
    }
  }

  private updateSystem(system: ParticleSystem, now: number): void {
    const deltaTime = (now - system.lastUpdate) / 1000;
    system.lastUpdate = now;
    
    // Apply performance scaling to emission rate
    const scaledDeltaTime = deltaTime * this.performanceScaling;
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    
    // Emit new particles with device-aware limits
    if (system.config.emissionRate && system.particles.length < Math.min(system.config.count, deviceConfig.maxParticles)) {
      system.emissionTimer += scaledDeltaTime;
      const emissionInterval = 1 / system.config.emissionRate;
      
      while (system.emissionTimer >= emissionInterval && system.particles.length < Math.min(system.config.count, deviceConfig.maxParticles)) {
        this.emitParticle(system);
        system.emissionTimer -= emissionInterval;
      }
    } else if (!system.config.emissionRate && system.particles.length === 0) {
      // Burst emission with device limits
      const maxBurst = Math.min(system.config.count, deviceConfig.maxParticles);
      for (let i = 0; i < maxBurst; i++) {
        this.emitParticle(system);
      }
    }
    
    // Update existing particles
    for (let i = system.particles.length - 1; i >= 0; i--) {
      const particle = system.particles[i];
      
      // Update life
      particle.life += scaledDeltaTime;
      
      if (particle.life >= particle.maxLife) {
        // Remove dead particle
        if (particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
        system.particles.splice(i, 1);
        continue;
      }
      
      // Update physics (simplified for low-end devices)
      if (deviceConfig.simplifiedPhysics) {
        this.updateParticleSimplified(particle, scaledDeltaTime);
      } else {
        this.updateParticle(particle, scaledDeltaTime);
      }
      
      // Update visual
      this.updateParticleVisual(particle, system.config);
    }
    
    // Check if system should be destroyed
    if (system.particles.length === 0 && now - system.startTime > system.config.lifetime * 1000) {
      system.destroy();
    }
  }

  private updateParticleSimplified(particle: Particle, deltaTime: number): void {
    // Simplified physics for low-end devices
    particle.position.x += particle.velocity.x * deltaTime;
    particle.position.y += particle.velocity.y * deltaTime;
    
    // Basic gravity only
    particle.velocity.y += 100 * deltaTime;
    
    // Simplified rotation
    particle.rotation += particle.rotationVelocity * deltaTime;
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
    
    // Size with responsive scaling
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const sizeVariation = config.size.variation || 0;
    const baseSize = Math.min(config.size.start, deviceConfig.particleSize);
    const size = baseSize + (Math.random() - 0.5) * sizeVariation;
    
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
      const configWithGravity = this.config as AnimationSystemConfig & { gravity: number };
      particle.velocity.y += configWithGravity.gravity * deltaTime;
    }
    
    // Apply friction if configured
    if (this.config && 'friction' in this.config) {
      const configWithFriction = this.config as AnimationSystemConfig & { friction: number };
      particle.velocity.x *= (1 - configWithFriction.friction * deltaTime);
      particle.velocity.y *= (1 - configWithFriction.friction * deltaTime);
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
    
    // Size interpolation with responsive scaling
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const startSize = Math.min(config.size.start, deviceConfig.particleSize);
    const endSize = Math.min(config.size.end, deviceConfig.particleSize * 0.5);
    const currentSize = startSize + (endSize - startSize) * lifeProgress;
    element.style.width = `${currentSize}px`;
    element.style.height = `${currentSize}px`;
    
    // Opacity
    particle.opacity = 1 - lifeProgress;
    element.style.opacity = particle.opacity.toString();
    
    // Rotation (simplified for low-end devices)
    if (!this.responsiveConfig[this.deviceCapabilities.type].simplifiedPhysics) {
    element.style.transform = `rotate(${particle.rotation}deg)`;
    }
    
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
    
    // Base styles with responsive sizing
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const responsiveSize = Math.min(config.size.start, deviceConfig.particleSize);
    
    element.style.position = 'absolute';
    element.style.pointerEvents = 'none';
    element.style.borderRadius = '50%';
    element.style.zIndex = '9998';
    element.style.width = `${responsiveSize}px`;
    element.style.height = `${responsiveSize}px`;
    
    // GPU acceleration if available
    if (this.deviceCapabilities.hasGPU) {
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform, opacity';
    }
    
    // Type-specific styles
    switch (config.type) {
      case 'confetti':
        element.style.borderRadius = '2px';
        element.style.backgroundColor = this.getParticleColor(config.color.start);
        break;
        
      case 'stars':
        element.textContent = '⭐';
        element.style.fontSize = `${responsiveSize}px`;
        element.style.backgroundColor = 'transparent';
        break;
        
      case 'hearts':
        element.textContent = '❤️';
        element.style.fontSize = `${responsiveSize}px`;
        element.style.backgroundColor = 'transparent';
        break;
        
      case 'sparkles':
        element.textContent = '✨';
        element.style.fontSize = `${responsiveSize}px`;
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

  private getEmissionPosition(config?: ParticleConfig): Vector2D {
    // Default to center if no config provided
    if (!config) {
      return { x: 0, y: 0 };
    }

    // Default to center if no emission area specified
    const baseX = this.container ? this.container.offsetWidth / 2 : 0;
    const baseY = this.container ? this.container.offsetHeight / 2 : 0;
    
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

  private getParticleColor(colorConfig: ColorConfig): string {
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

  private interpolateColor(start: ColorConfig, end: ColorConfig, progress: number): string {
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

  private getParticleTypeFromAnimation(animationType: string): ParticleType {
    if (animationType.includes('confetti')) return 'confetti';
    if (animationType.includes('star')) return 'stars';
    if (animationType.includes('sparkle')) return 'sparkles';
    if (animationType.includes('celebration')) return 'celebration';
    return 'confetti';
  }

  private getParticleCount(animationType: string): number {
    const qualityMultiplier = this.getQualityMultiplier(this.quality);
    const deviceMultiplier = this.getDeviceParticleMultiplier();
    
    let baseCount: number;
    switch (animationType) {
      case 'confetti-explosion':
        baseCount = 50;
        break;
      case 'star-burst':
        baseCount = 20;
        break;
      case 'celebration-fireworks':
        baseCount = 100;
        break;
      default:
        baseCount = 30;
        break;
    }
    
    return Math.floor(baseCount * qualityMultiplier * deviceMultiplier);
  }

  private getQualityMultiplier(quality: AnimationQuality): number {
    const baseMultipliers = {
      low: 0.3,
      medium: 0.6,
      high: 1.0,
      ultra: 1.5
    };
    
    const deviceConfig = this.responsiveConfig[this.deviceCapabilities.type];
    const deviceCapabilityMultiplier = deviceConfig.maxParticles / 120; // Desktop baseline
    
    return (baseMultipliers[quality] || 1.0) * deviceCapabilityMultiplier;
  }

  // ================================
  // PUBLIC MOBILE-FIRST API
  // ================================

  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  public getResponsiveConfigSettings(): ResponsiveParticleConfig {
    return { ...this.responsiveConfig };
  }

  public setTouchInteractions(enabled: boolean): void {
    this.touchConfig.enabled = enabled && this.deviceCapabilities.supportsTouchscreen;
    
    if (!enabled) {
      this.cleanupTouchInteractions();
    } else {
      this.setupTouchInteractions();
    }
  }

  // ================================
  // ENHANCED PUBLIC API
  // ================================

  public adaptToDeviceOrientation(orientation: 'portrait' | 'landscape'): void {
    // Adjust particle emission area based on orientation
    this.activeSystems.forEach(system => {
      if (system.config.emissionArea) {
        if (orientation === 'landscape') {
          system.config.emissionArea.x *= 1.5;
          system.config.emissionArea.y *= 0.8;
        } else {
          system.config.emissionArea.x *= 0.8;
          system.config.emissionArea.y *= 1.5;
        }
      }
    });
    
    console.log(`🔄 Adapted particle systems to ${orientation} orientation`);
  }

  public adjustForNetworkCondition(connectionType: string): void {
    if (connectionType === '2g' || connectionType === 'slow-2g') {
      this.performanceScaling = Math.min(this.performanceScaling, 0.4);
      console.log('📡 Slow network detected, minimizing particle animations');
    } else if (connectionType === '3g') {
      this.performanceScaling = Math.min(this.performanceScaling, 0.7);
    } else {
      // 4g or wifi - full performance
      this.performanceScaling = Math.min(1.0, this.performanceScaling * 1.2);
    }
  }

  public getPerformanceMetrics(): {
    deviceType: string;
    gpuTier: string;
    batteryLevel: number;
    memoryMB: number;
    performanceScaling: number;
    activeParticles: number;
    maxParticles: number;
    networkType: string;
    touchSupport: boolean;
  } {
    const totalParticles = Array.from(this.activeSystems.values())
      .reduce((sum, system) => sum + system.particles.length, 0);
    
    return {
      deviceType: this.deviceCapabilities.type,
      gpuTier: this.deviceCapabilities.gpuTier,
      batteryLevel: this.deviceCapabilities.batteryLevel,
      memoryMB: this.deviceCapabilities.memoryMB,
      performanceScaling: this.performanceScaling,
      activeParticles: totalParticles,
      maxParticles: this.responsiveConfig[this.deviceCapabilities.type].maxParticles,
      networkType: this.deviceCapabilities.networkType,
      touchSupport: this.deviceCapabilities.supportsTouchscreen
    };
  }
} 