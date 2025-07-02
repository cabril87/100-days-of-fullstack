/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Chart Component Interfaces - Moved from lib/types/ui-components.ts for .cursorrules compliance
 * lib/interfaces/analytics/chart-components.interface.ts
 */

import { ReactNode } from 'react';

// ================================
// CHART COMPONENT INTERFACES
// ================================

export interface ChartContextProps {
  config: Record<string, {
    label?: string;
    color?: string;
    icon?: ReactNode;
  }>;
} 