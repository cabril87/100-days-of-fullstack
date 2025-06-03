'use client';

/**
 * Live Task Movements Component
 * Shows real-time task movements between columns with smooth animations
 */

import React, { useEffect, useState } from 'react';

// Components
import { Badge } from '@/components/ui/badge';

// Icons
import { ArrowRight, Move, User } from 'lucide-react';

// Utils
import { cn } from '@/lib/utils';

interface TaskMovement {
  id: string;
  taskId: number;
  taskTitle: string;
  fromColumnId: string;
  fromColumnName: string;
  toColumnId: string;
  toColumnName: string;
  userId: string;
  userName: string;
  userColor: string;
  timestamp: number;
  duration?: number; // Animation duration in ms
}

interface LiveTaskMovementsProps {
  movements: TaskMovement[];
  boardRef: React.RefObject<HTMLElement>;
  onMovementComplete?: (movementId: string) => void;
  className?: string;
}

// Individual movement animation component
function TaskMovementAnimation({ 
  movement, 
  boardRef, 
  onComplete 
}: { 
  movement: TaskMovement; 
  boardRef: React.RefObject<HTMLElement>;
  onComplete?: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [sourcePosition, setSourcePosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate positions
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const sourceColumn = board.querySelector(`[data-column-id="${movement.fromColumnId}"]`);
    const targetColumn = board.querySelector(`[data-column-id="${movement.toColumnId}"]`);

    if (sourceColumn && targetColumn) {
      const boardRect = board.getBoundingClientRect();
      const sourceRect = sourceColumn.getBoundingClientRect();
      const targetRect = targetColumn.getBoundingClientRect();

      setSourcePosition({
        x: sourceRect.left - boardRect.left + sourceRect.width / 2,
        y: sourceRect.top - boardRect.top + sourceRect.height / 2
      });

      setTargetPosition({
        x: targetRect.left - boardRect.left + targetRect.width / 2,
        y: targetRect.top - boardRect.top + targetRect.height / 2
      });

      // Start animation after positions are set
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [movement, boardRef]);

  // Handle animation completion
  useEffect(() => {
    if (!isAnimating) return;

    const duration = movement.duration || 1500;
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.(movement.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [isAnimating, movement.duration, movement.id, onComplete]);

  if (!isVisible) return null;

  const distance = Math.sqrt(
    Math.pow(targetPosition.x - sourcePosition.x, 2) +
    Math.pow(targetPosition.y - sourcePosition.y, 2)
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Task card representation */}
      <div
        className={cn(
          "absolute transition-all duration-1500 ease-in-out",
          "transform shadow-lg rounded-lg border-2",
          isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"
        )}
        style={{
          left: isAnimating ? targetPosition.x : sourcePosition.x,
          top: isAnimating ? targetPosition.y : sourcePosition.y,
          transform: 'translate(-50%, -50%)',
          borderColor: movement.userColor,
          background: `linear-gradient(135deg, ${movement.userColor}20, ${movement.userColor}40)`
        }}
      >
        <div className="p-2 min-w-48 max-w-64">
          <div className="flex items-center gap-2 mb-1">
            <Move className="h-3 w-3" style={{ color: movement.userColor }} />
            <span className="text-xs font-medium truncate">
              {movement.taskTitle}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{movement.userName}</span>
          </div>
          
          <div className="flex items-center gap-1 mt-1 text-xs">
            <Badge variant="outline" className="text-xs py-0">
              {movement.fromColumnName}
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <Badge variant="outline" className="text-xs py-0">
              {movement.toColumnName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Animation trail effect */}
      {isAnimating && distance > 50 && (
        <div
          className="absolute opacity-60"
          style={{
            left: sourcePosition.x,
            top: sourcePosition.y,
            width: distance,
            height: 2,
            background: `linear-gradient(90deg, ${movement.userColor}, transparent)`,
            transform: `rotate(${Math.atan2(
              targetPosition.y - sourcePosition.y,
              targetPosition.x - sourcePosition.x
            )}rad)`,
            transformOrigin: '0 50%',
            animation: 'fadeOut 1.5s ease-out forwards'
          }}
        />
      )}
    </div>
  );
}

export function LiveTaskMovements({
  movements,
  boardRef,
  onMovementComplete,
  className = ''
}: LiveTaskMovementsProps) {
  const [activeMovements, setActiveMovements] = useState<TaskMovement[]>([]);

  // Update active movements
  useEffect(() => {
    setActiveMovements(movements);
  }, [movements]);

  // Handle movement completion
  const handleMovementComplete = (movementId: string) => {
    setActiveMovements(prev => prev.filter(m => m.id !== movementId));
    onMovementComplete?.(movementId);
  };

  if (activeMovements.length === 0) return null;

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {activeMovements.map((movement) => (
        <TaskMovementAnimation
          key={movement.id}
          movement={movement}
          boardRef={boardRef}
          onComplete={handleMovementComplete}
        />
      ))}
      
      {/* CSS for fade out animation */}
      <style jsx>{`
        @keyframes fadeOut {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Hook for managing live task movements
export function useLiveTaskMovements() {
  const [movements, setMovements] = useState<TaskMovement[]>([]);

  const addMovement = (
    taskId: number,
    taskTitle: string,
    fromColumnId: string,
    fromColumnName: string,
    toColumnId: string,
    toColumnName: string,
    userId: string,
    userName: string,
    userColor: string = '#3B82F6'
  ) => {
    const movement: TaskMovement = {
      id: `movement-${Date.now()}-${Math.random()}`,
      taskId,
      taskTitle,
      fromColumnId,
      fromColumnName,
      toColumnId,
      toColumnName,
      userId,
      userName,
      userColor,
      timestamp: Date.now(),
      duration: 1500
    };

    setMovements(prev => [...prev, movement]);

    // Auto-remove after duration + buffer
    const duration = movement.duration || 1500;
    setTimeout(() => {
      setMovements(prev => prev.filter(m => m.id !== movement.id));
    }, duration + 500);
  };

  const removeMovement = (movementId: string) => {
    setMovements(prev => prev.filter(m => m.id !== movementId));
  };

  const clearMovements = () => {
    setMovements([]);
  };

  return {
    movements,
    addMovement,
    removeMovement,
    clearMovements
  };
} 