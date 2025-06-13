'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumnProps } from '../../lib/types/board';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Plus, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import { TaskCard } from '@/components/boards/TaskCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  tasks,
  onCreateTask,
  className
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      columnId: column.id,
      status: column.status,
    },
  });

  const taskIds = tasks.map(task => task.id.toString());

  // Get column color or default
  const getColumnColor = (color?: string) => {
    if (!color) return '#6B7280'; // Default gray
    return color;
  };

  const columnColor = getColumnColor(column.color);
  
  // Create CSS variables for the column color
  const columnStyle = {
    '--column-color': columnColor,
    '--column-color-light': `${columnColor}20`,
    '--column-color-dark': `${columnColor}40`,
  } as React.CSSProperties;

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full min-h-[500px] transition-all duration-200",
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5",
        className
      )}
      style={columnStyle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: columnColor }}
            />
            <CardTitle className="text-sm font-semibold">{column.name}</CardTitle>
          </div>
          
          <div className="flex items-center space-x-1">
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: `${columnColor}20`,
                color: columnColor,
                border: `1px solid ${columnColor}40`
              }}
            >
              {tasks.length}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quest
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3 pt-0">
        <div className="space-y-3">
          {/* Add Quest Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTask}
            className={cn(
              "w-full justify-start text-xs border-dashed transition-all duration-200",
              "hover:border-solid hover:bg-primary/5 hover:text-primary"
            )}
            style={{
              borderColor: `${columnColor}40`,
              color: `${columnColor}CC`,
            }}
          >
            <Plus className="h-3 w-3 mr-2" />
            Add Quest
          </Button>

          {/* Tasks */}
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <ScrollArea className="h-full">
              <div className="space-y-3 pr-2">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    columnColor={columnColor}
                  />
                ))}
                
                {tasks.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-center">
                    <div className="text-muted-foreground">
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="text-xs">
                        No quests yet.<br />
                        Drop tasks here or click &quot;Add Quest&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}; 