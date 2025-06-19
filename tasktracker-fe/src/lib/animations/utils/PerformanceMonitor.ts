/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Performance Monitor
 * Enterprise performance tracking for animation system
 */

import { AnimationMetrics } from '@/lib/types/animations';

export class PerformanceMonitor {
  private isRunning = false;
  private startTime = 0;
  private frameCount = 0;
  private lastFrameTime = 0;
  private frameTimeHistory: number[] = [];
  private memoryUsage = 0;
  private renderTime = 0;
  private updateTime = 0;
  
  private readonly maxFrameHistory = 60; // Keep last 60 frame times
  
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
  }
  
  private startMonitoring(): void {
    const monitor = () => {
      if (!this.isRunning) return;
      
      const now = performance.now();
      const frameTime = now - this.lastFrameTime;
      
      if (this.lastFrameTime > 0) {
        this.recordFrameTime(frameTime);
      }
      
      this.lastFrameTime = now;
      
      // Update memory usage periodically
      if (this.frameCount % 60 === 0) {
        this.updateMemoryUsage();
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }
  
  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }
} 