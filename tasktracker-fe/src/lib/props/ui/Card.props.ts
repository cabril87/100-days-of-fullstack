/*
 * Card Component Props
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * All card component prop interfaces following .cursorrules standards
 */

import React, { ReactNode } from 'react';

// ================================
// GAMIFICATION CARD PROPS
// ================================

export interface GamificationCardProps {
  title?: string; 
  description?: string;
  icon?: ReactNode;
  value?: string | number;
  progress?: number;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'achievement' | 'progress' | 'stats' | 'gradient';
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  gradient?: string;
  hover?: boolean;
}

// ================================
// STATS CARD PROPS
// ================================

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

// ================================
// PROGRESS CARD PROPS
// ================================

export interface ProgressCardProps {
  title: string;
  currentValue: number;
  maxValue: number;
  progress?: number;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  color?: string;
  className?: string;
} 