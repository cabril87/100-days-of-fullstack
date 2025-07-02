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
import { cn } from '@/lib/helpers/utils/utils';
import { Button } from '@/components/ui/button';
import {
  Kanban,
  Settings
} from 'lucide-react';

import { TabNavigationProps, BoardTabType } from '@/lib/types/board-tabs';

const TAB_CONFIG = {
  board: {
    label: 'Board View',
    icon: Kanban,
    description: 'View and manage tasks'
  },
  settings: {
    label: 'Settings',
    icon: Settings,
    description: 'Board settings and preferences'
  }
} as const;

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  className
}) => {
  return (
    <div className={cn("flex gap-2", className)}>
      {(Object.keys(TAB_CONFIG) as BoardTabType[]).map((tab) => {
        const config = TAB_CONFIG[tab];
        const Icon = config.icon;
        const isActive = activeTab === tab;

        return (
          <Button
            key={tab}
            variant={isActive ? "default" : "ghost"}
            onClick={() => onTabChange(tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 h-auto transition-all duration-200",
              isActive
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}; 
