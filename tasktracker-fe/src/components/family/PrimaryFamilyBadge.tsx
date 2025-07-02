/*
 * Primary Family Badge Component
 * Shows visual indicator for primary family status
 * Copyright (c) 2025 Carlos Abril Jr
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Crown } from 'lucide-react';
import { cn } from '@/lib/helpers/utils/utils';

interface PrimaryFamilyBadgeProps {
  isPrimary: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'icon-only';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function PrimaryFamilyBadge({
  isPrimary,
  variant = 'default',
  size = 'default',
  className,
  showIcon = true
}: PrimaryFamilyBadgeProps) {
  if (!isPrimary) {
    return null;
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-yellow-300 text-yellow-700 bg-transparent';
      case 'secondary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'icon-only':
        return 'bg-transparent border-transparent p-0';
      default:
        return 'bg-yellow-500 text-white border-yellow-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-1.5 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      default:
        return 'text-sm px-2 py-1';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  if (variant === 'icon-only') {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <Star 
          className={cn(
            getIconSize(),
            "text-yellow-500 fill-current"
          )} 
        />
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        "inline-flex items-center gap-1 font-medium",
        className
      )}
    >
      {showIcon && (
        <Crown className={cn(getIconSize(), "fill-current")} />
      )}
      Primary
    </Badge>
  );
}

export default PrimaryFamilyBadge; 
