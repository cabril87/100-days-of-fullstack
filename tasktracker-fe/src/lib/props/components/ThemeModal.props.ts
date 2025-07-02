import { ThemeConfig } from '@/lib/config/themes';

export interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ThemePreviewCardProps {
  theme: ThemeConfig;
  isOwned: boolean;
  isActive: boolean;
  onSelect: (themeId: string) => void;
  onPurchase: (themeId: string) => void;
  isAuthenticated: boolean;
} 