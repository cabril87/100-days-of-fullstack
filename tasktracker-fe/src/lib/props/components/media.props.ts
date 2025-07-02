/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * Media Component Props - Moved from lib/types/media/ for .cursorrules compliance
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md enterprise standards
 */

import React from 'react';

// ============================================================================
// PHOTO ATTACHMENT COMPONENT PROPS
// ============================================================================

export interface PhotoAttachmentSystemProps {
  className?: string;
  onPhotoUpload?: (photos: Array<File>) => void;
  onPhotoRemove?: (photoId: string) => void;
  onPhotoSelect?: (photoId: string) => void;
  onError?: (error: Error) => void;
  maxPhotos?: number;
  maxFileSize?: number;
  acceptedTypes?: Array<string>;
  showPreview?: boolean;
  showProgress?: boolean;
  allowMultiple?: boolean;
  allowReorder?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// ============================================================================
// MEDIA GALLERY COMPONENT PROPS
// ============================================================================

export interface MediaGalleryProps {
  className?: string;
  items: Array<Record<string, unknown>>;
  onItemClick?: (item: Record<string, unknown>) => void;
  onItemSelect?: (itemIds: Array<string>) => void;
  onItemDelete?: (itemId: string) => void;
  onItemEdit?: (itemId: string, data: Record<string, unknown>) => void;
  layout?: 'grid' | 'masonry' | 'list';
  columns?: number;
  showSelection?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
  maxItems?: number;
}

export interface MediaUploadProps {
  className?: string;
  onUpload?: (files: Array<File>) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (uploadedFiles: Array<Record<string, unknown>>) => void;
  onError?: (error: Error) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  showPreview?: boolean;
  showProgress?: boolean;
  dragAndDrop?: boolean;
  disabled?: boolean;
}

export interface MediaViewerProps {
  className?: string;
  media: Record<string, unknown>;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  showControls?: boolean;
  showMetadata?: boolean;
  showNavigation?: boolean;
  allowZoom?: boolean;
  allowRotate?: boolean;
  fullscreen?: boolean;
}

// ============================================================================
// MEDIA THUMBNAIL COMPONENT PROPS
// ============================================================================

export interface MediaThumbnailProps {
  className?: string;
  media: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  showOverlay?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  lazy?: boolean;
  quality?: 'low' | 'medium' | 'high';
  placeholder?: React.ReactNode;
} 