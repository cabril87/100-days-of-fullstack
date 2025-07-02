/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Performance Monitor
 * Enterprise performance tracking for animation system
 * 
 * MOBILE-FIRST RESPONSIVE ENHANCEMENTS:
 * - Device-aware performance thresholds (mobile: 30fps, tablet: 45fps, desktop: 60fps)
 * - Battery level monitoring and performance adjustment
 * - Network type detection and optimization
 * - Thermal throttling detection and mitigation
 * - Memory pressure monitoring for mobile devices
 * - Real-time performance recommendations
 * - Device capability benchmarking on startup
 */

import { AnimationMetrics } from '@/lib/types/animations';

// ================================
// MOBILE-FIRST RESPONSIVE TYPES
// ================================

interface DeviceCapabilities {
  type: 'mobile' | 'tablet' | 'desktop';
  hasGPU: boolean;
  memoryMB: number;
  batteryLevel: number;
  isLowEnd: boolean;
  supportsTouchscreen: boolean;
  supportsVibration: boolean;
  networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
}

interface DeviceThresholds {
  mobile: {
    targetFPS: number;
    criticalFPS: number;
    maxMemoryMB: number;
    batteryWarningLevel: number;
    thermalThrottleTemp: number;
  };
  tablet: {
    targetFPS: number;
    criticalFPS: number;
    maxMemoryMB: number;
    batteryWarningLevel: number;
    thermalThrottleTemp: number;
  };
  desktop: {
    targetFPS: number;
    criticalFPS: number;
    maxMemoryMB: number;
    batteryWarningLevel: number;
    thermalThrottleTemp: number;
  };
}

interface PerformanceRecommendation {
  type: 'quality' | 'battery' | 'thermal' | 'memory' | 'network';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action: 'reduce_quality' | 'pause_animations' | 'free_memory' | 'reduce_frequency' | 'optimize_network';
  value?: number;
}

interface BenchmarkResults {
  deviceScore: number; // 0-100
  renderingCapability: 'low' | 'medium' | 'high';
  recommendedQuality: 'low' | 'medium' | 'high' | 'ultra';
  maxParticles: number;
  maxConcurrentAnimations: number;
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

interface NetworkConnection {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkConnection;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// ================================
// ENHANCED PERFORMANCE MONITOR
// ================================

export class PerformanceMonitor {
  // Existing properties (preserved)
  private isRunning = false;
  private startTime = 0;
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameTimeHistory: number[] = [];
  private memoryUsage = 0;
  private renderTime = 0;
  private updateTime = 0;
  private readonly maxFrameHistory = 60; // Keep last 60 frame times

  // NEW: Mobile-first responsive properties
  private deviceCapabilities!: DeviceCapabilities;
  private deviceThresholds!: DeviceThresholds;
  private batteryManager: BatteryManager | null = null;
  private benchmarkResults!: BenchmarkResults;
  private currentRecommendations: PerformanceRecommendation[] = [];
  private monitoringInterval = 1000; // Default 1 second
  private lastBenchmarkTime = 0;
  private thermalCheckInterval = 5000; // Check thermal state every 5 seconds
  private thermalMonitoringIntervalId: number | null = null; // Store interval ID for cleanup
  private memoryPressureThreshold = 0.8; // 80% memory usage threshold
  private batteryAwareInterval = false;
  
  // Performance tracking
  private averageFPS = 60;
  private droppedFrames = 0;
  private memoryPressureLevel = 0; // 0-1 scale
  private thermalThrottling = false;
  private networkLatency = 0;

  // ================================
  // ENHANCED INITIALIZATION
  // ================================

  async initialize(): Promise<void> {
    await this.detectDeviceCapabilities();
    this.deviceThresholds = this.getDeviceThresholds();
    this.benchmarkResults = await this.runDeviceBenchmark();
    await this.setupBatteryMonitoring();
    this.setupNetworkMonitoring();
    this.setupThermalMonitoring();
    this.adjustMonitoringInterval();
    
    console.log('📊 PerformanceMonitor initialized with device capabilities:', this.deviceCapabilities);
    console.log('🎯 Performance thresholds:', this.deviceThresholds[this.deviceCapabilities.type]);
    console.log('🔬 Benchmark results:', this.benchmarkResults);
  }

  // ================================
  // PRESERVED EXISTING METHODS
  // ================================
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = performance.now();
    this.frameCount = 0;
    this.frameTimeHistory = [];
    
    this.startMonitoring();
  }
  
  stop(): void {
    this.isRunning = false;
  }
  
  getMetrics(): Partial<AnimationMetrics> {
    const now = performance.now();
    const totalTime = now - this.startTime;
    const averageFrameTime = this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length 
      : 0;
    
    return {
      memoryUsage: this.getMemoryUsage(),
      renderTime: this.renderTime,
      updateTime: this.updateTime,
      totalTime,
      averageFrameTime
    };
  }
  
  recordFrameTime(frameTime: number): void {
    this.frameTimeHistory.push(frameTime);
    
    if (this.frameTimeHistory.length > this.maxFrameHistory) {
      this.frameTimeHistory.shift();
    }
    
    this.frameCount++;
    this.lastFrameTime = frameTime;

    // NEW: Enhanced frame tracking with mobile awareness
    this.updateFPSCalculation(frameTime);
    this.checkPerformanceThresholds();
  }
  
  recordRenderTime(renderTime: number): void {
    this.renderTime = renderTime;
  }
  
  recordUpdateTime(updateTime: number): void {
    this.updateTime = updateTime;
  }
  
  destroy(): void {
    this.stop();
    this.frameTimeHistory = [];
    // NEW: Cleanup mobile monitoring
    this.cleanupMobileMonitoring();
  }

  // ================================
  // NEW MOBILE-FIRST METHODS
  // ================================

  private async detectDeviceCapabilities(): Promise<void> {
    // Safely detect device type based on screen size and user agent
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    
    // Log user agent for device profiling
    console.log('Device user agent detected:', userAgent.substring(0, 50));
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (screenWidth <= 768) {
      deviceType = 'mobile';
    } else if (screenWidth <= 1024) {
      deviceType = 'tablet';
    }

    // Safely detect GPU capabilities
    let hasGPU = false;
    try {
      if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        hasGPU = !!gl;
      }
    } catch (error) {
      console.warn('GPU detection failed:', error);
      hasGPU = false;
    }

    // Safely estimate memory (conservative approach)
    let memoryMB = 1024; // Default assumption for unknown devices
    try {
      if (typeof performance !== 'undefined') {
        const performanceWithMemory = performance as PerformanceWithMemory;
        if ('memory' in performance && performanceWithMemory.memory) {
          const memory = performanceWithMemory.memory;
          memoryMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        }
      }
    } catch (error) {
      console.warn('Memory detection failed:', error);
    }

    // Detect battery level
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

    // Detect network type
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    let networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' = 'unknown';
    if (navigatorWithConnection.connection) {
      const connection = navigatorWithConnection.connection;
      if (connection.effectiveType) {
        if (connection.effectiveType.includes('4g') || connection.effectiveType.includes('3g')) {
          networkType = 'cellular';
        } else if (connection.type === 'wifi') {
          networkType = 'wifi';
        } else if (connection.type === 'ethernet') {
          networkType = 'ethernet';
        }
      }
    }

    // Determine if device is low-end
    const isLowEnd = (
      deviceType === 'mobile' && 
      memoryMB < 2048
    ) || batteryLevel < 0.2;

    // Safely detect touch and vibration capabilities
    const supportsTouchscreen = typeof window !== 'undefined' && 'ontouchstart' in window;
    const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

    this.deviceCapabilities = {
      type: deviceType,
      hasGPU,
      memoryMB,
      batteryLevel,
      isLowEnd,
      supportsTouchscreen,
      supportsVibration,
      networkType,
      thermalState: 'nominal'
    };
  }

  private getDeviceThresholds(): DeviceThresholds {
    return {
      mobile: {
        targetFPS: 30,
        criticalFPS: 20,
        maxMemoryMB: 50,
        batteryWarningLevel: 0.2,
        thermalThrottleTemp: 40
      },
      tablet: {
        targetFPS: 45,
        criticalFPS: 30,
        maxMemoryMB: 100,
        batteryWarningLevel: 0.3,
        thermalThrottleTemp: 45
      },
      desktop: {
        targetFPS: 60,
        criticalFPS: 45,
        maxMemoryMB: 200,
        batteryWarningLevel: 0.5,
        thermalThrottleTemp: 60
      }
    };
  }

  private async runDeviceBenchmark(): Promise<BenchmarkResults> {
    const startTime = performance.now();
    console.log('🔍 Frame analysis started at:', startTime);
    let renderScore = 0;
    let memoryScore = 0;
    let cpuScore = 0;

    // CPU benchmark - simple calculation test
    const cpuStart = performance.now();
    let iterations = 0;
    while (performance.now() - cpuStart < 100) { // 100ms test
      Math.sqrt(Math.random() * 1000);
      iterations++;
    }
    cpuScore = Math.min(100, iterations / 1000); // Normalize

    // Memory benchmark
    const memoryAvailable = this.deviceCapabilities.memoryMB;
    memoryScore = Math.min(100, memoryAvailable / 40); // 4GB = 100 points

    // GPU/Rendering benchmark
    if (this.deviceCapabilities.hasGPU) {
      renderScore = this.deviceCapabilities.type === 'desktop' ? 80 : 
                   this.deviceCapabilities.type === 'tablet' ? 60 : 40;
    } else {
      renderScore = 20;
    }

    // Calculate overall device score
    const deviceScore = (cpuScore * 0.4 + memoryScore * 0.3 + renderScore * 0.3);

    // Determine capabilities based on score
    let renderingCapability: 'low' | 'medium' | 'high';
    let recommendedQuality: 'low' | 'medium' | 'high' | 'ultra';
    let maxParticles: number;
    let maxConcurrentAnimations: number;

    if (deviceScore >= 70) {
      renderingCapability = 'high';
      recommendedQuality = this.deviceCapabilities.type === 'desktop' ? 'ultra' : 'high';
      maxParticles = this.deviceCapabilities.type === 'desktop' ? 120 : 75;
      maxConcurrentAnimations = 10;
    } else if (deviceScore >= 40) {
      renderingCapability = 'medium';
      recommendedQuality = 'medium';
      maxParticles = 50;
      maxConcurrentAnimations = 5;
    } else {
      renderingCapability = 'low';
      recommendedQuality = 'low';
      maxParticles = 20;
      maxConcurrentAnimations = 3;
    }

    this.lastBenchmarkTime = performance.now();

    return {
      deviceScore,
      renderingCapability,
      recommendedQuality,
      maxParticles,
      maxConcurrentAnimations
    };
  }

  private async setupBatteryMonitoring(): Promise<void> {
    if (!this.batteryManager) return;

    const updateBatteryStatus = () => {
      if (this.batteryManager) {
        this.deviceCapabilities.batteryLevel = this.batteryManager.level;
        this.adjustPerformanceForBattery();
      }
    };

    this.batteryManager.addEventListener?.('levelchange', updateBatteryStatus);
    this.batteryManager.addEventListener?.('chargingchange', updateBatteryStatus);
  }

  private setupNetworkMonitoring(): void {
    try {
      if (typeof navigator === 'undefined') return;
      
      const navigatorWithConnection = navigator as NavigatorWithConnection;
      if (!navigatorWithConnection.connection) return;

      const connection = navigatorWithConnection.connection;
      
      const updateNetworkStatus = () => {
        try {
          if (connection.rtt) {
            this.networkLatency = connection.rtt;
          }
          
          // Update network type
          if (connection.effectiveType) {
            if (connection.effectiveType.includes('4g') || connection.effectiveType.includes('3g')) {
              this.deviceCapabilities.networkType = 'cellular';
            } else if (connection.type === 'wifi') {
              this.deviceCapabilities.networkType = 'wifi';
            }
          }

          this.generateNetworkRecommendations();
        } catch (error) {
          console.warn('Network status update failed:', error);
        }
      };

      connection.addEventListener?.('change', updateNetworkStatus);
      updateNetworkStatus(); // Initial check
    } catch (error) {
      console.warn('Network monitoring setup failed:', error);
    }
  }

  private setupThermalMonitoring(): void {
    // Monitor CPU usage as proxy for thermal state
    this.thermalMonitoringIntervalId = setInterval(() => {
      this.checkThermalState();
    }, this.thermalCheckInterval) as unknown as number;
  }

  private checkThermalState(): void {
    // Use frame rate degradation as thermal indicator
    const targetFPS = this.deviceThresholds[this.deviceCapabilities.type].targetFPS;
    const currentFPS = this.averageFPS;
    const degradation = (targetFPS - currentFPS) / targetFPS;

    if (degradation > 0.5) {
      this.deviceCapabilities.thermalState = 'critical';
      this.thermalThrottling = true;
    } else if (degradation > 0.3) {
      this.deviceCapabilities.thermalState = 'serious';
      this.thermalThrottling = true;
    } else if (degradation > 0.15) {
      this.deviceCapabilities.thermalState = 'fair';
      this.thermalThrottling = false;
    } else {
      this.deviceCapabilities.thermalState = 'nominal';
      this.thermalThrottling = false;
    }

    if (this.thermalThrottling) {
      this.generateThermalRecommendations();
    }
  }

  private adjustMonitoringInterval(): void {
    // Battery-aware monitoring intervals
    if (this.deviceCapabilities.batteryLevel < 0.2) {
      this.monitoringInterval = 2000; // 2 seconds when low battery
      this.batteryAwareInterval = true;
    } else if (this.deviceCapabilities.batteryLevel < 0.5) {
      this.monitoringInterval = 1500; // 1.5 seconds when medium battery
      this.batteryAwareInterval = true;
    } else {
      this.monitoringInterval = 1000; // 1 second when good battery
      this.batteryAwareInterval = false;
    }
  }

  private adjustPerformanceForBattery(): void {
    const thresholds = this.deviceThresholds[this.deviceCapabilities.type];
    
    if (this.deviceCapabilities.batteryLevel < thresholds.batteryWarningLevel) {
      this.generateBatteryRecommendations();
      this.adjustMonitoringInterval();
    }
  }

  private updateFPSCalculation(frameTime: number): void {
    const fps = 1000 / frameTime;
    
    // Smooth FPS calculation
    this.averageFPS = this.averageFPS * 0.9 + fps * 0.1;
    
    const targetFPS = this.deviceThresholds[this.deviceCapabilities.type].targetFPS;
    if (fps < targetFPS * 0.8) {
      this.droppedFrames++;
    }
  }

  private checkPerformanceThresholds(): void {
    const thresholds = this.deviceThresholds[this.deviceCapabilities.type];
    const memoryUsage = this.getMemoryUsage();
    
    // Check memory pressure
    if (memoryUsage > thresholds.maxMemoryMB) {
      this.memoryPressureLevel = Math.min(1, memoryUsage / (thresholds.maxMemoryMB * 1.5));
      this.generateMemoryRecommendations();
    }
    
    // Check FPS performance
    if (this.averageFPS < thresholds.criticalFPS) {
      this.generatePerformanceRecommendations();
    }
  }

  private generatePerformanceRecommendations(): void {
    const recommendation: PerformanceRecommendation = {
      type: 'quality',
      severity: 'warning',
      message: `Performance below target (${Math.round(this.averageFPS)}fps < ${this.deviceThresholds[this.deviceCapabilities.type].targetFPS}fps)`,
      action: 'reduce_quality',
      value: Math.max(0.5, this.averageFPS / this.deviceThresholds[this.deviceCapabilities.type].targetFPS)
    };
    
    this.addRecommendation(recommendation);
  }

  private generateBatteryRecommendations(): void {
    const batteryLevel = Math.round(this.deviceCapabilities.batteryLevel * 100);
    const recommendation: PerformanceRecommendation = {
      type: 'battery',
      severity: batteryLevel < 10 ? 'critical' : 'warning',
      message: `Low battery (${batteryLevel}%) - reducing animation frequency`,
      action: 'reduce_frequency',
      value: this.deviceCapabilities.batteryLevel
    };
    
    this.addRecommendation(recommendation);
  }

  private generateMemoryRecommendations(): void {
    const memoryUsage = this.getMemoryUsage();
    const thresholds = this.deviceThresholds[this.deviceCapabilities.type];
    
    const recommendation: PerformanceRecommendation = {
      type: 'memory',
      severity: memoryUsage > thresholds.maxMemoryMB * 1.5 ? 'critical' : 'warning',
      message: `High memory usage (${Math.round(memoryUsage)}MB) - consider freeing resources`,
      action: 'free_memory',
      value: memoryUsage / thresholds.maxMemoryMB
    };
    
    this.addRecommendation(recommendation);
  }

  private generateThermalRecommendations(): void {
    const recommendation: PerformanceRecommendation = {
      type: 'thermal',
      severity: this.deviceCapabilities.thermalState === 'critical' ? 'critical' : 'warning',
      message: `Thermal throttling detected (${this.deviceCapabilities.thermalState}) - reducing animation intensity`,
      action: 'pause_animations',
      value: this.deviceCapabilities.thermalState === 'critical' ? 0.3 : 0.6
    };
    
    this.addRecommendation(recommendation);
  }

  private generateNetworkRecommendations(): void {
    if (this.deviceCapabilities.networkType === 'cellular' && this.networkLatency > 200) {
      const recommendation: PerformanceRecommendation = {
        type: 'network',
        severity: 'info',
        message: `High network latency (${this.networkLatency}ms) on cellular - optimizing data usage`,
        action: 'optimize_network',
        value: this.networkLatency
      };
      
      this.addRecommendation(recommendation);
    }
  }

  private addRecommendation(recommendation: PerformanceRecommendation): void {
    // Remove existing recommendations of the same type
    this.currentRecommendations = this.currentRecommendations.filter(
      r => r.type !== recommendation.type
    );
    
    // Add new recommendation
    this.currentRecommendations.push(recommendation);
    
    // Limit to 5 recommendations
    if (this.currentRecommendations.length > 5) {
      this.currentRecommendations.shift();
    }
  }

  private cleanupMobileMonitoring(): void {
    // Cleanup thermal monitoring interval
    if (this.thermalMonitoringIntervalId !== null) {
      clearInterval(this.thermalMonitoringIntervalId);
      this.thermalMonitoringIntervalId = null;
    }
    
    // Battery listeners are cleaned up automatically when object is destroyed
    this.batteryManager = null;
    
    // Reset monitoring states
    this.currentRecommendations = [];
    this.averageFPS = 60;
    this.droppedFrames = 0;
    this.memoryPressureLevel = 0;
    this.thermalThrottling = false;
    this.networkLatency = 0;
  }

  // ================================
  // PRESERVED PRIVATE METHODS
  // ================================
  
  private startMonitoring(): void {
    const monitor = () => {
      if (!this.isRunning) return;
      
      const now = performance.now();
      const frameTime = now - this.lastFrameTime;
      
      if (this.lastFrameTime > 0) {
        this.recordFrameTime(frameTime);
      }
      
      this.lastFrameTime = now;
      
      // Update memory usage periodically (enhanced with battery awareness)
      const memoryCheckInterval = this.batteryAwareInterval ? 120 : 60;
      if (this.frameCount % memoryCheckInterval === 0) {
        this.updateMemoryUsage();
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory!;
      this.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as PerformanceWithMemory).memory!;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  // ================================
  // NEW PUBLIC MOBILE-FIRST API
  // ================================

  public isInitialized(): boolean {
    return !!(this.deviceCapabilities && this.benchmarkResults);
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    if (!this.deviceCapabilities) {
      throw new Error('PerformanceMonitor not initialized. Call initialize() first.');
    }
    return { ...this.deviceCapabilities };
  }

  public getBenchmarkResults(): BenchmarkResults {
    if (!this.benchmarkResults) {
      throw new Error('PerformanceMonitor not initialized. Call initialize() first.');
    }
    return { ...this.benchmarkResults };
  }

  public getCurrentRecommendations(): PerformanceRecommendation[] {
    return [...this.currentRecommendations];
  }

  public getDetailedMetrics(): Partial<AnimationMetrics> & {
    deviceType: string;
    averageFPS: number;
    droppedFrames: number;
    batteryLevel: number;
    memoryPressure: number;
    thermalState: string;
    networkLatency: number;
    recommendations: PerformanceRecommendation[];
  } {
    if (!this.deviceCapabilities) {
      throw new Error('PerformanceMonitor not initialized. Call initialize() first.');
    }
    
    const baseMetrics = this.getMetrics();
    
    return {
      ...baseMetrics,
      deviceType: this.deviceCapabilities.type,
      averageFPS: Math.round(this.averageFPS * 10) / 10,
      droppedFrames: this.droppedFrames,
      batteryLevel: Math.round(this.deviceCapabilities.batteryLevel * 100),
      memoryPressure: Math.round(this.memoryPressureLevel * 100),
      thermalState: this.deviceCapabilities.thermalState,
      networkLatency: this.networkLatency,
      recommendations: this.getCurrentRecommendations()
    };
  }

  public shouldReduceQuality(): boolean {
    return this.currentRecommendations.some(
      r => r.action === 'reduce_quality' && r.severity !== 'info'
    );
  }

  public shouldPauseAnimations(): boolean {
    return this.currentRecommendations.some(
      r => r.action === 'pause_animations' && r.severity === 'critical'
    );
  }

  public getQualityRecommendation(): 'low' | 'medium' | 'high' | 'ultra' {
    if (!this.benchmarkResults) {
      console.warn('PerformanceMonitor not initialized, returning default quality');
      return 'medium';
    }
    
    if (this.shouldPauseAnimations()) return 'low';
    if (this.shouldReduceQuality()) return 'medium';
    return this.benchmarkResults.recommendedQuality;
  }

  public async rebenchmark(): Promise<BenchmarkResults> {
    console.log('🔄 Running device rebenchmark...');
    this.benchmarkResults = await this.runDeviceBenchmark();
    return this.benchmarkResults;
  }
} 