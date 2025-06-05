/*
 * Theme Marketplace Component
 * Copyright (c) 2025 Carlos Abril Jr
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Palette, Download } from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { ThemeConfig } from '@/lib/config/themes';

interface ThemeCardProps {
  theme: ThemeConfig;
  isOwned: boolean;
  isActive: boolean;
  onSelect: (themeId: string) => void;
  onPurchase: (themeId: string) => void;
}

function ThemeCard({ theme, isOwned, isActive, onSelect, onPurchase }: ThemeCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleAction = async () => {
    if (isOwned) {
      onSelect(theme.id);
    } else {
      setIsPurchasing(true);
      await onPurchase(theme.id);
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="card-theme relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Theme Preview */}
      <div className="relative h-32 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ 
            background: theme.gradients?.primary || 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
        
        {/* Premium badge */}
        {theme.isPremium && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-black font-bold flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-[rgb(var(--foreground))]">
              {theme.displayName}
            </CardTitle>
            <CardDescription className="text-[rgb(var(--foreground-secondary))]">
              {theme.description}
            </CardDescription>
          </div>
          {theme.isPremium && !isOwned && (
            <div className="text-right">
              <p className="text-lg font-bold text-[rgb(var(--foreground))]">
                ${theme.price}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ 
                background: theme.gradients?.primary || 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
              }}
            />
            <span className="text-sm text-[rgb(var(--foreground-secondary))]">
              {theme.category}
            </span>
          </div>
          
          {theme.author && (
            <span className="text-xs text-[rgb(var(--foreground-muted))]">
              by {theme.author}
            </span>
          )}
        </div>

        <Button 
          onClick={handleAction}
          disabled={isPurchasing}
          className={`w-full theme-transition ${
            isActive 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : isOwned 
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-black'
          }`}
        >
          {isPurchasing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          ) : isActive ? (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Active
            </div>
          ) : isOwned ? (
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Apply Theme
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Purchase
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ThemeMarketplace() {
  const { 
    availableThemes, 
    defaultThemes, 
    marketplaceThemes,
    customTheme,
    isThemeOwned,
    applyTheme,
    resetToDefault,
    purchaseTheme,
    ownedThemes
  } = useTheme();

  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'premium' | 'owned'>('all');

  const handleThemeSelect = (themeId: string) => {
    if (themeId === 'default') {
      resetToDefault();
    } else {
      applyTheme(themeId);
    }
  };

  const handleThemePurchase = async (themeId: string) => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Palette className="h-8 w-8 text-[rgb(var(--primary))]" />
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">
            Theme Marketplace
          </h1>
        </div>
        <p className="text-[rgb(var(--foreground-secondary))] max-w-2xl mx-auto">
          Personalize your TaskTracker experience with beautiful themes. 
          From professional looks to gaming-inspired designs, find the perfect style for your productivity journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[rgb(var(--primary))]">
              {availableThemes.length}
            </div>
            <p className="text-sm text-[rgb(var(--foreground-secondary))]">
              Total Themes
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {defaultThemes.length}
            </div>
            <p className="text-sm text-[rgb(var(--foreground-secondary))]">
              Free Themes
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {marketplaceThemes.length}
            </div>
            <p className="text-sm text-[rgb(var(--foreground-secondary))]">
              Premium Themes
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-500">
              {ownedThemes.length + 1} {/* +1 for default theme */}
            </div>
            <p className="text-sm text-[rgb(var(--foreground-secondary))]">
              Owned Themes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { id: 'all', label: 'All Themes', count: availableThemes.length },
          { id: 'free', label: 'Free', count: defaultThemes.length },
          { id: 'premium', label: 'Premium', count: marketplaceThemes.length },
          { id: 'owned', label: 'Owned', count: ownedThemes.length + 1 },
        ].map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category.id as 'all' | 'free' | 'premium' | 'owned')}
            className="theme-transition"
          >
            {category.label} ({category.count})
          </Button>
        ))}
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Default Theme Card */}
        {activeCategory === 'all' || activeCategory === 'free' || activeCategory === 'owned' ? (
          <ThemeCard
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
          />
        ) : null}

        {/* Other Themes */}
        {filteredThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isOwned={isThemeOwned(theme.id)}
            isActive={customTheme?.id === theme.id}
            onSelect={handleThemeSelect}
            onPurchase={handleThemePurchase}
          />
        ))}
      </div>

      {/* No themes message */}
      {filteredThemes.length === 0 && (activeCategory !== 'all' && activeCategory !== 'free' && activeCategory !== 'owned') && (
        <div className="text-center py-12">
          <Palette className="h-16 w-16 text-[rgb(var(--foreground-muted))] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
            No themes in this category
          </h3>
          <p className="text-[rgb(var(--foreground-secondary))]">
            Try selecting a different category or check back later for new themes.
          </p>
        </div>
      )}
    </div>
  );
} 