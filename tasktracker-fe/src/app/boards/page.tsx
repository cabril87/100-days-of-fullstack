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
import { BoardsList } from '../../components/boards/BoardsList';

export const metadata: Metadata = {
  title: 'Quest Boards | TaskTracker',
  description: 'Organize your family tasks with visual Kanban boards',
};

export default function BoardsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎯 Quest Boards
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Organize your family tasks visually with Kanban boards. 
            Drag and drop tasks between columns to track progress and stay organized.
          </p>
        </div>

        {/* Boards List */}
        <BoardsList />
      </div>
    </div>
  );
} 