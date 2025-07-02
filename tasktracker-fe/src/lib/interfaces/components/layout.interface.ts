/*
 * Layout Component Interfaces
 * Centralized interface definitions for layout-related components
 * Extracted from components/layout/ for .cursorrules compliance
 */

// ================================
// MAIN LAYOUT INTERFACES
// ================================

export interface NavbarProps {
  onToggleSidebar?: () => void;
  onDropdownToggle?: (isOpen: boolean) => void;
  isSidebarOpen?: boolean;
  showLogo?: boolean;
  showUserMenu?: boolean;
  showNotifications?: boolean;
  className?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  variant?: 'default' | 'compact' | 'mini';
  position?: 'left' | 'right';
  className?: string;
}

// ================================
// NAVIGATION INTERFACES
// ================================

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
  requiresAuth?: boolean;
  requiresRole?: string;
}

export interface NavigationMenuProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  className?: string;
}

// ================================
// HEADER INTERFACES
// ================================

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export interface UserMenuProps {
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role?: string;
  };
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  showAvatar?: boolean;
  showRole?: boolean;
  className?: string;
}

export interface NotificationBellProps {
  unreadCount?: number;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
  onNotificationClick?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  maxVisible?: number;
  className?: string;
}

// ================================
// FOOTER INTERFACES
// ================================

export interface FooterProps {
  showLinks?: boolean;
  showSocial?: boolean;
  showCopyright?: boolean;
  links?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  socialLinks?: Array<{
    platform: string;
    href: string;
    icon: React.ReactNode;
  }>;
  className?: string;
}

// ================================
// RESPONSIVE LAYOUT INTERFACES
// ================================

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarCollapsible?: boolean;
  sidebarDefaultOpen?: boolean;
  className?: string;
}

export interface MobileLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  gestureEnabled?: boolean;
  className?: string;
}

// ================================
// CONTAINER INTERFACES
// ================================

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centerContent?: boolean;
  className?: string;
}

export interface GridLayoutProps {
  children: React.ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number | string;
  autoFit?: boolean;
  minColumnWidth?: string;
  className?: string;
}

export interface FlexLayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: number | string;
  className?: string;
}

// ================================
// MODAL LAYOUT INTERFACES
// ================================

export interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  preventClickOutside?: boolean;
  centerContent?: boolean;
  className?: string;
}

export interface DrawerLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: string | number;
  overlay?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

// ================================
// LOADING LAYOUT INTERFACES
// ================================

export interface LoadingLayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  spinnerSize?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  message?: string;
  className?: string;
}

export interface ErrorLayoutProps {
  error: Error | string;
  onRetry?: () => void;
  onReportError?: (error: Error | string) => void;
  showDetails?: boolean;
  title?: string;
  message?: string;
  className?: string;
} 