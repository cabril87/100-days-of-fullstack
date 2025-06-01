'use client';

import React from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function BoardPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-6 space-y-6">
        <KanbanBoard showHeader={true} />
      </div>
    </AuthGuard>
  );
} 