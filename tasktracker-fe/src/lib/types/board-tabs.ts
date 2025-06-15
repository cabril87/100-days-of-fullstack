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

import { BoardDTO, BoardColumnDTO } from './board';

/**
 * Tab-based Board Details Types
 */

export type BoardTabType = 'board' | 'settings';

export interface BoardTabsProps {
  boardId: number;
  initialTab?: BoardTabType;
  className?: string;
}

export interface BoardTabContentProps {
  board: BoardDTO;
  onBoardUpdate: () => void;
  onBoardDelete?: () => void;
}

export interface SettingsTabContentProps {
  board: BoardDTO;
  onBoardUpdate: () => void;
  onBoardDelete?: () => void;
}

export interface TabNavigationProps {
  activeTab: BoardTabType;
  onTabChange: (tab: BoardTabType) => void;
  className?: string;
}

export interface MobileTabBarProps {
  activeTab: BoardTabType;
  onTabChange: (tab: BoardTabType) => void;
  className?: string;
} 