'use client';

/**
 * Multi-User Cursors Component
 * Displays real-time cursor positions of other users on the board
 */

import React, { useEffect, useState } from 'react';

// Types
interface UserCursor {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  lastUpdate: number;
  elementType?: 'task' | 'column' | 'board';
  elementId?: string;
}

interface MultiUserCursorsProps {
  cursors: UserCursor[];
  currentUserId: string;
  containerRef: React.RefObject<HTMLElement>;
  onCursorMove?: (x: number, y: number, elementType?: string, elementId?: string) => void;
  className?: string;
}

// Cursor component for individual user
function UserCursorPointer({ 
  cursor, 
  isVisible 
}: { 
  cursor: UserCursor; 
  isVisible: boolean 
}) {
  const [position, setPosition] = useState({ x: cursor.x, y: cursor.y });
  
  // Animate cursor movement
  useEffect(() => {
    setPosition({ x: cursor.x, y: cursor.y });
  }, [cursor.x, cursor.y]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-transform duration-150 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor pointer */}
      <div className="relative">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-md"
        >
          <path
            d="M5 3L19 12L11 14L8 21L5 3Z"
            fill={cursor.userColor}
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        
        {/* User name badge */}
        <div
          className="absolute top-6 left-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg max-w-32 truncate"
          style={{ backgroundColor: cursor.userColor }}
        >
          {cursor.userName}
        </div>
      </div>
    </div>
  );
}

export function MultiUserCursors({
  cursors,
  currentUserId,
  containerRef,
  onCursorMove,
  className = ''
}: MultiUserCursorsProps) {
  const [localCursors, setLocalCursors] = useState<UserCursor[]>([]);
  const [isMouseInContainer, setIsMouseInContainer] = useState(false);

  // Filter out current user's cursor and expired cursors
  useEffect(() => {
    const now = Date.now();
    const activeCursors = cursors.filter(cursor => 
      cursor.userId !== currentUserId && 
      (now - cursor.lastUpdate) < 10000 // Hide cursors after 10 seconds of inactivity
    );
    setLocalCursors(activeCursors);
  }, [cursors, currentUserId]);

  // Track mouse movement
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onCursorMove) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseInContainer) return;
      
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Determine what element the cursor is over
      const elementUnderCursor = document.elementFromPoint(event.clientX, event.clientY);
      let elementType: string | undefined;
      let elementId: string | undefined;
      
      if (elementUnderCursor) {
        // Check for task cards
        const taskCard = elementUnderCursor.closest('[data-task-id]');
        if (taskCard) {
          elementType = 'task';
          elementId = taskCard.getAttribute('data-task-id') || undefined;
        } else {
          // Check for columns
          const column = elementUnderCursor.closest('[data-column-id]');
          if (column) {
            elementType = 'column';
            elementId = column.getAttribute('data-column-id') || undefined;
          } else {
            elementType = 'board';
          }
        }
      }
      
      onCursorMove(x, y, elementType, elementId);
    };

    const handleMouseEnter = () => setIsMouseInContainer(true);
    const handleMouseLeave = () => setIsMouseInContainer(false);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, onCursorMove, isMouseInContainer]);

  // Don't render if no active cursors
  if (localCursors.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none z-40 ${className}`}>
      {localCursors.map((cursor) => (
        <UserCursorPointer
          key={cursor.userId}
          cursor={cursor}
          isVisible={true}
        />
      ))}
    </div>
  );
}

// Hook for managing cursor tracking
export function useMultiUserCursors(
  boardId: number,
  currentUserId: string,
  isEnabled: boolean = true
) {
  const [cursors, setCursors] = useState<UserCursor[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Simulate cursor updates (in real app, this would come from SignalR)
  useEffect(() => {
    if (!isEnabled || !isTracking) return;

    // Mock cursor data for demonstration
    const mockCursors: UserCursor[] = [
      {
        userId: 'user-2',
        userName: 'Alice Johnson',
        userColor: '#3B82F6',
        x: Math.random() * 800,
        y: Math.random() * 600,
        lastUpdate: Date.now(),
        elementType: 'task',
        elementId: '1'
      },
      {
        userId: 'user-3',
        userName: 'Bob Wilson',
        userColor: '#10B981',
        x: Math.random() * 800,
        y: Math.random() * 600,
        lastUpdate: Date.now(),
        elementType: 'column',
        elementId: 'todo'
      }
    ];

    setCursors(mockCursors);

    // Simulate cursor movement
    const interval = setInterval(() => {
      setCursors(prevCursors => 
        prevCursors.map(cursor => ({
          ...cursor,
          x: cursor.x + (Math.random() - 0.5) * 20,
          y: cursor.y + (Math.random() - 0.5) * 20,
          lastUpdate: Date.now()
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [boardId, isEnabled, isTracking]);

  const startTracking = () => setIsTracking(true);
  const stopTracking = () => setIsTracking(false);

  const sendCursorPosition = (x: number, y: number, elementType?: string, elementId?: string) => {
    // In real app, send cursor position via SignalR
    console.log('Cursor position:', { x, y, elementType, elementId });
  };

  return {
    cursors,
    isTracking,
    startTracking,
    stopTracking,
    sendCursorPosition
  };
} 