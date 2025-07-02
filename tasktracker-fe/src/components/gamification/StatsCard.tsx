'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCardProps } from '@/lib/types/ui';

// Skeleton version for loading states
export function StatsCardSkeleton({ variant = 'blue' }: { variant?: StatsCardProps['variant'] }) {
  const skeletonVariants = {
    blue: 'bg-blue-50 border-blue-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <Card className={`transition-all duration-200 ${skeletonVariants[variant]}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-1" />
        <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  gradient = true,
}: StatsCardProps) {
  const variants = {
    blue: gradient 
      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900'
      : 'bg-blue-50 border-blue-200 text-blue-900',
    emerald: gradient
      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900'
      : 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: gradient
      ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-900'
      : 'bg-amber-50 border-amber-200 text-amber-900',
    purple: gradient
      ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-900'
      : 'bg-purple-50 border-purple-200 text-purple-900',
    red: gradient
      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-900'
      : 'bg-red-50 border-red-200 text-red-900',
    green: gradient
      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-900'
      : 'bg-green-50 border-green-200 text-green-900',
  };

  const iconColors = {
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    green: 'text-green-600',
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${variants[variant]}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className={`h-4 w-4 ${iconColors[variant]}`} />}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="text-lg font-bold">{value}</div>
        {subtitle && (
          <div className="text-xs opacity-80">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
} 
