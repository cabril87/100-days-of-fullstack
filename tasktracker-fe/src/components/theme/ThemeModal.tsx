/*
 * Theme Modal Component
 * Copyright (c) 2025 Carlos Abril Jr
 * Provides enhanced UX for theme selection with modal interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Palette, Sun, Moon, Monitor, Sparkles, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DecorativeLines } from '@/components/ui/DecorativeLines';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ThemeConfig } from '@/lib/config/themes';

import { ThemeModalProps, ThemePreviewCardProps } from '@/lib/props/components/ThemeModal.props';

function ThemePreviewCard({ 
  theme, 
  isOwned, 
  isActive, 
  onSelect, 
  onPurchase,
  isAuthenticated 
}: ThemePreviewCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAction = async () => {
    if (theme.isPremium && !isAuthenticated) {
      // Show authentication prompt
      return;
    }

    if (isOwned) {
      onSelect(theme.id);
    } else {
      setIsPurchasing(true);
      await onPurchase(theme.id);
      setIsPurchasing(false);
    }
  };

  const requiresAuth = theme.isPremium && !isAuthenticated;

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl ${
        isActive 
          ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
          : 'hover:scale-102'
      } ${requiresAuth ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleAction}
    >
      {/* Decorative lines for active theme */}
      {isActive && <DecorativeLines position="top" variant="theme-adaptive" />}
      
      {/* Theme Preview */}
      <div className="relative h-24 overflow-hidden">
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ 
            background: theme.gradients?.primary || 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        />
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Status indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {isActive && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
          {theme.isPremium && (
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="h-3 w-3 text-black" />
            </div>
          )}
          {requiresAuth && (
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <Lock className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            variant={theme.category === 'default' ? 'default' : 'secondary'}
            className="text-xs font-medium"
          >
            {theme.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {theme.displayName}
          {theme.isPremium && <Sparkles className="h-3 w-3 text-yellow-500" />}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {theme.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {theme.author && `by ${theme.author}`}
          </div>
          
          <div className="flex items-center gap-2">
            {theme.isPremium && theme.price && !isOwned && (
              <span className="text-xs font-bold text-green-600">
                ${theme.price}
              </span>
            )}
            
            {isPurchasing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isActive ? (
              <span className="text-xs font-medium text-green-600">Active</span>
            ) : isOwned ? (
              <span className="text-xs font-medium text-blue-600">Owned</span>
            ) : requiresAuth ? (
              <span className="text-xs font-medium text-red-600">Login Required</span>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">Available</span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Loading overlay */}
      {isPurchasing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-sm font-medium">Processing...</div>
        </div>
      )}
    </Card>
  );
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { 
    mode, 
    setMode, 
    resolvedMode,
    customTheme,
    availableThemes,
    isThemeOwned,
    applyTheme,
    resetToDefault,
    purchaseTheme
  } = useTheme();
  
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'premium' | 'owned'>('all');

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleThemeSelect = (themeId: string) => {
    if (themeId === 'default') {
      resetToDefault();
    } else {
      applyTheme(themeId);
    }
  };

  const handleThemePurchase = async (themeId: string) => {
    if (!isAuthenticated) {
      // In a real app, this would open the login modal
      alert('Please log in to purchase premium themes');
      return;
    }
    await purchaseTheme(themeId);
  };

  const filteredThemes = React.useMemo(() => {
    let themes = availableThemes;
    
    switch (activeCategory) {
      case 'free':
        themes = themes.filter(t => !t.isPremium);
        break;
      case 'premium':
        themes = themes.filter(t => t.isPremium);
        break;
      case 'owned':
        themes = themes.filter(t => isThemeOwned(t.id));
        break;
      default:
        // Show all themes
        break;
    }
    
    return themes;
  }, [availableThemes, activeCategory, isThemeOwned]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative min-h-screen flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <DecorativeLines position="top" variant="theme-adaptive" />
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white">🎨 Theme Gallery</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your TaskTracker experience
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mode Selection */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Display Mode</h3>
              <Badge variant="outline" className="text-xs">
                Current: {customTheme?.displayName || (resolvedMode === 'dark' ? 'Dark' : resolvedMode === 'light' ? 'Light' : 'System')}
              </Badge>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant={mode === 'light' && !customTheme ? 'default' : 'outline'}
                onClick={() => setMode('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              
              <Button
                variant={mode === 'dark' && !customTheme ? 'default' : 'outline'}
                onClick={() => setMode('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              
              <Button
                variant={mode === 'system' && !customTheme ? 'default' : 'outline'}
                onClick={() => setMode('system')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] bg-white dark:bg-gray-900">
            {/* Category filters */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button
                  variant={activeCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('all')}
                >
                  All Themes
                </Button>
                <Button
                  variant={activeCategory === 'free' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('free')}
                >
                  Free
                </Button>
                <Button
                  variant={activeCategory === 'premium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('premium')}
                >
                  Premium
                </Button>
                <Button
                  variant={activeCategory === 'owned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory('owned')}
                >
                  Owned ({availableThemes.filter(t => isThemeOwned(t.id)).length})
                </Button>
              </div>
              
              {!isAuthenticated && (
                <Badge variant="secondary" className="text-xs">
                  Login for premium themes
                </Badge>
              )}
            </div>

            {/* Default Theme Card */}
            {(activeCategory === 'all' || activeCategory === 'free' || activeCategory === 'owned') && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Default Theme</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <ThemePreviewCard
                    theme={{
                      id: 'default',
                      name: 'default',
                      displayName: 'TaskTracker Default',
                      description: 'Clean and professional design perfect for productivity',
                      category: 'default',
                      isPremium: false,
                      preview: '/themes/default-preview.png',
                      colors: { 
                        light: {} as ThemeConfig['colors']['light'], 
                        dark: {} as ThemeConfig['colors']['dark'] 
                      },
                    }}
                    isOwned={true}
                    isActive={!customTheme}
                    onSelect={handleThemeSelect}
                    onPurchase={handleThemePurchase}
                    isAuthenticated={isAuthenticated}
                  />
                </div>
              </div>
            )}

            {/* Marketplace Themes */}
            {filteredThemes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                  {activeCategory === 'premium' ? 'Premium Themes' : 
                   activeCategory === 'owned' ? 'Your Themes' : 
                   'Marketplace Themes'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredThemes.map((theme) => (
                    <ThemePreviewCard
                      key={theme.id}
                      theme={theme}
                      isOwned={isThemeOwned(theme.id)}
                      isActive={customTheme?.id === theme.id}
                      onSelect={handleThemeSelect}
                      onPurchase={handleThemePurchase}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No themes message */}
            {filteredThemes.length === 0 && activeCategory !== 'all' && activeCategory !== 'free' && activeCategory !== 'owned' && (
              <div className="text-center py-12">
                <Palette className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">
                  No themes in this category
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try selecting a different category or check back later for new themes.
                </p>
              </div>
            )}
          </div>

          <DecorativeLines position="bottom" variant="theme-adaptive" />
        </div>
      </div>
    </div>
  );
} 
