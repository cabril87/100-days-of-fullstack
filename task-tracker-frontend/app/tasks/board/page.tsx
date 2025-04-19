"use client";

import React from 'react';
import { TaskBoard } from '@/components/TaskBoard';
import { Separator } from '@/components/ui/separator';

export default function TaskBoardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
        <p className="text-muted-foreground">
          Drag and drop tasks between columns to update their status
        </p>
      </div>
      
      <Separator />
      
      <TaskBoard />
    </div>
  );
} 