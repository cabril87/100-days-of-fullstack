/*
 * Photo Attachment Service
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Real API integration for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 * NO MOCK DATA - Real backend integration only
 */

import { ApiResponse } from '@/lib/types/api';

// ============================================================================
// TYPES - MATCHING BACKEND DTOs EXACTLY
// ============================================================================

export interface PhotoAttachmentDTO {
  id: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  capturedAt: Date;
  taskId?: string;
  userId: number;
  userName: string;
  isTaskEvidence: boolean;
  isAchievementPhoto: boolean;
  compressionRatio: number;
  metadata: PhotoMetadataDTO;
}

export interface PhotoMetadataDTO {
  width: number;
  height: number;
  deviceInfo?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface CreatePhotoAttachmentDTO {
  fileName: string;
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  taskId?: string;
  isTaskEvidence: boolean;
  isAchievementPhoto: boolean;
  metadata: PhotoMetadataDTO;
  photoData: string; // Base64 encoded
  thumbnailData: string; // Base64 encoded
}

export interface PhotoValidationDTO {
  isValid: boolean;
  validationType: 'automatic' | 'family_review' | 'self_validated';
  validatedBy?: number;
  validatedAt?: Date;
  validationScore: number;
  feedback?: string;
}

export interface CreatePhotoValidationDTO {
  photoId: string;
  validationType: 'automatic' | 'family_review' | 'self_validated';
  feedback?: string;
}

export interface PhotoShareDTO {
  photoId: string;
  sharedWith: number[];
  shareMessage?: string;
  reactions: PhotoReactionDTO[];
  comments: PhotoCommentDTO[];
}

export interface PhotoReactionDTO {
  userId: number;
  userName: string;
  reaction: 'like' | 'love' | 'wow' | 'celebrate';
  reactedAt: Date;
}

export interface PhotoCommentDTO {
  userId: number;
  userName: string;
  comment: string;
  commentedAt: Date;
}

export interface CreatePhotoShareDTO {
  photoId: string;
  sharedWith: number[];
  shareMessage?: string;
}

export interface PhotoStatisticsDTO {
  totalPhotos: number;
  taskEvidencePhotos: number;
  achievementPhotos: number;
  totalStorageUsed: number;
  averageCompressionRatio: number;
  photosThisMonth: number;
  mostActiveUploader: string;
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class PhotoAttachmentServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'PhotoAttachmentServiceError';
  }
}

// ============================================================================
// PHOTO ATTACHMENT SERVICE
// ============================================================================

class PhotoAttachmentService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7240';
  }

  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Handle API response and errors
   */
  private async handleApiResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Use the raw error text if JSON parsing fails
        errorMessage = errorText || errorMessage;
      }

      throw new PhotoAttachmentServiceError(
        errorMessage,
        response.status,
        errorText
      );
    }

    const text = await response.text();
    if (!text) {
      throw new PhotoAttachmentServiceError('Empty response from server');
    }

    try {
      const data = JSON.parse(text);
      return data as T;
    } catch {
      throw new PhotoAttachmentServiceError(
        'Invalid JSON response from server',
        response.status,
        text
      );
    }
  }

  /**
   * Convert dates in response objects
   */
  private transformPhotoAttachment(photo: PhotoAttachmentDTO): PhotoAttachmentDTO {
    return {
      ...photo,
      capturedAt: new Date(photo.capturedAt)
    };
  }

  /**
   * Get all photo attachments for a family
   */
  async getFamilyPhotos(familyId: number): Promise<PhotoAttachmentDTO[]> {
    try {
      console.log('📸 Fetching family photos...', { familyId });

      const response = await fetch(
        `${this.baseUrl}/api/v1/family/${familyId}/photos`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<PhotoAttachmentDTO[]>>(response);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to fetch family photos'
        );
      }

      const photos = apiResponse.data.map(photo => this.transformPhotoAttachment(photo));
      
      console.log('✅ Family photos fetched successfully:', {
        count: photos.length,
        familyId
      });

      return photos;

    } catch (error) {
      console.error('❌ Failed to fetch family photos:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to fetch family photos: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get photo attachments for a specific task
   */
  async getTaskPhotos(taskId: string): Promise<PhotoAttachmentDTO[]> {
    try {
      console.log('📸 Fetching task photos...', { taskId });

      const response = await fetch(
        `${this.baseUrl}/api/v1/tasks/${taskId}/photos`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<PhotoAttachmentDTO[]>>(response);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to fetch task photos'
        );
      }

      const photos = apiResponse.data.map(photo => this.transformPhotoAttachment(photo));
      
      console.log('✅ Task photos fetched successfully:', {
        count: photos.length,
        taskId
      });

      return photos;

    } catch (error) {
      console.error('❌ Failed to fetch task photos:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to fetch task photos: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload a new photo attachment
   */
  async uploadPhoto(
    familyId: number,
    photoData: CreatePhotoAttachmentDTO
  ): Promise<PhotoAttachmentDTO> {
    try {
      console.log('📸 Uploading photo...', {
        familyId,
        fileName: photoData.fileName,
        size: photoData.originalSize
      });

      const response = await fetch(
        `${this.baseUrl}/api/v1/family/${familyId}/photos`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(photoData)
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<PhotoAttachmentDTO>>(response);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to upload photo'
        );
      }

      const photo = this.transformPhotoAttachment(apiResponse.data);
      
      console.log('✅ Photo uploaded successfully:', {
        id: photo.id,
        fileName: photo.fileName
      });

      return photo;

    } catch (error) {
      console.error('❌ Failed to upload photo:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to upload photo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a photo attachment
   */
  async deletePhoto(familyId: number, photoId: string): Promise<boolean> {
    try {
      console.log('📸 Deleting photo...', { familyId, photoId });

      const response = await fetch(
        `${this.baseUrl}/api/v1/family/${familyId}/photos/${photoId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<boolean>>(response);
      
      if (!apiResponse.success) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to delete photo'
        );
      }

      console.log('✅ Photo deleted successfully:', { photoId });
      return true;

    } catch (error) {
      console.error('❌ Failed to delete photo:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to delete photo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate a photo attachment
   */
  async validatePhoto(
    familyId: number,
    validationData: CreatePhotoValidationDTO
  ): Promise<PhotoValidationDTO> {
    try {
      console.log('📸 Validating photo...', {
        familyId,
        photoId: validationData.photoId,
        type: validationData.validationType
      });

      const response = await fetch(
        `${this.baseUrl}/api/v1/family/${familyId}/photos/validate`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(validationData)
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<PhotoValidationDTO>>(response);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to validate photo'
        );
      }

      const validation = {
        ...apiResponse.data,
        validatedAt: apiResponse.data.validatedAt ? new Date(apiResponse.data.validatedAt) : undefined
      };
      
      console.log('✅ Photo validated successfully:', {
        photoId: validationData.photoId,
        score: validation.validationScore
      });

      return validation;

    } catch (error) {
      console.error('❌ Failed to validate photo:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to validate photo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Share a photo with family members
   */
  async sharePhoto(
    familyId: number,
    shareData: CreatePhotoShareDTO
  ): Promise<PhotoShareDTO> {
    try {
      console.log('📸 Sharing photo...', {
        familyId,
        photoId: shareData.photoId,
        memberCount: shareData.sharedWith.length
      });

      const response = await fetch(
        `${this.baseUrl}/api/v1/family/${familyId}/photos/share`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(shareData)
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<PhotoShareDTO>>(response);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to share photo'
        );
      }

      const share = {
        ...apiResponse.data,
        reactions: apiResponse.data.reactions.map(r => ({
          ...r,
          reactedAt: new Date(r.reactedAt)
        })),
        comments: apiResponse.data.comments.map(c => ({
          ...c,
          commentedAt: new Date(c.commentedAt)
        }))
      };
      
      console.log('✅ Photo shared successfully:', {
        photoId: shareData.photoId,
        sharedWithCount: shareData.sharedWith.length
      });

      return share;

    } catch (error) {
      console.error('❌ Failed to share photo:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to share photo: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get photo statistics for a family
   */
  async getPhotoStatistics(familyId: number): Promise<PhotoStatisticsDTO> {
    try {
      console.log('📸 Fetching photo statistics...', { familyId });

      const response = await fetch(
        `${this.baseUrl}/api/v1/family/${familyId}/photos/statistics`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      const apiResponse = await this.handleApiResponse<ApiResponse<PhotoStatisticsDTO>>(response);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new PhotoAttachmentServiceError(
          apiResponse.message || 'Failed to fetch photo statistics'
        );
      }

      console.log('✅ Photo statistics fetched successfully:', {
        totalPhotos: apiResponse.data.totalPhotos,
        familyId
      });

      return apiResponse.data;

    } catch (error) {
      console.error('❌ Failed to fetch photo statistics:', error);
      if (error instanceof PhotoAttachmentServiceError) {
        throw error;
      }
      throw new PhotoAttachmentServiceError(
        `Failed to fetch photo statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const photoAttachmentService = new PhotoAttachmentService();
export default photoAttachmentService; 
