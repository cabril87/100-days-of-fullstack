/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Mobile UI Component Props - Moved from lib/types/ui/mobile-responsive.ts for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React from 'react';

// ============================================================================
// MOBILE RESPONSIVE COMPONENT PROPS
// ============================================================================

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
  mobileLayout?: 'stack' | 'grid' | 'flex';
  tabletLayout?: 'stack' | 'grid' | 'flex';
  desktopLayout?: 'stack' | 'grid' | 'flex';
  spacing?: 'tight' | 'normal' | 'loose';
}

export interface MobileCalendarEnhancementsProps {
  className?: string;
  enableSwipeNavigation?: boolean;
  enablePullToRefresh?: boolean;
  showMobileToolbar?: boolean;
  compactMode?: boolean;
  gestureThreshold?: number;
}

export interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export interface MobileGestureIndicatorProps {
  isVisible: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export interface TouchFeedbackProps {
  children: React.ReactNode;
  onTouch?: () => void;
  feedbackType?: 'haptic' | 'visual' | 'both';
  intensity?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export interface MobileViewSwitcherProps {
  currentView: string;
  views: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  onViewChange: (viewId: string) => void;
  className?: string;
}

export interface MobileNavigationBarProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    active?: boolean;
    onClick: () => void;
  }>;
  position?: 'top' | 'bottom';
  showLabels?: boolean;
  className?: string;
}

export interface MobileControlBarProps {
  actions: Array<{
    id: string;
    icon: React.ReactNode;
    label?: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  position?: 'top' | 'bottom' | 'floating';
  className?: string;
}

export interface MobileToolbarProps {
  title?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'full' | number;
  snapPoints?: number[];
  className?: string;
}

export interface MobileFloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  label?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  badge?: string | number;
  menu?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
}

export interface TouchAccessibilityProps {
  minTouchTarget?: number;
  increasedPadding?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
  screenReaderOptimized?: boolean;
  className?: string;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
}

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

export interface SwipeAnimationProps {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration?: number;
  easing?: string;
  className?: string;
}

export interface PullRefreshAnimationProps {
  progress: number;
  isRefreshing: boolean;
  threshold?: number;
  className?: string;
} 