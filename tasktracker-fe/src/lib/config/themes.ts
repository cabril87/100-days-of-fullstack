/*
 * Theme Configuration System
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * This system provides a robust foundation for marketplace themes
 * New themes can be easily added by defining color palettes
 */

// ================================
// THEME TYPES & INTERFACES
// ================================

export interface ThemeColors {
  // Background Colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  backgroundOverlay: string;
  
  // Surface Colors
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  
  // Border Colors
  border: string;
  borderSecondary: string;
  borderAccent: string;
  
  // Text Colors
  foreground: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  
  // Accent Colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  
  // Status Colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Gamification Colors
  gamificationPrimary: string;
  gamificationSecondary: string;
  gamificationAccent: string;
  
  // Shadow Colors
  shadow: string;
  shadowColored: string;
  
  // Component-specific
  sidebarBackground: string;
  sidebarBorder: string;
  navbarBackground: string;
  navbarBorder: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'default' | 'sports' | 'gaming' | 'nature' | 'premium';
  isPremium: boolean;
  price?: number;
  author?: string;
  preview: string; // URL to preview image
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  gradients?: {
    primary: string;
    secondary: string;
    gamification: string;
  };
}

// ================================
// DEFAULT THEMES
// ================================

export const DEFAULT_THEMES: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'default',
    displayName: 'TaskTracker Default',
    description: 'Clean and professional design perfect for productivity',
    category: 'default',
    isPremium: false,
    preview: '/themes/default-preview.png',
    colors: {
      light: {
        background: '255 255 255',
        backgroundSecondary: '249 250 251',
        backgroundTertiary: '243 244 246',
        backgroundOverlay: '255 255 255 / 0.9',
        surface: '255 255 255',
        surfaceSecondary: '248 250 252',
        surfaceElevated: '255 255 255',
        border: '229 231 235',
        borderSecondary: '229 231 235 / 0.5',
        borderAccent: '59 130 246',
        foreground: '17 24 39',
        foregroundSecondary: '75 85 99',
        foregroundMuted: '156 163 175',
        primary: '59 130 246',
        primaryForeground: '255 255 255',
        secondary: '148 163 184',
        secondaryForeground: '15 23 42',
        success: '34 197 94',
        warning: '245 158 11',
        error: '239 68 68',
        info: '59 130 246',
        gamificationPrimary: '147 51 234',
        gamificationSecondary: '59 130 246',
        gamificationAccent: '245 158 11',
        shadow: '0 0 0 / 0.1',
        shadowColored: '59 130 246 / 0.25',
        sidebarBackground: '255 255 255',
        sidebarBorder: '229 231 235',
        navbarBackground: '255 255 255 / 0.9',
        navbarBorder: '229 231 235 / 0.5',
      },
      dark: {
        background: '17 24 39 / 0.9',
        backgroundSecondary: '31 41 55',
        backgroundTertiary: '55 65 81',
        backgroundOverlay: '17 24 39 / 0.9',
        surface: '31 41 55',
        surfaceSecondary: '55 65 81',
        surfaceElevated: '45 55 71',
        border: '75 85 99',
        borderSecondary: '75 85 99 / 0.5',
        borderAccent: '96 165 250',
        foreground: '255 255 255',
        foregroundSecondary: '209 213 219',
        foregroundMuted: '156 163 175',
        primary: '96 165 250',
        primaryForeground: '17 24 39',
        secondary: '100 116 139',
        secondaryForeground: '248 250 252',
        success: '74 222 128',
        warning: '251 191 36',
        error: '248 113 113',
        info: '96 165 250',
        gamificationPrimary: '168 85 247',
        gamificationSecondary: '96 165 250',
        gamificationAccent: '251 191 36',
        shadow: '0 0 0 / 0.5',
        shadowColored: '96 165 250 / 0.25',
        sidebarBackground: '17 24 39',
        sidebarBorder: '75 85 99',
        navbarBackground: '17 24 39 / 0.9',
        navbarBorder: '75 85 99 / 0.5',
      },
    },
    gradients: {
      primary: 'linear-gradient(135deg, rgb(59 130 246), rgb(147 51 234))',
      secondary: 'linear-gradient(135deg, rgb(148 163 184), rgb(100 116 139))',
      gamification: 'linear-gradient(135deg, rgb(147 51 234), rgb(59 130 246), rgb(245 158 11))',
    },
  },
};

// ================================
// MARKETPLACE THEMES (Examples for future implementation)
// ================================

export const MARKETPLACE_THEMES: Record<string, ThemeConfig> = {
  football: {
    id: 'football',
    name: 'football',
    displayName: 'Football Field',
    description: 'Inspired by the beautiful game - perfect for sports enthusiasts',
    category: 'sports',
    isPremium: true,
    price: 4.99,
    author: 'TaskTracker Team',
    preview: '/themes/football-preview.png',
    colors: {
      light: {
        background: '255 255 255',
        backgroundSecondary: '240 253 244',
        backgroundTertiary: '220 252 231',
        backgroundOverlay: '255 255 255 / 0.9',
        surface: '255 255 255',
        surfaceSecondary: '240 253 244',
        surfaceElevated: '255 255 255',
        border: '187 247 208',
        borderSecondary: '187 247 208 / 0.5',
        borderAccent: '0 123 51',
        foreground: '20 83 45',
        foregroundSecondary: '75 85 99',
        foregroundMuted: '156 163 175',
        primary: '0 123 51',
        primaryForeground: '255 255 255',
        secondary: '139 69 19',
        secondaryForeground: '255 255 255',
        success: '34 197 94',
        warning: '245 158 11',
        error: '239 68 68',
        info: '0 123 51',
        gamificationPrimary: '0 123 51',
        gamificationSecondary: '139 69 19',
        gamificationAccent: '255 215 0',
        shadow: '0 0 0 / 0.1',
        shadowColored: '0 123 51 / 0.25',
        sidebarBackground: '240 253 244',
        sidebarBorder: '187 247 208',
        navbarBackground: '255 255 255 / 0.9',
        navbarBorder: '187 247 208 / 0.5',
      },
      dark: {
        background: '20 83 45 / 0.9',
        backgroundSecondary: '22 101 52',
        backgroundTertiary: '34 197 94',
        backgroundOverlay: '20 83 45 / 0.9',
        surface: '22 101 52',
        surfaceSecondary: '34 197 94',
        surfaceElevated: '45 55 71',
        border: '74 222 128',
        borderSecondary: '74 222 128 / 0.5',
        borderAccent: '187 247 208',
        foreground: '255 255 255',
        foregroundSecondary: '220 252 231',
        foregroundMuted: '187 247 208',
        primary: '187 247 208',
        primaryForeground: '20 83 45',
        secondary: '251 191 36',
        secondaryForeground: '20 83 45',
        success: '74 222 128',
        warning: '251 191 36',
        error: '248 113 113',
        info: '187 247 208',
        gamificationPrimary: '187 247 208',
        gamificationSecondary: '251 191 36',
        gamificationAccent: '255 215 0',
        shadow: '0 0 0 / 0.5',
        shadowColored: '187 247 208 / 0.25',
        sidebarBackground: '20 83 45',
        sidebarBorder: '74 222 128',
        navbarBackground: '20 83 45 / 0.9',
        navbarBorder: '74 222 128 / 0.5',
      },
    },
    gradients: {
      primary: 'linear-gradient(135deg, rgb(0 123 51), rgb(34 197 94))',
      secondary: 'linear-gradient(135deg, rgb(139 69 19), rgb(245 158 11))',
      gamification: 'linear-gradient(135deg, rgb(0 123 51), rgb(255 215 0), rgb(139 69 19))',
    },
  },
  
  mario: {
    id: 'mario',
    name: 'mario',
    displayName: 'Super Mario Bros',
    description: 'Nostalgic gaming vibes with iconic Mario colors',
    category: 'gaming',
    isPremium: true,
    price: 6.99,
    author: 'TaskTracker Team',
    preview: '/themes/mario-preview.png',
    colors: {
      light: {
        background: '255 255 255',
        backgroundSecondary: '254 242 242',
        backgroundTertiary: '252 165 165',
        backgroundOverlay: '255 255 255 / 0.9',
        surface: '255 255 255',
        surfaceSecondary: '254 242 242',
        surfaceElevated: '255 255 255',
        border: '248 113 113',
        borderSecondary: '248 113 113 / 0.5',
        borderAccent: '220 38 127',
        foreground: '220 38 127',
        foregroundSecondary: '75 85 99',
        foregroundMuted: '156 163 175',
        primary: '220 38 127',
        primaryForeground: '255 255 255',
        secondary: '59 130 246',
        secondaryForeground: '255 255 255',
        success: '34 197 94',
        warning: '245 158 11',
        error: '239 68 68',
        info: '59 130 246',
        gamificationPrimary: '220 38 127',
        gamificationSecondary: '59 130 246',
        gamificationAccent: '245 158 11',
        shadow: '0 0 0 / 0.1',
        shadowColored: '220 38 127 / 0.25',
        sidebarBackground: '254 242 242',
        sidebarBorder: '248 113 113',
        navbarBackground: '255 255 255 / 0.9',
        navbarBorder: '248 113 113 / 0.5',
      },
      dark: {
        background: '127 29 29 / 0.9',
        backgroundSecondary: '153 27 27',
        backgroundTertiary: '185 28 28',
        backgroundOverlay: '127 29 29 / 0.9',
        surface: '153 27 27',
        surfaceSecondary: '185 28 28',
        surfaceElevated: '220 38 38',
        border: '248 113 113',
        borderSecondary: '248 113 113 / 0.5',
        borderAccent: '252 165 165',
        foreground: '255 255 255',
        foregroundSecondary: '254 202 202',
        foregroundMuted: '252 165 165',
        primary: '252 165 165',
        primaryForeground: '127 29 29',
        secondary: '96 165 250',
        secondaryForeground: '127 29 29',
        success: '74 222 128',
        warning: '251 191 36',
        error: '248 113 113',
        info: '96 165 250',
        gamificationPrimary: '252 165 165',
        gamificationSecondary: '96 165 250',
        gamificationAccent: '251 191 36',
        shadow: '0 0 0 / 0.5',
        shadowColored: '252 165 165 / 0.25',
        sidebarBackground: '127 29 29',
        sidebarBorder: '248 113 113',
        navbarBackground: '127 29 29 / 0.9',
        navbarBorder: '248 113 113 / 0.5',
      },
    },
    gradients: {
      primary: 'linear-gradient(135deg, rgb(220 38 127), rgb(239 68 68))',
      secondary: 'linear-gradient(135deg, rgb(59 130 246), rgb(96 165 250))',
      gamification: 'linear-gradient(135deg, rgb(220 38 127), rgb(245 158 11), rgb(59 130 246))',
    },
  },
};

// ================================
// THEME UTILITIES
// ================================

export const getAllThemes = (): ThemeConfig[] => {
  return [...Object.values(DEFAULT_THEMES), ...Object.values(MARKETPLACE_THEMES)];
};

export const getThemeById = (id: string): ThemeConfig | undefined => {
  return getAllThemes().find(theme => theme.id === id);
};

export const getFreeThemes = (): ThemeConfig[] => {
  return getAllThemes().filter(theme => !theme.isPremium);
};

export const getPremiumThemes = (): ThemeConfig[] => {
  return getAllThemes().filter(theme => theme.isPremium);
};

export const getThemesByCategory = (category: ThemeConfig['category']): ThemeConfig[] => {
  return getAllThemes().filter(theme => theme.category === category);
};

// ================================
// THEME APPLICATION UTILITIES
// ================================

export const applyThemeColors = (theme: ThemeConfig, mode: 'light' | 'dark') => {
  const colors = theme.colors[mode];
  const root = document.documentElement;

  // Apply all CSS variables
  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });

  // Apply theme class for any CSS-only styling
  root.className = root.className.replace(/theme-\w+/g, '');
  if (theme.id !== 'default') {
    root.classList.add(`theme-${theme.id}`);
  }
};

export const getThemePresets = () => {
  return {
    default: DEFAULT_THEMES,
    marketplace: MARKETPLACE_THEMES,
    all: getAllThemes(),
  };
};

// ================================
// THEME VALIDATION
// ================================

export const validateTheme = (theme: Partial<ThemeConfig>): boolean => {
  const requiredFields = ['id', 'name', 'displayName', 'colors'];
  return requiredFields.every(field => field in theme);
};

export const createCustomTheme = (
  id: string,
  name: string,
  colors: { light: Partial<ThemeColors>; dark: Partial<ThemeColors> }
): ThemeConfig => {
  const defaultTheme = DEFAULT_THEMES.default;
  
  return {
    id,
    name,
    displayName: name,
    description: `Custom ${name} theme`,
    category: 'premium',
    isPremium: true,
    preview: '/themes/custom-preview.png',
    colors: {
      light: { ...defaultTheme.colors.light, ...colors.light },
      dark: { ...defaultTheme.colors.dark, ...colors.dark },
    },
    gradients: defaultTheme.gradients,
  };
}; 