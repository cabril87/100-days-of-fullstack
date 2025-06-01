'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/lib/types/task';
import { KanbanTaskCard } from './KanbanTaskCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  taskCount: number;
  color: string;
  boardView: 'compact' | 'detailed';
}

export function KanbanColumn({ 
  id, 
  title, 
  tasks, 
  taskCount, 
  color,
  boardView 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // Create array of task IDs for SortableContext
  const taskIds = tasks.map(task => task.id.toString());

  return (
    <Card 
      ref={setNodeRef}
      className={`flex flex-col min-h-[500px] transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary ring-opacity-50 shadow-lg' : ''
      } ${color}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {taskCount}
            </Badge>
          </div>
          
          <Link href={`/tasks/new?status=${title.toLowerCase().replace(' ', '_')}`}>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {tasks.length === 0 ? (
          <div 
            className={`flex flex-col items-center justify-center h-32 text-center border-2 border-dashed rounded-lg transition-colors ${
              isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <p className="text-sm text-muted-foreground mb-2">No tasks</p>
            <p className="text-xs text-muted-foreground/70">
              Drop tasks here or click + to add
            </p>
          </div>
        ) : (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks.map((task) => (
                <KanbanTaskCard 
                  key={task.id} 
                  task={task} 
                  boardView={boardView}
                  isDragging={false}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}

export default KanbanColumn; 