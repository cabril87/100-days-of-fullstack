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

import { Metadata } from 'next';
import { BoardTabs } from '../../../components/boards/BoardTabs';
import { BoardPageProps } from '../../../lib/props/boards/board.props';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateMetadata({ params }: BoardPageProps): Promise<Metadata> {
  return {
    title: `Quest Board | TaskTracker`,
    description: 'Manage your family tasks with visual Kanban board',
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  const boardId = parseInt(id, 10);

  if (isNaN(boardId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Invalid Board</h1>
          <p className="text-muted-foreground">The board ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <BoardTabs 
      boardId={boardId} 
      initialTab="board"
    />
  );
} 