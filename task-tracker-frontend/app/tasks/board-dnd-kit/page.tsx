"use client";

import React from 'react';
import { TaskBoardDndKit } from '@/components/TaskBoardDndKit';
import { Separator } from '@/components/ui/separator';

export default function TaskBoardDndKitPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Board (dnd-kit)</h1>
        <p className="text-muted-foreground">
          Modern drag and drop interface using dnd-kit
        </p>
      </div>
      
      <Separator />
      
      <TaskBoardDndKit />
    </div>
  );
} 