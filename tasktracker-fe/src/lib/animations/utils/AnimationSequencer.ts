/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Animation Sequencer
 * Enterprise sequencing system for complex animation workflows
 */

import { AnimationSequence } from '@/lib/types/animations';

interface SequenceCallbacks {
  onAnimationStart?: (animationId: string, type: string) => void;
  onAnimationComplete?: (animationId: string, type: string) => void;
  onSequenceComplete?: () => void;
  onSequenceError?: (error: Error) => void;
}

export class AnimationSequencer {
  private activeSequences = new Map<string, any>();
  private queuedSequences: AnimationSequence[] = [];
  private sequenceId = 0;

  async playSequence(
    sequence: AnimationSequence, 
    callbacks: SequenceCallbacks = {}
  ): Promise<string> {
    const id = `seq_${++this.sequenceId}_${Date.now()}`;
    
    try {
      if (sequence.simultaneousAnimations) {
        await this.playSimultaneousSequence(sequence, callbacks);
      } else {
        await this.playSequentialSequence(sequence, callbacks);
      }
      
      callbacks.onSequenceComplete?.();
      return id;
      
    } catch (error) {
      callbacks.onSequenceError?.(error as Error);
      throw error;
    }
  }

  getQueueSize(): number {
    return this.queuedSequences.length;
  }

  private async playSimultaneousSequence(
    sequence: AnimationSequence,
    callbacks: SequenceCallbacks
  ): Promise<void> {
    const promises: Promise<void>[] = [];
    
    // Start all animations simultaneously
    sequence.animations.forEach((animConfig, index) => {
      const animId = `${sequence.id}_anim_${index}`;
      callbacks.onAnimationStart?.(animId, animConfig.type);
      
      const promise = this.playAnimation(animConfig).then(() => {
        callbacks.onAnimationComplete?.(animId, animConfig.type);
      });
      
      promises.push(promise);
    });
    
    // Wait for all animations to complete
    await Promise.all(promises);
  }

  private async playSequentialSequence(
    sequence: AnimationSequence,
    callbacks: SequenceCallbacks
  ): Promise<void> {
    // Play animations one after another
    for (let i = 0; i < sequence.animations.length; i++) {
      const animConfig = sequence.animations[i];
      const animId = `${sequence.id}_anim_${i}`;
      
      callbacks.onAnimationStart?.(animId, animConfig.type);
      
      await this.playAnimation(animConfig);
      
      callbacks.onAnimationComplete?.(animId, animConfig.type);
    }
  }

  private async playAnimation(animConfig: any): Promise<void> {
    return new Promise((resolve) => {
      // Create animation element
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = `${animConfig.position.x}px`;
      element.style.top = `${animConfig.position.y}px`;
      element.style.pointerEvents = 'none';
      element.style.zIndex = '9999';
      
      // Apply animation based on type
      this.applyAnimationToElement(element, animConfig);
      
      // Add to DOM
      const container = document.getElementById('enterprise-animation-container');
      if (container) {
        container.appendChild(element);
      }
      
      // Remove after animation completes
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        resolve();
      }, animConfig.duration + (animConfig.delay || 0));
    });
  }

  private applyAnimationToElement(element: HTMLElement, config: any): void {
    const duration = config.duration;
    const easing = config.easing || 'ease-out';
    
    switch (config.type) {
      case 'achievement-unlock':
        element.textContent = '🏆';
        element.style.fontSize = '48px';
        element.style.animation = `achievementUnlock ${duration}ms ${easing}`;
        break;
        
      case 'level-up':
        element.textContent = '⬆️';
        element.style.fontSize = '36px';
        element.style.animation = `levelUp ${duration}ms ${easing}`;
        break;
        
      case 'task-complete':
        element.textContent = '✅';
        element.style.fontSize = '32px';
        element.style.animation = `taskComplete ${duration}ms ${easing}`;
        break;
        
      case 'star-burst':
        element.textContent = '⭐';
        element.style.fontSize = '24px';
        element.style.animation = `starBurst ${duration}ms ${easing}`;
        break;
        
      case 'confetti-explosion':
        this.createConfettiExplosion(element, config);
        break;
        
      default:
        element.style.animation = `defaultAnimation ${duration}ms ${easing}`;
    }
  }

  private createConfettiExplosion(container: HTMLElement, config: any): void {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '8px';
      particle.style.height = '8px';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.borderRadius = '2px';
      particle.style.pointerEvents = 'none';
      
      // Random initial position and velocity
      const angle = (Math.PI * 2 * i) / particleCount;
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
        duration: config.duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
      
      container.appendChild(particle);
    }
  }
} 