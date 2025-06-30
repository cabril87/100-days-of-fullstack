/*
 * Photo Attachment Component Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Component-specific prop interfaces for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * ✅ Separation of business logic types from component props
 * ✅ Enterprise clean architecture standards
 */

import type {
  PhotoAttachmentDTO,
  PhotoValidationDTO,
  PhotoShareDTO
} from './photo-attachments';

// ============================================================================
// FAMILY MEMBER TYPE
// ============================================================================

export interface FamilyMember {
  id: number;
  name: string;
  role: string;
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

export interface PhotoAttachmentSystemProps {
  taskId?: string;
  userId: number;
  familyId: number; // Required for real API calls
  familyMembers: FamilyMember[];
  onPhotoAttached?: (photo: PhotoAttachmentDTO) => void;
  onTaskValidated?: (taskId: string, validation: PhotoValidationDTO) => void;
  onPhotoShared?: (share: PhotoShareDTO) => void;
  maxFileSize?: number; // MB
  allowedTypes?: string[];
  enableFamilySharing?: boolean;
  enableAchievementIntegration?: boolean;
  className?: string;
} 