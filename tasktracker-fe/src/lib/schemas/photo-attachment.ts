/*
 * Photo Attachment Zod Schemas
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Form validation schemas for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

import { z } from 'zod';

// ============================================================================
// PHOTO METADATA SCHEMAS
// ============================================================================

export const photoLocationSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude')
}).optional();

export const photoMetadataSchema = z.object({
  width: z.number().min(1, 'Width must be positive'),
  height: z.number().min(1, 'Height must be positive'),
  deviceInfo: z.string().max(200, 'Device info too long').optional(),
  location: photoLocationSchema
});

// ============================================================================
// PHOTO ATTACHMENT SCHEMAS
// ============================================================================

export const createPhotoAttachmentSchema = z.object({
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name too long')
    .regex(/\.(jpg|jpeg|png|gif|webp)$/i, 'Invalid file type'),
  
  mimeType: z.string()
    .min(1, 'MIME type is required')
    .regex(/^image\/(jpeg|png|gif|webp)$/, 'Invalid MIME type'),
  
  originalSize: z.number()
    .min(1, 'File size must be positive')
    .max(50 * 1024 * 1024, 'File too large (max 50MB)'),
  
  compressedSize: z.number()
    .min(1, 'Compressed size must be positive'),
  
  compressionRatio: z.number()
    .min(0, 'Compression ratio must be non-negative')
    .max(100, 'Compression ratio cannot exceed 100%'),
  
  taskId: z.string().optional(),
  
  isTaskEvidence: z.boolean(),
  
  isAchievementPhoto: z.boolean(),
  
  metadata: photoMetadataSchema,
  
  photoData: z.string()
    .min(1, 'Photo data is required')
    .regex(/^data:image\/(jpeg|png|gif|webp);base64,/, 'Invalid photo data format'),
  
  thumbnailData: z.string()
    .min(1, 'Thumbnail data is required')
    .regex(/^data:image\/(jpeg|png|gif|webp);base64,/, 'Invalid thumbnail data format')
}).refine(
  (data) => data.compressedSize <= data.originalSize,
  {
    message: 'Compressed size cannot be larger than original size',
    path: ['compressedSize']
  }
);

// ============================================================================
// PHOTO VALIDATION SCHEMAS
// ============================================================================

export const createPhotoValidationSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
  
  validationType: z.enum(['automatic', 'family_review', 'self_validated'], {
    errorMap: () => ({ message: 'Invalid validation type' })
  }),
  
  feedback: z.string()
    .max(500, 'Feedback too long')
    .optional()
});

// ============================================================================
// PHOTO SHARING SCHEMAS
// ============================================================================

export const createPhotoShareSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
  
  sharedWith: z.array(z.number().positive())
    .min(1, 'Must share with at least one family member')
    .max(20, 'Cannot share with more than 20 members'),
  
  shareMessage: z.string()
    .max(500, 'Share message too long')
    .optional()
});

// ============================================================================
// PHOTO REACTION SCHEMAS
// ============================================================================

export const photoReactionSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
  
  reaction: z.enum(['like', 'love', 'wow', 'celebrate'], {
    errorMap: () => ({ message: 'Invalid reaction type' })
  })
});

// ============================================================================
// PHOTO COMMENT SCHEMAS
// ============================================================================

export const photoCommentSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
  
  comment: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment too long')
    .trim()
});

// ============================================================================
// FORM DATA SCHEMAS
// ============================================================================

export const photoUploadFormSchema = z.object({
  // File selection
  selectedFiles: z.array(z.instanceof(File))
    .min(1, 'Please select at least one photo')
    .max(10, 'Cannot upload more than 10 photos at once')
    .refine(
      (files) => files.every(file => file.size <= 50 * 1024 * 1024),
      'One or more files exceed 50MB limit'
    )
    .refine(
      (files) => files.every(file => 
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      ),
      'One or more files have invalid format'
    ),
  
  // Photo settings
  isTaskEvidence: z.boolean(),
  isAchievementPhoto: z.boolean(),
  taskId: z.string().optional(),
  
  // Compression settings
  enableCompression: z.boolean(),
  compressionQuality: z.number()
    .min(10, 'Compression quality too low')
    .max(100, 'Compression quality too high')
    .default(80),
  
  // Metadata options
  includeLocation: z.boolean(),
  includeDeviceInfo: z.boolean(),
  
  // Privacy settings
  isPrivate: z.boolean(),
  shareWithFamily: z.boolean()
});

export const photoValidationFormSchema = z.object({
  validationType: z.enum(['family_review', 'self_validated']),
  feedback: z.string()
    .max(500, 'Feedback too long')
    .optional(),
  isValid: z.boolean().optional()
});

export const photoShareFormSchema = z.object({
  selectedMembers: z.array(z.number().positive())
    .min(1, 'Select at least one family member'),
  shareMessage: z.string()
    .max(500, 'Message too long')
    .optional(),
  includeOriginal: z.boolean(),
  allowDownload: z.boolean()
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePhotoAttachmentFormData = z.infer<typeof createPhotoAttachmentSchema>;
export type CreatePhotoValidationFormData = z.infer<typeof createPhotoValidationSchema>;
export type CreatePhotoShareFormData = z.infer<typeof createPhotoShareSchema>;
export type PhotoUploadFormData = z.infer<typeof photoUploadFormSchema>;
export type PhotoValidationFormData = z.infer<typeof photoValidationFormSchema>;
export type PhotoShareFormData = z.infer<typeof photoShareFormSchema>;
export type PhotoReactionFormData = z.infer<typeof photoReactionSchema>;
export type PhotoCommentFormData = z.infer<typeof photoCommentSchema>; 