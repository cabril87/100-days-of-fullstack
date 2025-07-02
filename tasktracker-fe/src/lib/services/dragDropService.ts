/*
 * Enterprise Drag and Drop Service
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Provides comprehensive drag-and-drop functionality with:
 * - Robust validation across all board templates
 * - Gamification animations and effects
 * - Sound feedback and haptic responses
 * - Enterprise-quality error handling
 */

import { 
  TaskItemResponseDTO, 
  TaskItemStatus 
} from '../types/tasks';
import { 
  BoardColumnDTO, 
  DragAnimationConfig, 
  DropValidation, 
  DragDropService,
  ColumnConfiguration
} from '../types/boards';
import { taskService } from './taskService';
import { toast } from 'sonner';
import { soundService } from './soundService';

/**
 * Animation manager for drag and drop effects
 */
class AnimationManager {
  private enabled = true;

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  getPickupAnimation(): DragAnimationConfig {
    return {
      duration: 250,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // More bouncy
      scale: 1.08,
      rotation: 3,
      opacity: 0.95
    };
  }

  getDropAnimation(success: boolean): DragAnimationConfig {
    if (success) {
      return {
        duration: 400,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce back
        scale: 1.15,
        rotation: 0,
        opacity: 1
      };
    } else {
      return {
        duration: 500,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        scale: 0.9,
        rotation: -8,
        opacity: 0.6
      };
    }
  }

  getHoverAnimation(): DragAnimationConfig {
    return {
      duration: 200,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      scale: 1.03,
      rotation: 1,
      opacity: 1
    };
  }

  // Enhanced particle effect with more visual impact
  createParticleEffect(element: HTMLElement, success: boolean) {
    if (!this.enabled) return;

    const colors = success 
      ? ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'] 
      : ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'];

    // Create more particles for better effect
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute rounded-full pointer-events-none';
      
      // Vary particle sizes
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = '50%';
      particle.style.top = '50%';
      particle.style.transform = 'translate(-50%, -50%)';
      particle.style.zIndex = '9999';
      particle.style.boxShadow = `0 0 ${size * 2}px ${colors[0]}40`;

      element.appendChild(particle);

      const angle = (i / 12) * Math.PI * 2;
      const distance = 60 + Math.random() * 40;
      const duration = 800 + Math.random() * 400;

      particle.animate([
        {
          transform: 'translate(-50%, -50%) scale(1)',
          opacity: '1'
        },
        {
          transform: `translate(${Math.cos(angle) * distance - 50}%, ${Math.sin(angle) * distance - 50}%) scale(0)`,
          opacity: '0'
        }
      ], {
        duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        particle.remove();
      };
    }

    // Add a central burst effect
    if (success) {
      const burst = document.createElement('div');
      burst.className = 'absolute rounded-full pointer-events-none';
      burst.style.width = '20px';
      burst.style.height = '20px';
      burst.style.background = 'radial-gradient(circle, #10B981, #34D399)';
      burst.style.left = '50%';
      burst.style.top = '50%';
      burst.style.transform = 'translate(-50%, -50%)';
      burst.style.zIndex = '9999';

      element.appendChild(burst);

      burst.animate([
        {
          transform: 'translate(-50%, -50%) scale(0)',
          opacity: '1'
        },
        {
          transform: 'translate(-50%, -50%) scale(2)',
          opacity: '0'
        }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        burst.remove();
      };
    }
  }

  // Create ripple effect for successful drops
  createRippleEffect(element: HTMLElement, color: string = '#10B981') {
    if (!this.enabled) return;

    const ripple = document.createElement('div');
    ripple.className = 'absolute rounded-full pointer-events-none';
    ripple.style.width = '10px';
    ripple.style.height = '10px';
    ripple.style.background = color;
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.zIndex = '9998';

    element.appendChild(ripple);

    ripple.animate([
      {
        transform: 'translate(-50%, -50%) scale(0)',
        opacity: '0.8'
      },
      {
        transform: 'translate(-50%, -50%) scale(4)',
        opacity: '0'
      }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => {
      ripple.remove();
    };
  }

  // Create glow effect for hover states
  createGlowEffect(element: HTMLElement, color: string = '#10B981') {
    if (!this.enabled) return;

    element.style.boxShadow = `0 0 20px ${color}40, 0 0 40px ${color}20`;
    element.style.transition = 'box-shadow 0.3s ease';
    
    // Remove glow after a delay
    setTimeout(() => {
      element.style.boxShadow = '';
    }, 2000);
  }
}

/**
 * Haptic feedback manager
 */
class HapticManager {
  private enabled = false;

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  private vibrate(pattern: number | number[]) {
    if (this.enabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  pickup() {
    this.vibrate(50); // Short vibration
  }

  drop() {
    this.vibrate(100); // Medium vibration
  }

  success() {
    this.vibrate([100, 50, 100]); // Success pattern
  }

  error() {
    this.vibrate([200, 100, 200]); // Error pattern
  }

  hover() {
    this.vibrate(25); // Very short vibration
  }
}

/**
 * Main drag and drop service implementation
 */
class DragDropServiceImpl implements DragDropService {
  private animationManager = new AnimationManager();
  private hapticManager = new HapticManager();
  private columnConfigurations: Map<number, ColumnConfiguration> = new Map();

  constructor() {
    // Initialize with default configurations
    this.initializeDefaultConfigurations();
  }

  private initializeDefaultConfigurations() {
    // Default configuration allows all transitions
    const defaultConfig: ColumnConfiguration = {
      allowedTransitions: [
        TaskItemStatus.NotStarted,
        TaskItemStatus.InProgress,
        TaskItemStatus.OnHold,
        TaskItemStatus.Pending,
        TaskItemStatus.Completed,
        TaskItemStatus.Cancelled
      ],
      autoAssign: false,
      requiresApproval: false,
      notificationSettings: {
        onTaskEnter: false,
        onTaskExit: false,
        onOverflow: true
      }
    };

    // Set default for all status types
    Object.values(TaskItemStatus).forEach(status => {
      if (typeof status === 'number') {
        this.columnConfigurations.set(status, { ...defaultConfig });
      }
    });

    // Customize specific configurations
    this.columnConfigurations.set(TaskItemStatus.Completed, {
      ...defaultConfig,
      allowedTransitions: [TaskItemStatus.InProgress, TaskItemStatus.OnHold],
      notificationSettings: {
        onTaskEnter: true,
        onTaskExit: false,
        onOverflow: false
      }
    });

    this.columnConfigurations.set(TaskItemStatus.Cancelled, {
      ...defaultConfig,
      allowedTransitions: [TaskItemStatus.NotStarted, TaskItemStatus.InProgress, TaskItemStatus.OnHold],
      requiresApproval: true,
      notificationSettings: {
        onTaskEnter: true,
        onTaskExit: true,
        onOverflow: false
      }
    });
  }

  /**
   * Configure the service with user preferences
   */
  configure(settings: {
    enableSounds?: boolean;
    enableAnimations?: boolean;
    enableHaptics?: boolean;
    columnConfigurations?: Map<number, ColumnConfiguration>;
  }) {
    if (settings.enableSounds !== undefined) {
      soundService.setEnabled(settings.enableSounds);
    }

    if (settings.enableAnimations !== undefined) {
      if (settings.enableAnimations) {
        this.animationManager.enable();
      } else {
        this.animationManager.disable();
      }
    }

    if (settings.enableHaptics !== undefined) {
      if (settings.enableHaptics) {
        this.hapticManager.enable();
      } else {
        this.hapticManager.disable();
      }
    }

    if (settings.columnConfigurations) {
      this.columnConfigurations = settings.columnConfigurations;
    }
  }

  /**
   * Validate if a task can be dropped in a target column
   */
  validateDrop(task: TaskItemResponseDTO, targetColumn: BoardColumnDTO): DropValidation {
    const currentStatus = parseInt(task.status);
    const targetStatus = targetColumn.status;

    // Check if it's the same column
    if (currentStatus === targetStatus) {
      return {
        isValid: false,
        reason: 'Task is already in this column',
        suggestions: ['Try moving to a different column']
      };
    }

    // Get column configuration
    const config = this.columnConfigurations.get(targetStatus);
    if (!config) {
      return {
        isValid: true // Default to allow if no specific config
      };
    }

    // Check allowed transitions
    if (config.allowedTransitions && !config.allowedTransitions.includes(currentStatus)) {
      const allowedColumnNames = config.allowedTransitions
        .map(status => this.getStatusDisplayName(status))
        .join(', ');
      
      return {
        isValid: false,
        reason: `Tasks can only be moved to "${targetColumn.name}" from: ${allowedColumnNames}`,
        suggestions: [
          'Move the task to an intermediate column first',
          'Check your workflow configuration'
        ]
      };
    }

    // Check max tasks limit
    if (config.maxTasks && config.maxTasks > 0) {
      // This would need to be passed from the component
      // For now, we'll assume it's valid
    }

    // Check if approval is required
    if (config.requiresApproval) {
      return {
        isValid: true,
        reason: 'This move requires approval',
        suggestions: ['The task will be marked as pending approval']
      };
    }

    return { isValid: true };
  }

  /**
   * Execute the task move operation
   */
  async executeMove(
    taskId: number, 
    fromColumn: BoardColumnDTO, 
    toColumn: BoardColumnDTO
  ): Promise<boolean> {
    try {
      // Play pickup sound
      soundService.playDragPickup();
      this.hapticManager.pickup();

      // Update task status
      console.log(`🔄 DragDropService: Moving task ${taskId} to column status:`, toColumn.status, typeof toColumn.status);
      await taskService.updateTaskStatus(taskId, toColumn.status);

      // Play success effects
      soundService.playDragDrop();
      this.hapticManager.success();

      return true;
    } catch (error) {
      console.error('Failed to move task:', error);
      
      // Play error effects
      soundService.playError();
      this.hapticManager.error();

      return false;
    }
  }

  /**
   * Get appropriate animation for move operation
   */
  getDropAnimation(fromColumn: BoardColumnDTO, toColumn: BoardColumnDTO): DragAnimationConfig {
    const distance = Math.abs(fromColumn.order - toColumn.order);
    const isForward = toColumn.order > fromColumn.order;

    return {
      duration: 300 + (distance * 50),
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      scale: 1.0,
      rotation: isForward ? 5 : -5,
      opacity: 1
    };
  }

  /**
   * Play sound for move operation
   */
  playMoveSound(success: boolean) {
    if (success) {
      soundService.playSuccess();
    } else {
      soundService.playError();
    }
  }

  /**
   * Show notification for successful/failed moves
   */
  showMoveNotification(
    task: TaskItemResponseDTO, 
    fromColumn: BoardColumnDTO, 
    toColumn: BoardColumnDTO
  ) {
    const config = this.columnConfigurations.get(toColumn.status);
    
    if (config?.requiresApproval) {
      toast.info('🔄 Move Pending Approval', {
        description: `"${task.title}" moved to ${toColumn.name} - awaiting approval`,
        duration: 4000,
      });
    } else {
      toast.success('✨ Quest Moved Successfully!', {
        description: `"${task.title}" moved from ${fromColumn.name} to ${toColumn.name}`,
        duration: 3000,
      });
    }

    // Show additional notifications based on column settings
    if (config?.notificationSettings?.onTaskEnter) {
      toast.info(`📥 Task entered ${toColumn.name}`, {
        description: `"${task.title}" is now in ${toColumn.name}`,
        duration: 2000,
      });
    }
  }

  /**
   * Handle drag start event
   */
  onDragStart(task: TaskItemResponseDTO, element?: HTMLElement) {
    soundService.playDragPickup();
    this.hapticManager.pickup();

    if (element) {
      const animation = this.animationManager.getPickupAnimation();
      element.style.transform = `scale(${animation.scale}) rotate(${animation.rotation}deg)`;
      element.style.opacity = animation.opacity.toString();
      element.style.transition = `all ${animation.duration}ms ${animation.easing}`;
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(column: BoardColumnDTO, element?: HTMLElement) {
    this.hapticManager.hover();

    if (element) {
      const animation = this.animationManager.getHoverAnimation();
      element.style.transform = `scale(${animation.scale}) rotate(${animation.rotation}deg)`;
      element.style.transition = `all ${animation.duration}ms ${animation.easing}`;
      this.animationManager.createGlowEffect(element);
    }
  }

  /**
   * Handle drag end event
   */
  onDragEnd(success: boolean, element?: HTMLElement) {
    if (success) {
      soundService.playDragDrop();
      this.hapticManager.success();
    } else {
      soundService.playError();
      this.hapticManager.error();
    }

    if (element) {
      const animation = this.animationManager.getDropAnimation(success);
      element.style.transform = `scale(${animation.scale}) rotate(${animation.rotation}deg)`;
      element.style.opacity = animation.opacity.toString();
      element.style.transition = `all ${animation.duration}ms ${animation.easing}`;

      // Create particle effect
      this.animationManager.createParticleEffect(element, success);

      // Reset styles after animation
      setTimeout(() => {
        element.style.transform = '';
        element.style.opacity = '';
        element.style.transition = '';
      }, animation.duration);
    }
  }

  /**
   * Get user-friendly status display name
   */
  private getStatusDisplayName(status: TaskItemStatus): string {
    const statusNames: Record<TaskItemStatus, string> = {
      [TaskItemStatus.NotStarted]: 'Not Started',
      [TaskItemStatus.InProgress]: 'In Progress',
      [TaskItemStatus.OnHold]: 'On Hold',
      [TaskItemStatus.Pending]: 'Pending',
      [TaskItemStatus.Completed]: 'Completed',
      [TaskItemStatus.Cancelled]: 'Cancelled'
    };

    return statusNames[status] || 'Unknown';
  }

  /**
   * Create optimistic update for UI responsiveness
   */
  createOptimisticUpdate(
    tasks: TaskItemResponseDTO[],
    taskId: number,
    newStatus: TaskItemStatus
  ): TaskItemResponseDTO[] {
    return tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus.toString() }
        : task
    );
  }

  /**
   * Revert optimistic update on failure
   */
  revertOptimisticUpdate(
    tasks: TaskItemResponseDTO[],
    taskId: number,
    originalStatus: string
  ): TaskItemResponseDTO[] {
    return tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: originalStatus }
        : task
    );
  }

  /**
   * Get statistics for a column
   */
  getColumnStats(tasks: TaskItemResponseDTO[], column: BoardColumnDTO) {
    const columnTasks = tasks.filter(task => task.status === column.status.toString());
    const config = this.columnConfigurations.get(column.status);

    return {
      taskCount: columnTasks.length,
      maxTasks: config?.maxTasks || null,
      isOverCapacity: config?.maxTasks ? columnTasks.length > config.maxTasks : false,
      averageTimeInColumn: this.calculateAverageTimeInColumn(),
      throughput: this.calculateThroughput(columnTasks)
    };
  }

  private calculateAverageTimeInColumn(): number {
    // Placeholder - would calculate based on task history
    return 2.5; // days
  }

  private calculateThroughput(tasks: TaskItemResponseDTO[]): number {
    // Placeholder - would calculate tasks completed per time period
    return tasks.length / 7; // tasks per week
  }
}

// Export singleton instance
export const dragDropService = new DragDropServiceImpl();
export default dragDropService;

// Export types for external use
export type {
  DragAnimationConfig,
  DropValidation,
  ColumnConfiguration
} from '../types/boards'; 
