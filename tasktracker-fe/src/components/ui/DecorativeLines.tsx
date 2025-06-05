'use client';

import React from 'react';
import { useTheme } from '@/lib/providers/ThemeProvider';

interface DecorativeLinesProps {
  position?: 'top' | 'bottom' | 'both';
  variant?: 'primary' | 'secondary' | 'gamification' | 'theme-adaptive';
  animate?: boolean;
  className?: string;
  thickness?: 'thin' | 'normal' | 'thick';
}

export function DecorativeLines({ 
  position = 'both', 
  variant = 'theme-adaptive',
  animate = true,
}: DecorativeLinesProps) {
  const { customTheme } = useTheme();
  
  // Get gradient classes based on variant and current theme
  const getGradientClasses = () => {
    const baseClasses = animate ? 'animate-pulse' : '';
    
    switch (variant) {
      case 'theme-adaptive':
        // Use current theme's gradient if available, fallback to navbar-style gradients
        if (customTheme?.gradients?.primary && customTheme?.gradients?.secondary) {
          return {
            // Bottom line (main) - thick with animation like navbar
            bottom: `absolute bottom-0 left-0 right-0 h-1.5 ${baseClasses}`,
            // Top line (accent) - thin with opacity like navbar  
            top: `absolute top-0 left-0 right-0 h-0.5 opacity-50`,
            bottomStyle: { background: customTheme.gradients.primary },
            topStyle: { background: customTheme.gradients.secondary }
          };
        }
        // Fallback to exact navbar gradients
        return {
          bottom: `absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 ${baseClasses}`,
          top: `absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50`
        };
      case 'primary':
        return {
          bottom: `absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${baseClasses}`,
          top: `absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-50`
        };
      case 'secondary':
        return {
          bottom: `absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 ${baseClasses}`,
          top: `absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-50`
        };
      case 'gamification':
        return {
          bottom: `absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 ${baseClasses}`,
          top: `absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500 opacity-50`
        };
      default:
        return {
          bottom: `absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 ${baseClasses}`,
          top: `absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50`
        };
    }
  };

  const gradients = getGradientClasses();

  return (
    <>
      {/* Bottom decorative line (thick, with animation) */}
      {(position === 'bottom' || position === 'both') && (
        <div 
          className={gradients.bottom}
          style={gradients.bottomStyle}
        />
      )}
      
      {/* Top decorative line (thin, with opacity) */}
      {(position === 'top' || position === 'both') && (
        <div 
          className={gradients.top}
          style={gradients.topStyle}
        />
      )}
    </>
  );
}

// Preset components for common use cases
export function TopDecorativeLines(props: Omit<DecorativeLinesProps, 'position'>) {
  return <DecorativeLines {...props} position="top" />;
}

export function BottomDecorativeLines(props: Omit<DecorativeLinesProps, 'position'>) {
  return <DecorativeLines {...props} position="bottom" />;
}

export function GamificationLines(props: Omit<DecorativeLinesProps, 'variant'>) {
  return <DecorativeLines {...props} variant="gamification" />;
}

export function ThemeAdaptiveLines(props: Omit<DecorativeLinesProps, 'variant'>) {
  return <DecorativeLines {...props} variant="theme-adaptive" />;
} 