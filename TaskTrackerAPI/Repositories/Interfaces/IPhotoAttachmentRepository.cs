/*
 * Photo Attachment Repository Interface
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Repository interface for photo attachment data access
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for photo attachment operations
    /// </summary>
    public interface IPhotoAttachmentRepository
    {
        /// <summary>
        /// Get all photo attachments for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Collection of photo attachments</returns>
        Task<IEnumerable<PhotoAttachment>> GetFamilyPhotosAsync(int familyId);

        /// <summary>
        /// Get photo attachments for a specific task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>Collection of photo attachments</returns>
        Task<IEnumerable<PhotoAttachment>> GetTaskPhotosAsync(int taskId);

        /// <summary>
        /// Get photo attachments uploaded by a specific user
        /// </summary>
        /// <param name="userId">User identifier</param>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Collection of photo attachments</returns>
        Task<IEnumerable<PhotoAttachment>> GetUserPhotosAsync(int userId, int familyId);

        /// <summary>
        /// Get a specific photo attachment by ID
        /// </summary>
        /// <param name="photoId">Photo attachment identifier</param>
        /// <returns>Photo attachment or null if not found</returns>
        Task<PhotoAttachment?> GetPhotoByIdAsync(int photoId);

        /// <summary>
        /// Get a specific photo attachment by external ID
        /// </summary>
        /// <param name="externalId">External identifier</param>
        /// <returns>Photo attachment or null if not found</returns>
        Task<PhotoAttachment?> GetPhotoByExternalIdAsync(string externalId);

        /// <summary>
        /// Create a new photo attachment
        /// </summary>
        /// <param name="photoAttachment">Photo attachment to create</param>
        /// <returns>Created photo attachment</returns>
        Task<PhotoAttachment> CreatePhotoAsync(PhotoAttachment photoAttachment);

        /// <summary>
        /// Update an existing photo attachment
        /// </summary>
        /// <param name="photoAttachment">Photo attachment to update</param>
        /// <returns>Updated photo attachment</returns>
        Task<PhotoAttachment> UpdatePhotoAsync(PhotoAttachment photoAttachment);

        /// <summary>
        /// Delete a photo attachment
        /// </summary>
        /// <param name="photoId">Photo attachment identifier</param>
        /// <returns>True if deleted successfully</returns>
        Task<bool> DeletePhotoAsync(int photoId);

        /// <summary>
        /// Get photo validations for a specific photo
        /// </summary>
        /// <param name="photoId">Photo attachment identifier</param>
        /// <returns>Collection of photo validations</returns>
        Task<IEnumerable<PhotoValidation>> GetPhotoValidationsAsync(int photoId);

        /// <summary>
        /// Create a photo validation
        /// </summary>
        /// <param name="validation">Photo validation to create</param>
        /// <returns>Created photo validation</returns>
        Task<PhotoValidation> CreatePhotoValidationAsync(PhotoValidation validation);

        /// <summary>
        /// Get photo shares for a specific photo
        /// </summary>
        /// <param name="photoId">Photo attachment identifier</param>
        /// <returns>Collection of photo shares</returns>
        Task<IEnumerable<PhotoShare>> GetPhotoSharesAsync(int photoId);

        /// <summary>
        /// Create a photo share
        /// </summary>
        /// <param name="photoShare">Photo share to create</param>
        /// <returns>Created photo share</returns>
        Task<PhotoShare> CreatePhotoShareAsync(PhotoShare photoShare);

        /// <summary>
        /// Get photo reactions for a specific share
        /// </summary>
        /// <param name="shareId">Photo share identifier</param>
        /// <returns>Collection of photo reactions</returns>
        Task<IEnumerable<PhotoReaction>> GetPhotoReactionsAsync(int shareId);

        /// <summary>
        /// Create a photo reaction
        /// </summary>
        /// <param name="reaction">Photo reaction to create</param>
        /// <returns>Created photo reaction</returns>
        Task<PhotoReaction> CreatePhotoReactionAsync(PhotoReaction reaction);

        /// <summary>
        /// Get photo comments for a specific share
        /// </summary>
        /// <param name="shareId">Photo share identifier</param>
        /// <returns>Collection of photo comments</returns>
        Task<IEnumerable<PhotoComment>> GetPhotoCommentsAsync(int shareId);

        /// <summary>
        /// Create a photo comment
        /// </summary>
        /// <param name="comment">Photo comment to create</param>
        /// <returns>Created photo comment</returns>
        Task<PhotoComment> CreatePhotoCommentAsync(PhotoComment comment);

        /// <summary>
        /// Get photo statistics for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Photo statistics</returns>
        Task<PhotoStatistics> GetPhotoStatisticsAsync(int familyId);
    }

    /// <summary>
    /// Photo statistics for reporting
    /// </summary>
    public class PhotoStatistics
    {
        /// <summary>
        /// Total number of photos uploaded
        /// </summary>
        public int TotalPhotos { get; set; }

        /// <summary>
        /// Number of task evidence photos
        /// </summary>
        public int TaskEvidencePhotos { get; set; }

        /// <summary>
        /// Number of achievement photos
        /// </summary>
        public int AchievementPhotos { get; set; }

        /// <summary>
        /// Total storage used in bytes
        /// </summary>
        public long TotalStorageUsed { get; set; }

        /// <summary>
        /// Average compression ratio
        /// </summary>
        public double AverageCompressionRatio { get; set; }

        /// <summary>
        /// Photos uploaded this month
        /// </summary>
        public int PhotosThisMonth { get; set; }

        /// <summary>
        /// Most active uploader
        /// </summary>
        public string MostActiveUploader { get; set; } = string.Empty;
    }
} 