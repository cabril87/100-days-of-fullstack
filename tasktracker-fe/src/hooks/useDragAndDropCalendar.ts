import { useState, useCallback, useRef, useEffect } from 'react';
import { calendarSignalRService } from '@/lib/services/calendarSignalRService';
import { apiService } from '@/lib/services/apiService';

interface DragEvent {
  eventId: number;
  type: 'event' | 'timeSlot' | 'availabilityBlock';
  data: any;
  originalPosition: {
    startTime: string;
    endTime: string;
    memberId?: number;
  };
}

interface DropZone {
  id: string;
  type: 'timeSlot' | 'day' | 'member';
  accepts: string[];
  targetTime?: string;
  targetMember?: number;
}

interface DragOperation {
  id: string;
  type: 'move' | 'resize' | 'copy' | 'reschedule';
  eventId: number;
  fromPosition: any;
  toPosition: any;
  timestamp: Date;
}

export function useDragAndDropCalendar(familyId: number) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragEvent | null>(null);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [isValidDrop, setIsValidDrop] = useState(false);
  const [undoStack, setUndoStack] = useState<DragOperation[]>([]);
  const [redoStack, setRedoStack] = useState<DragOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  const dragRef = useRef<HTMLElement | null>(null);
  const dropRef = useRef<HTMLElement | null>(null);

  // Initialize drag and drop handlers
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggedItem(null);
        setIsValidDrop(false);
      }
    };

    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, [isDragging]);

  // Real-time conflict detection
  useEffect(() => {
    const unsubscribe = calendarSignalRService.on('onConflictDetected', (data) => {
      setConflicts(prev => [...prev, data.conflict]);
    });

    return unsubscribe;
  }, []);

  // Start dragging an event
  const handleDragStart = useCallback((event: DragEvent, element: HTMLElement) => {
    setIsDragging(true);
    setDraggedItem(event);
    dragRef.current = element;

    // Set drag data
    if (event.type === 'event') {
      element.setAttribute('draggable', 'true');
      element.style.opacity = '0.7';
      element.style.cursor = 'grabbing';
    }

    // Show available drop zones
    updateDropZones(event);
  }, []);

  // Handle drag over drop zones
  const handleDragOver = useCallback((e: React.DragEvent, zone: DropZone) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Check if this is a valid drop zone for the dragged item
    const isValid = zone.accepts.includes(draggedItem.type);
    setIsValidDrop(isValid);

    if (isValid) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }, [draggedItem]);

  // Handle drop operation
  const handleDrop = useCallback(async (e: React.DragEvent, zone: DropZone) => {
    e.preventDefault();
    
    if (!draggedItem || !isValidDrop || isProcessing) return;

    setIsProcessing(true);

    try {
      // Calculate new position
      const newPosition = calculateNewPosition(draggedItem, zone);
      
      // Check for conflicts before applying
      const conflictCheck = await checkForConflicts(draggedItem, newPosition);
      
      if (conflictCheck.hasConflicts && !conflictCheck.userConfirmed) {
        // Show conflict resolution dialog
        const userChoice = await showConflictDialog(conflictCheck.conflicts);
        if (userChoice === 'cancel') {
          setIsProcessing(false);
          return;
        }
      }

      // Create operation for undo/redo
      const operation: DragOperation = {
        id: `drag-${Date.now()}`,
        type: 'move',
        eventId: draggedItem.eventId,
        fromPosition: draggedItem.originalPosition,
        toPosition: newPosition,
        timestamp: new Date()
      };

      // Apply the operation
      await applyDragOperation(operation);

      // Add to undo stack
      setUndoStack(prev => [...prev, operation]);
      setRedoStack([]); // Clear redo stack when new operation is performed

      // Trigger real-time update
      await notifyDragOperation(operation);

    } catch (error) {
      console.error('Drag operation failed:', error);
      // Show error notification
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
      setDraggedItem(null);
      setIsValidDrop(false);
    }
  }, [draggedItem, isValidDrop, isProcessing]);

  // Update available drop zones based on dragged item
  const updateDropZones = useCallback((event: DragEvent) => {
    const zones: DropZone[] = [];

    if (event.type === 'event') {
      // Add time slot drop zones
      zones.push({
        id: 'time-slots',
        type: 'timeSlot',
        accepts: ['event']
      });

      // Add member-specific zones
      zones.push({
        id: 'member-columns',
        type: 'member',
        accepts: ['event']
      });
    }

    setDropZones(zones);
  }, []);

  // Calculate new position for dropped item
  const calculateNewPosition = useCallback((draggedItem: DragEvent, zone: DropZone) => {
    const originalDuration = new Date(draggedItem.originalPosition.endTime).getTime() - 
                           new Date(draggedItem.originalPosition.startTime).getTime();

    let newStartTime: Date;
    let newEndTime: Date;

    if (zone.targetTime) {
      newStartTime = new Date(zone.targetTime);
      newEndTime = new Date(newStartTime.getTime() + originalDuration);
    } else {
      // Use current position with member change only
      newStartTime = new Date(draggedItem.originalPosition.startTime);
      newEndTime = new Date(draggedItem.originalPosition.endTime);
    }

    return {
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
      memberId: zone.targetMember || draggedItem.originalPosition.memberId
    };
  }, []);

  // Check for conflicts with the new position
  const checkForConflicts = useCallback(async (draggedItem: DragEvent, newPosition: any) => {
    try {
      const response = await apiService.post('/v1/family/calendar/check-conflicts', {
        eventId: draggedItem.eventId,
        newStartTime: newPosition.startTime,
        newEndTime: newPosition.endTime,
        memberId: newPosition.memberId
      });

      // Type the response properly
      if (response && typeof response === 'object' && 'data' in response) {
        const typedResponse = response as { 
          data: { 
            hasConflicts: boolean; 
            conflicts: any[]; 
          } 
        };
        
        return {
          hasConflicts: typedResponse.data.hasConflicts || false,
          conflicts: typedResponse.data.conflicts || [],
          userConfirmed: false
        };
      }

      return { hasConflicts: false, conflicts: [], userConfirmed: false };
    } catch (error) {
      console.error('Conflict check failed:', error);
      return { hasConflicts: false, conflicts: [], userConfirmed: false };
    }
  }, []);

  // Show conflict resolution dialog
  const showConflictDialog = useCallback(async (conflicts: any[]): Promise<'proceed' | 'cancel' | 'reschedule'> => {
    return new Promise((resolve) => {
      // This would trigger a modal/dialog component
      window.dispatchEvent(new CustomEvent('showConflictDialog', {
        detail: {
          conflicts,
          onResolve: resolve
        }
      }));
    });
  }, []);

  // Apply the drag operation to the backend
  const applyDragOperation = useCallback(async (operation: DragOperation) => {
    try {
      const response = await apiService.put(`/v1/family/${familyId}/calendar/events/${operation.eventId}`, {
        startTime: operation.toPosition.startTime,
        endTime: operation.toPosition.endTime,
        memberId: operation.toPosition.memberId,
        operationType: operation.type,
        operationId: operation.id
      });

      return response.data;
    } catch (error) {
      console.error('Failed to apply drag operation:', error);
      throw error;
    }
  }, [familyId]);

  // Notify other users of the drag operation via SignalR
  const notifyDragOperation = useCallback(async (operation: DragOperation) => {
    try {
      // This would be handled by the calendar service real-time updates
      window.dispatchEvent(new CustomEvent('calendarEventMoved', {
        detail: operation
      }));
    } catch (error) {
      console.error('Failed to notify drag operation:', error);
    }
  }, []);

  // Undo last operation
  const undo = useCallback(async () => {
    if (undoStack.length === 0) return;

    const lastOperation = undoStack[undoStack.length - 1];
    setIsProcessing(true);

    try {
      // Reverse the operation
      const reverseOperation: DragOperation = {
        ...lastOperation,
        id: `undo-${Date.now()}`,
        fromPosition: lastOperation.toPosition,
        toPosition: lastOperation.fromPosition
      };

      await applyDragOperation(reverseOperation);

      // Update stacks
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, lastOperation]);

      await notifyDragOperation(reverseOperation);
    } catch (error) {
      console.error('Undo operation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [undoStack, applyDragOperation, notifyDragOperation]);

  // Redo last undone operation
  const redo = useCallback(async () => {
    if (redoStack.length === 0) return;

    const lastUndone = redoStack[redoStack.length - 1];
    setIsProcessing(true);

    try {
      await applyDragOperation(lastUndone);

      // Update stacks
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, lastUndone]);

      await notifyDragOperation(lastUndone);
    } catch (error) {
      console.error('Redo operation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [redoStack, applyDragOperation, notifyDragOperation]);

  // Smart snap-to-grid functionality
  const snapToGrid = useCallback((time: Date, granularity: number = 15): Date => {
    const minutes = time.getMinutes();
    const remainder = minutes % granularity;
    
    if (remainder === 0) return time;
    
    const snappedMinutes = remainder < granularity / 2 
      ? minutes - remainder 
      : minutes + (granularity - remainder);
    
    const snappedTime = new Date(time);
    snappedTime.setMinutes(snappedMinutes, 0, 0);
    
    return snappedTime;
  }, []);

  // Get drag preview component
  const getDragPreview = useCallback(() => {
    if (!draggedItem || !isDragging) return null;

    return {
      type: draggedItem.type,
      data: draggedItem.data,
      isValid: isValidDrop
    };
  }, [draggedItem, isDragging, isValidDrop]);

  // Cleanup function
  const cleanup = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
    setDropZones([]);
    setIsValidDrop(false);
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '';
      dragRef.current.style.cursor = '';
    }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'Z' || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    // State
    isDragging,
    draggedItem,
    dropZones,
    isValidDrop,
    isProcessing,
    conflicts,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDrop,
    
    // Operations
    undo,
    redo,
    cleanup,
    
    // Utilities
    snapToGrid,
    getDragPreview,
    
    // Refs
    dragRef,
    dropRef
  };
} 