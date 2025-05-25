/**
 * Progressive Web App (PWA) related types
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallPrompt {
  canInstall: boolean;
  install: () => Promise<boolean>;
  dismiss: () => void;
} 