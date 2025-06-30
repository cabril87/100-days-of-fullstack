/*
 * Photo Attachment Service Interface
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Service layer interface for photo attachment operations
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using TaskTrackerAPI.DTOs.Photos;
using TaskTrackerAPI.Repositories;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service interface for photo attachment operations with task evidence and family sharing
    /// </summary>
    public interface IPhotoAttachmentService
    {
        /// <summary>
        /// Get all photo attachments for a specific family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>List of photo attachment DTOs</returns>
        Task<List<PhotoAttachmentDTO>> GetFamilyPhotosAsync(int familyId);

        /// <summary>
        /// Get photo attachments for a specific task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>List of photo attachment DTOs</returns>
        Task<List<PhotoAttachmentDTO>> GetTaskPhotosAsync(int taskId);

        /// <summary>
        /// Get a specific photo attachment by ID
        /// </summary>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Photo attachment DTO or null</returns>
        Task<PhotoAttachmentDTO?> GetPhotoByIdAsync(string photoId);

        /// <summary>
        /// Create a new photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="userId">User identifier</param>
        /// <param name="createDto">Photo creation data</param>
        /// <returns>Created photo attachment DTO</returns>
        Task<PhotoAttachmentDTO> CreatePhotoAsync(int familyId, int userId, CreatePhotoAttachmentDTO createDto);

        /// <summary>
        /// Delete a photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="photoId">Photo identifier</param>
        /// <param name="userId">User identifier requesting deletion</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeletePhotoAsync(int familyId, string photoId, int userId);

        /// <summary>
        /// Validate a photo attachment
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="userId">User identifier performing validation</param>
        /// <param name="validationDto">Validation data</param>
        /// <returns>Photo validation DTO</returns>
        Task<PhotoValidationDTO> ValidatePhotoAsync(int familyId, int userId, CreatePhotoValidationDTO validationDto);

        /// <summary>
        /// Share a photo with family members
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <param name="userId">User identifier sharing the photo</param>
        /// <param name="shareDto">Share data</param>
        /// <returns>Photo share DTO</returns>
        Task<PhotoShareDTO> SharePhotoAsync(int familyId, int userId, CreatePhotoShareDTO shareDto);

        /// <summary>
        /// Get photo statistics for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Photo statistics DTO</returns>
        Task<PhotoStatisticsDTO> GetPhotoStatisticsAsync(int familyId);
    }
} 