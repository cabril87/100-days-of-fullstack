/*
 * Provider & Context Types
 * Copyright (c) 2025 Carlos Abril Jr
 */

// Sidebar Context Types (not component props, remain here)
export interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  open: () => void;
} 