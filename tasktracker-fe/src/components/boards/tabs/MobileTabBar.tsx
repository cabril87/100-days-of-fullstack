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
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import {
  Kanban,
  Columns,
  Settings
} from 'lucide-react';

import { MobileTabBarProps, BoardTabType } from '@/lib/types/board-tabs';

const TAB_CONFIG = {
  board: {
    label: 'Board',
    shortLabel: 'Board',
    icon: Kanban,
    description: 'View tasks'
  },
  columns: {
    label: 'Columns',
    shortLabel: 'Columns',
    icon: Columns,
    description: 'Edit columns'
  },
  settings: {
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings,
    description: 'Board settings'
  }
} as const;

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn("flex w-full", className)}>
      {(Object.keys(TAB_CONFIG) as BoardTabType[]).map((tab) => {
        const config = TAB_CONFIG[tab];
        const Icon = config.icon;
        const isActive = activeTab === tab;

        return (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => onTabChange(tab)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 px-2 py-3 h-auto rounded-none border-b-2 transition-all duration-200",
              isActive
                ? "border-blue-600 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <Icon className={cn(
              "h-5 w-5 transition-colors duration-200",
              isActive ? "text-blue-600" : "text-gray-500"
            )} />
            <span className={cn(
              "text-xs font-medium transition-colors duration-200",
              isActive ? "text-blue-600" : "text-gray-500"
            )}>
              {config.shortLabel}
            </span>
          </Button>
        );
      })}
    </div>
  );
}; 