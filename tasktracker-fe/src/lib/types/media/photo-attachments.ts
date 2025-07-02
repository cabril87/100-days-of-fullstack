/*
 * Photo Attachment Types
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Enterprise-grade type definitions for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * 
 * ✅ NO MOCK DATA - Real API types only
 * ✅ Matches backend DTOs exactly
 * ✅ Exported from real service types
 */

// Re-export types from the real service to maintain single source of truth
export type {
  PhotoAttachmentDTO,
  PhotoValidationDTO,
  PhotoShareDTO,
  PhotoMetadataDTO,
  CreatePhotoAttachmentDTO,
  CreatePhotoValidationDTO,
  CreatePhotoShareDTO,
  PhotoReactionDTO,
  PhotoCommentDTO,
  PhotoStatisticsDTO
} from '@/lib/services/photoAttachmentService'; 