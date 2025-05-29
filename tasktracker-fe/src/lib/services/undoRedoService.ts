/**
 * Undo/Redo Service for Calendar Operations
 * 
 * This service provides comprehensive undo/redo functionality for:
 * - Calendar event operations (create, update, delete, move)
 * - Batch operations
 * - Availability changes
 * - Focus session management
 * - Smart scheduling actions
 */

import { apiService } from './apiService';
import { calendarSignalRService } from './calendarSignalRService';

// Operation types
type OperationType = 
  | 'create_event'
  | 'update_event'
  | 'delete_event'
  | 'move_event'
  | 'batch_operation'
  | 'availability_change'
  | 'focus_session'
  | 'smart_scheduling'
  | 'conflict_resolution';

interface BaseOperation {
  id: string;
  type: OperationType;
  timestamp: Date;
  userId: number;
  familyId: number;
  description: string;
  metadata?: Record<string, any>;
}

interface CreateEventOperation extends BaseOperation {
  type: 'create_event';
  data: {
    eventId: number;
    eventData: any;
  };
}

interface UpdateEventOperation extends BaseOperation {
  type: 'update_event';
  data: {
    eventId: number;
    originalData: any;
    newData: any;
    changedFields: string[];
  };
}

interface DeleteEventOperation extends BaseOperation {
  type: 'delete_event';
  data: {
    eventId: number;
    deletedEventData: any;
    relatedAttendees: any[];
  };
}

interface MoveEventOperation extends BaseOperation {
  type: 'move_event';
  data: {
    eventId: number;
    originalPosition: {
      startTime: string;
      endTime: string;
      memberId?: number;
    };
    newPosition: {
      startTime: string;
      endTime: string;
      memberId?: number;
    };
  };
}

interface BatchOperation extends BaseOperation {
  type: 'batch_operation';
  data: {
    operationType: string;
    affectedEvents: number[];
    originalStates: any[];
    newStates: any[];
    batchId: string;
  };
}

interface AvailabilityChangeOperation extends BaseOperation {
  type: 'availability_change';
  data: {
    memberId: number;
    timeSlot: {
      startTime: string;
      endTime: string;
    };
    originalStatus: string;
    newStatus: string;
    reason?: string;
  };
}

interface FocusSessionOperation extends BaseOperation {
  type: 'focus_session';
  data: {
    sessionId: string;
    memberId: number;
    action: 'start' | 'end' | 'pause' | 'resume';
    sessionData: any;
    availabilityBlocks?: any[];
  };
}

interface SmartSchedulingOperation extends BaseOperation {
  type: 'smart_scheduling';
  data: {
    action: 'accept_suggestion' | 'decline_suggestion' | 'apply_optimal_time';
    suggestionId: string;
    originalSchedule?: any;
    appliedChanges: any[];
  };
}

interface ConflictResolutionOperation extends BaseOperation {
  type: 'conflict_resolution';
  data: {
    conflictId: string;
    resolutionMethod: string;
    affectedEvents: number[];
    originalConflictState: any;
    resolvedState: any;
  };
}

type Operation = 
  | CreateEventOperation
  | UpdateEventOperation
  | DeleteEventOperation
  | MoveEventOperation
  | BatchOperation
  | AvailabilityChangeOperation
  | FocusSessionOperation
  | SmartSchedulingOperation
  | ConflictResolutionOperation;

interface UndoRedoState {
  undoStack: Operation[];
  redoStack: Operation[];
  maxHistorySize: number;
  isProcessing: boolean;
  lastOperation?: Operation;
}

interface UndoRedoEvents {
  onOperationAdded: (operation: Operation) => void;
  onOperationUndone: (operation: Operation) => void;
  onOperationRedone: (operation: Operation) => void;
  onStacksUpdated: (state: UndoRedoState) => void;
  onError: (error: string, operation?: Operation) => void;
}

class UndoRedoService {
  private state: UndoRedoState;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isInitialized = false;

  constructor() {
    this.state = {
      undoStack: [],
      redoStack: [],
      maxHistorySize: 50, // Maximum number of operations to keep in history
      isProcessing: false
    };

    this.initializeEventHandlers();
  }

  private initializeEventHandlers() {
    Object.keys({} as UndoRedoEvents).forEach(event => {
      this.eventHandlers.set(event, []);
    });

    // Listen for real-time operations from other users
    calendarSignalRService.on('onCalendarEventUpdated', this.handleRemoteOperation.bind(this));
    calendarSignalRService.on('onBatchOperationCompleted', this.handleRemoteBatchOperation.bind(this));
    
    this.isInitialized = true;
  }

  // #region Operation Recording

  /**
   * Record a new operation in the undo stack
   */
  public recordOperation(operation: Omit<Operation, 'id' | 'timestamp'>): string {
    const fullOperation: Operation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    } as Operation;

    // Add to undo stack
    this.state.undoStack.push(fullOperation);
    
    // Clear redo stack when new operation is recorded
    this.state.redoStack = [];
    
    // Maintain max history size
    if (this.state.undoStack.length > this.state.maxHistorySize) {
      this.state.undoStack = this.state.undoStack.slice(-this.state.maxHistorySize);
    }

    this.state.lastOperation = fullOperation;
    
    // Notify listeners
    this.emit('onOperationAdded', fullOperation);
    this.emit('onStacksUpdated', { ...this.state });

    console.log('Operation recorded:', fullOperation);
    return fullOperation.id;
  }

  /**
   * Record event creation
   */
  public recordEventCreation(
    eventId: number,
    eventData: any,
    userId: number,
    familyId: number
  ): string {
    return this.recordOperation({
      type: 'create_event',
      userId,
      familyId,
      description: `Created event: ${eventData.title}`,
      data: {
        eventId,
        eventData: { ...eventData }
      }
    });
  }

  /**
   * Record event update
   */
  public recordEventUpdate(
    eventId: number,
    originalData: any,
    newData: any,
    changedFields: string[],
    userId: number,
    familyId: number
  ): string {
    return this.recordOperation({
      type: 'update_event',
      userId,
      familyId,
      description: `Updated event: ${newData.title || originalData.title}`,
      data: {
        eventId,
        originalData: { ...originalData },
        newData: { ...newData },
        changedFields
      }
    });
  }

  /**
   * Record event deletion
   */
  public recordEventDeletion(
    eventId: number,
    deletedEventData: any,
    relatedAttendees: any[],
    userId: number,
    familyId: number
  ): string {
    return this.recordOperation({
      type: 'delete_event',
      userId,
      familyId,
      description: `Deleted event: ${deletedEventData.title}`,
      data: {
        eventId,
        deletedEventData: { ...deletedEventData },
        relatedAttendees: [...relatedAttendees]
      }
    });
  }

  /**
   * Record event move (drag and drop)
   */
  public recordEventMove(
    eventId: number,
    originalPosition: any,
    newPosition: any,
    userId: number,
    familyId: number
  ): string {
    return this.recordOperation({
      type: 'move_event',
      userId,
      familyId,
      description: `Moved event to ${new Date(newPosition.startTime).toLocaleString()}`,
      data: {
        eventId,
        originalPosition: { ...originalPosition },
        newPosition: { ...newPosition }
      }
    });
  }

  /**
   * Record batch operation
   */
  public recordBatchOperation(
    operationType: string,
    affectedEvents: number[],
    originalStates: any[],
    newStates: any[],
    batchId: string,
    userId: number,
    familyId: number
  ): string {
    return this.recordOperation({
      type: 'batch_operation',
      userId,
      familyId,
      description: `Batch ${operationType} on ${affectedEvents.length} events`,
      data: {
        operationType,
        affectedEvents: [...affectedEvents],
        originalStates: [...originalStates],
        newStates: [...newStates],
        batchId
      }
    });
  }

  /**
   * Record availability change
   */
  public recordAvailabilityChange(
    memberId: number,
    timeSlot: any,
    originalStatus: string,
    newStatus: string,
    userId: number,
    familyId: number,
    reason?: string
  ): string {
    return this.recordOperation({
      type: 'availability_change',
      userId,
      familyId,
      description: `Changed availability from ${originalStatus} to ${newStatus}`,
      data: {
        memberId,
        timeSlot: { ...timeSlot },
        originalStatus,
        newStatus,
        reason
      }
    });
  }

  /**
   * Record focus session operation
   */
  public recordFocusSession(
    sessionId: string,
    memberId: number,
    action: 'start' | 'end' | 'pause' | 'resume',
    sessionData: any,
    userId: number,
    familyId: number,
    availabilityBlocks?: any[]
  ): string {
    return this.recordOperation({
      type: 'focus_session',
      userId,
      familyId,
      description: `${action} focus session: ${sessionData.taskTitle || 'Untitled'}`,
      data: {
        sessionId,
        memberId,
        action,
        sessionData: { ...sessionData },
        availabilityBlocks: availabilityBlocks ? [...availabilityBlocks] : undefined
      }
    });
  }

  // #endregion

  // #region Undo/Redo Operations

  /**
   * Undo the last operation
   */
  public async undo(): Promise<boolean> {
    if (this.state.undoStack.length === 0 || this.state.isProcessing) {
      return false;
    }

    this.state.isProcessing = true;

    try {
      const operation = this.state.undoStack.pop()!;
      
      // Perform the undo operation
      const success = await this.performUndo(operation);
      
      if (success) {
        // Move to redo stack
        this.state.redoStack.push(operation);
        
        // Maintain max history size
        if (this.state.redoStack.length > this.state.maxHistorySize) {
          this.state.redoStack = this.state.redoStack.slice(-this.state.maxHistorySize);
        }

        this.emit('onOperationUndone', operation);
        this.emit('onStacksUpdated', { ...this.state });
        
        console.log('Operation undone:', operation);
        return true;
      } else {
        // Put the operation back if undo failed
        this.state.undoStack.push(operation);
        return false;
      }
    } catch (error) {
      console.error('Undo operation failed:', error);
      this.emit('onError', `Undo failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      this.state.isProcessing = false;
    }
  }

  /**
   * Redo the last undone operation
   */
  public async redo(): Promise<boolean> {
    if (this.state.redoStack.length === 0 || this.state.isProcessing) {
      return false;
    }

    this.state.isProcessing = true;

    try {
      const operation = this.state.redoStack.pop()!;
      
      // Perform the redo operation
      const success = await this.performRedo(operation);
      
      if (success) {
        // Move back to undo stack
        this.state.undoStack.push(operation);
        
        this.emit('onOperationRedone', operation);
        this.emit('onStacksUpdated', { ...this.state });
        
        console.log('Operation redone:', operation);
        return true;
      } else {
        // Put the operation back if redo failed
        this.state.redoStack.push(operation);
        return false;
      }
    } catch (error) {
      console.error('Redo operation failed:', error);
      this.emit('onError', `Redo failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      this.state.isProcessing = false;
    }
  }

  // #endregion

  // #region Undo/Redo Implementation

  private async performUndo(operation: Operation): Promise<boolean> {
    switch (operation.type) {
      case 'create_event':
        return this.undoEventCreation(operation as CreateEventOperation);
      
      case 'update_event':
        return this.undoEventUpdate(operation as UpdateEventOperation);
      
      case 'delete_event':
        return this.undoEventDeletion(operation as DeleteEventOperation);
      
      case 'move_event':
        return this.undoEventMove(operation as MoveEventOperation);
      
      case 'batch_operation':
        return this.undoBatchOperation(operation as BatchOperation);
      
      case 'availability_change':
        return this.undoAvailabilityChange(operation as AvailabilityChangeOperation);
      
      case 'focus_session':
        return this.undoFocusSession(operation as FocusSessionOperation);
      
      default:
        console.warn('Unknown operation type for undo:', operation.type);
        return false;
    }
  }

  private async performRedo(operation: Operation): Promise<boolean> {
    switch (operation.type) {
      case 'create_event':
        return this.redoEventCreation(operation as CreateEventOperation);
      
      case 'update_event':
        return this.redoEventUpdate(operation as UpdateEventOperation);
      
      case 'delete_event':
        return this.redoEventDeletion(operation as DeleteEventOperation);
      
      case 'move_event':
        return this.redoEventMove(operation as MoveEventOperation);
      
      case 'batch_operation':
        return this.redoBatchOperation(operation as BatchOperation);
      
      case 'availability_change':
        return this.redoAvailabilityChange(operation as AvailabilityChangeOperation);
      
      case 'focus_session':
        return this.redoFocusSession(operation as FocusSessionOperation);
      
      default:
        console.warn('Unknown operation type for redo:', operation.type);
        return false;
    }
  }

  // Specific undo implementations
  private async undoEventCreation(operation: CreateEventOperation): Promise<boolean> {
    try {
      await apiService.delete(`/v1/family/${operation.familyId}/calendar/events/${operation.data.eventId}`);
      return true;
    } catch (error) {
      console.error('Failed to undo event creation:', error);
      return false;
    }
  }

  private async undoEventUpdate(operation: UpdateEventOperation): Promise<boolean> {
    try {
      await apiService.put(`/v1/family/${operation.familyId}/calendar/events/${operation.data.eventId}`, 
        operation.data.originalData
      );
      return true;
    } catch (error) {
      console.error('Failed to undo event update:', error);
      return false;
    }
  }

  private async undoEventDeletion(operation: DeleteEventOperation): Promise<boolean> {
    try {
      await apiService.post(`/v1/family/${operation.familyId}/calendar/events`, 
        operation.data.deletedEventData
      );
      return true;
    } catch (error) {
      console.error('Failed to undo event deletion:', error);
      return false;
    }
  }

  private async undoEventMove(operation: MoveEventOperation): Promise<boolean> {
    try {
      await apiService.put(`/v1/family/${operation.familyId}/calendar/events/${operation.data.eventId}`, {
        startTime: operation.data.originalPosition.startTime,
        endTime: operation.data.originalPosition.endTime,
        memberId: operation.data.originalPosition.memberId
      });
      return true;
    } catch (error) {
      console.error('Failed to undo event move:', error);
      return false;
    }
  }

  private async undoBatchOperation(operation: BatchOperation): Promise<boolean> {
    try {
      // Restore original states for all affected events
      const restorePromises = operation.data.affectedEvents.map((eventId, index) => {
        const originalState = operation.data.originalStates[index];
        return apiService.put(`/v1/family/${operation.familyId}/calendar/events/${eventId}`, originalState);
      });

      await Promise.all(restorePromises);
      return true;
    } catch (error) {
      console.error('Failed to undo batch operation:', error);
      return false;
    }
  }

  private async undoAvailabilityChange(operation: AvailabilityChangeOperation): Promise<boolean> {
    try {
      await apiService.put('/v1/family/availability', {
        memberId: operation.data.memberId,
        timeSlot: operation.data.timeSlot,
        status: operation.data.originalStatus
      });
      return true;
    } catch (error) {
      console.error('Failed to undo availability change:', error);
      return false;
    }
  }

  private async undoFocusSession(operation: FocusSessionOperation): Promise<boolean> {
    try {
      // Reverse the focus session action
      const reverseAction = this.getReverseFocusAction(operation.data.action);
      
      if (reverseAction) {
        await apiService.post('/v1/focus/session/action', {
          sessionId: operation.data.sessionId,
          memberId: operation.data.memberId,
          action: reverseAction
        });
      }

      // Restore availability blocks if they were affected
      if (operation.data.availabilityBlocks) {
        await apiService.post('/v1/family/availability/restore-blocks', {
          blocks: operation.data.availabilityBlocks
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to undo focus session:', error);
      return false;
    }
  }

  // Specific redo implementations (similar structure to undo but applying the forward action)
  private async redoEventCreation(operation: CreateEventOperation): Promise<boolean> {
    try {
      await apiService.post(`/v1/family/${operation.familyId}/calendar/events`, 
        operation.data.eventData
      );
      return true;
    } catch (error) {
      console.error('Failed to redo event creation:', error);
      return false;
    }
  }

  private async redoEventUpdate(operation: UpdateEventOperation): Promise<boolean> {
    try {
      await apiService.put(`/v1/family/${operation.familyId}/calendar/events/${operation.data.eventId}`, 
        operation.data.newData
      );
      return true;
    } catch (error) {
      console.error('Failed to redo event update:', error);
      return false;
    }
  }

  private async redoEventDeletion(operation: DeleteEventOperation): Promise<boolean> {
    try {
      await apiService.delete(`/v1/family/${operation.familyId}/calendar/events/${operation.data.eventId}`);
      return true;
    } catch (error) {
      console.error('Failed to redo event deletion:', error);
      return false;
    }
  }

  private async redoEventMove(operation: MoveEventOperation): Promise<boolean> {
    try {
      await apiService.put(`/v1/family/${operation.familyId}/calendar/events/${operation.data.eventId}`, {
        startTime: operation.data.newPosition.startTime,
        endTime: operation.data.newPosition.endTime,
        memberId: operation.data.newPosition.memberId
      });
      return true;
    } catch (error) {
      console.error('Failed to redo event move:', error);
      return false;
    }
  }

  private async redoBatchOperation(operation: BatchOperation): Promise<boolean> {
    try {
      // Apply new states for all affected events
      const applyPromises = operation.data.affectedEvents.map((eventId, index) => {
        const newState = operation.data.newStates[index];
        return apiService.put(`/v1/family/${operation.familyId}/calendar/events/${eventId}`, newState);
      });

      await Promise.all(applyPromises);
      return true;
    } catch (error) {
      console.error('Failed to redo batch operation:', error);
      return false;
    }
  }

  private async redoAvailabilityChange(operation: AvailabilityChangeOperation): Promise<boolean> {
    try {
      await apiService.put('/v1/family/availability', {
        memberId: operation.data.memberId,
        timeSlot: operation.data.timeSlot,
        status: operation.data.newStatus,
        reason: operation.data.reason
      });
      return true;
    } catch (error) {
      console.error('Failed to redo availability change:', error);
      return false;
    }
  }

  private async redoFocusSession(operation: FocusSessionOperation): Promise<boolean> {
    try {
      await apiService.post('/v1/focus/session/action', {
        sessionId: operation.data.sessionId,
        memberId: operation.data.memberId,
        action: operation.data.action,
        sessionData: operation.data.sessionData
      });

      return true;
    } catch (error) {
      console.error('Failed to redo focus session:', error);
      return false;
    }
  }

  // #endregion

  // #region Helper Methods

  private getReverseFocusAction(action: string): string | null {
    const reverseMap: Record<string, string> = {
      'start': 'end',
      'end': 'start',
      'pause': 'resume',
      'resume': 'pause'
    };
    
    return reverseMap[action] || null;
  }

  private handleRemoteOperation(data: any): void {
    // Handle operations from other users
    // We might want to merge or invalidate local operations that conflict
    console.log('Remote operation detected:', data);
    
    // Check if this conflicts with any pending local operations
    this.checkForConflicts(data);
  }

  private handleRemoteBatchOperation(data: any): void {
    console.log('Remote batch operation detected:', data);
    this.checkForConflicts(data);
  }

  private checkForConflicts(remoteData: any): void {
    // Implementation for checking if remote operations conflict with local undo stack
    // This is important for collaborative editing scenarios
  }

  // #endregion

  // #region Public API

  /**
   * Get current state
   */
  public getState(): UndoRedoState {
    return { ...this.state };
  }

  /**
   * Check if undo is available
   */
  public canUndo(): boolean {
    return this.state.undoStack.length > 0 && !this.state.isProcessing;
  }

  /**
   * Check if redo is available
   */
  public canRedo(): boolean {
    return this.state.redoStack.length > 0 && !this.state.isProcessing;
  }

  /**
   * Get description of next undo operation
   */
  public getNextUndoDescription(): string | null {
    const lastOperation = this.state.undoStack[this.state.undoStack.length - 1];
    return lastOperation ? lastOperation.description : null;
  }

  /**
   * Get description of next redo operation
   */
  public getNextRedoDescription(): string | null {
    const lastOperation = this.state.redoStack[this.state.redoStack.length - 1];
    return lastOperation ? lastOperation.description : null;
  }

  /**
   * Clear all history
   */
  public clearHistory(): void {
    this.state.undoStack = [];
    this.state.redoStack = [];
    this.state.lastOperation = undefined;
    
    this.emit('onStacksUpdated', { ...this.state });
  }

  /**
   * Get operation history
   */
  public getHistory(): { undoOperations: Operation[], redoOperations: Operation[] } {
    return {
      undoOperations: [...this.state.undoStack],
      redoOperations: [...this.state.redoStack]
    };
  }

  // #endregion

  // #region Event Management

  public on<K extends keyof UndoRedoEvents>(event: K, callback: UndoRedoEvents[K]): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)!.push(callback);
    
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(callback);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // #endregion
}

// Create and export singleton instance
export const undoRedoService = new UndoRedoService();

// Export types for use in components
export type {
  Operation,
  OperationType,
  UndoRedoState,
  UndoRedoEvents,
  CreateEventOperation,
  UpdateEventOperation,
  DeleteEventOperation,
  MoveEventOperation,
  BatchOperation,
  AvailabilityChangeOperation,
  FocusSessionOperation,
  SmartSchedulingOperation,
  ConflictResolutionOperation
}; 