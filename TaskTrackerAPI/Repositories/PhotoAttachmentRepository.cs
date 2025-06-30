/*
 * Photo Attachment Repository Implementation
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Complete CRUD operations for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository for managing photo attachments with task evidence and family sharing
    /// </summary>
    public class PhotoAttachmentRepository : IPhotoAttachmentRepository
    {
        private readonly ApplicationDbContext _context;

        public PhotoAttachmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all photo attachments for a specific family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>List of photo attachments</returns>
        public async Task<IEnumerable<PhotoAttachment>> GetFamilyPhotosAsync(int familyId)
        {
            return await _context.PhotoAttachments
                .Include(p => p.User)
                .Include(p => p.Family)
                .Include(p => p.Task)
                .Where(p => p.FamilyId == familyId)
                .OrderByDescending(p => p.CapturedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Get photo attachments for a specific task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>List of photo attachments</returns>
        public async Task<IEnumerable<PhotoAttachment>> GetTaskPhotosAsync(int taskId)
        {
            return await _context.PhotoAttachments
                .Include(p => p.User)
                .Include(p => p.Family)
                .Where(p => p.TaskId == taskId)
                .OrderByDescending(p => p.CapturedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Get a specific photo attachment by ID
        /// </summary>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Photo attachment or null</returns>
        public async Task<PhotoAttachment?> GetPhotoByIdAsync(int photoId)
        {
            return await _context.PhotoAttachments
                .Include(p => p.User)
                .Include(p => p.Family)
                .Include(p => p.Task)
                .FirstOrDefaultAsync(p => p.Id == photoId);
        }

        /// <summary>
        /// Create a new photo attachment
        /// </summary>
        /// <param name="photoAttachment">Photo attachment to create</param>
        /// <returns>Created photo attachment</returns>
        public async Task<PhotoAttachment> CreatePhotoAsync(PhotoAttachment photoAttachment)
        {
            _context.PhotoAttachments.Add(photoAttachment);
            await _context.SaveChangesAsync();
            
            // Reload with includes
            return await GetPhotoByIdAsync(photoAttachment.Id) ?? photoAttachment;
        }

        /// <summary>
        /// Update an existing photo attachment
        /// </summary>
        /// <param name="photoAttachment">Photo attachment to update</param>
        /// <returns>Updated photo attachment</returns>
        public async Task<PhotoAttachment> UpdatePhotoAsync(PhotoAttachment photoAttachment)
        {
            _context.PhotoAttachments.Update(photoAttachment);
            await _context.SaveChangesAsync();
            
            // Reload with includes
            return await GetPhotoByIdAsync(photoAttachment.Id) ?? photoAttachment;
        }

        /// <summary>
        /// Delete a photo attachment
        /// </summary>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>True if deleted successfully</returns>
        public async Task<bool> DeletePhotoAsync(int photoId)
        {
            var photo = await _context.PhotoAttachments.FindAsync(photoId);
            if (photo == null) return false;

            _context.PhotoAttachments.Remove(photo);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Create a photo validation record
        /// </summary>
        /// <param name="validation">Photo validation to create</param>
        /// <returns>Created validation</returns>
        public async Task<PhotoValidation> CreateValidationAsync(PhotoValidation validation)
        {
            _context.PhotoValidations.Add(validation);
            await _context.SaveChangesAsync();
            return validation;
        }

        /// <summary>
        /// Get validation for a specific photo
        /// </summary>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Photo validation or null</returns>
        public async Task<PhotoValidation?> GetValidationAsync(int photoId)
        {
            return await _context.PhotoValidations
                .Include(v => v.ValidatingUser)
                .FirstOrDefaultAsync(v => v.PhotoAttachmentId == photoId);
        }

        /// <summary>
        /// Create a photo share record
        /// </summary>
        /// <param name="photoShare">Photo share to create</param>
        /// <returns>Created photo share</returns>
        public async Task<PhotoShare> CreateShareAsync(PhotoShare photoShare)
        {
            _context.PhotoShares.Add(photoShare);
            await _context.SaveChangesAsync();
            
            // Reload with includes
            return await _context.PhotoShares
                .Include(s => s.Reactions)
                    .ThenInclude(r => r.User)
                .Include(s => s.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(s => s.Id == photoShare.Id) ?? photoShare;
        }

        /// <summary>
        /// Get photo share by photo ID
        /// </summary>
        /// <param name="photoId">Photo identifier</param>
        /// <returns>Photo share or null</returns>
        public async Task<PhotoShare?> GetShareAsync(string photoId)
        {
            // First find the photo by external ID to get the internal ID
            PhotoAttachment? photo = await GetPhotoByExternalIdAsync(photoId);
            if (photo == null) return null;

            return await _context.PhotoShares
                .Include(s => s.Reactions)
                    .ThenInclude(r => r.User)
                .Include(s => s.Comments)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(s => s.PhotoAttachmentId == photo.Id);
        }

        /// <summary>
        /// Get photo statistics for a family
        /// </summary>
        /// <param name="familyId">Family identifier</param>
        /// <returns>Photo statistics</returns>
        public async Task<PhotoStatistics> GetPhotoStatisticsAsync(int familyId)
        {
            var photos = await _context.PhotoAttachments
                .Where(p => p.FamilyId == familyId)
                .ToListAsync();

            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            var mostActiveUploader = await _context.PhotoAttachments
                .Where(p => p.FamilyId == familyId)
                .GroupBy(p => p.User.FirstName + " " + p.User.LastName)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefaultAsync();

            return new PhotoStatistics
            {
                TotalPhotos = photos.Count,
                TaskEvidencePhotos = photos.Count(p => p.IsTaskEvidence),
                AchievementPhotos = photos.Count(p => p.IsAchievementPhoto),
                TotalStorageUsed = photos.Sum(p => p.OriginalSize),
                AverageCompressionRatio = photos.Any() ? photos.Average(p => p.CompressionRatio) : 0,
                PhotosThisMonth = photos.Count(p => p.CapturedAt.Month == currentMonth && p.CapturedAt.Year == currentYear),
                MostActiveUploader = mostActiveUploader ?? "No uploads yet"
            };
        }

        // Missing interface methods - simplified implementations
        public async Task<IEnumerable<PhotoAttachment>> GetUserPhotosAsync(int userId, int familyId)
        {
            return await _context.PhotoAttachments
                .Where(p => p.UserId == userId && p.FamilyId == familyId)
                .ToListAsync();
        }

        public async Task<PhotoAttachment?> GetPhotoByExternalIdAsync(string externalId)
        {
            return await _context.PhotoAttachments
                .FirstOrDefaultAsync(p => p.ExternalId == externalId);
        }

        public async Task<IEnumerable<PhotoValidation>> GetPhotoValidationsAsync(int photoId)
        {
            return await _context.PhotoValidations
                .Where(v => v.PhotoAttachmentId == photoId)
                .ToListAsync();
        }

        public async Task<PhotoValidation> CreatePhotoValidationAsync(PhotoValidation validation)
        {
            _context.PhotoValidations.Add(validation);
            await _context.SaveChangesAsync();
            return validation;
        }

        public async Task<IEnumerable<PhotoShare>> GetPhotoSharesAsync(int photoId)
        {
            return await _context.PhotoShares
                .Where(s => s.PhotoAttachmentId == photoId)
                .ToListAsync();
        }

        public async Task<PhotoShare> CreatePhotoShareAsync(PhotoShare photoShare)
        {
            _context.PhotoShares.Add(photoShare);
            await _context.SaveChangesAsync();
            return photoShare;
        }

        public async Task<IEnumerable<PhotoReaction>> GetPhotoReactionsAsync(int shareId)
        {
            return await _context.PhotoReactions
                .Where(r => r.PhotoShareId == shareId)
                .ToListAsync();
        }

        public async Task<PhotoReaction> CreatePhotoReactionAsync(PhotoReaction reaction)
        {
            _context.PhotoReactions.Add(reaction);
            await _context.SaveChangesAsync();
            return reaction;
        }

        public async Task<IEnumerable<PhotoComment>> GetPhotoCommentsAsync(int shareId)
        {
            return await _context.PhotoComments
                .Where(c => c.PhotoShareId == shareId)
                .ToListAsync();
        }

        public async Task<PhotoComment> CreatePhotoCommentAsync(PhotoComment comment)
        {
            _context.PhotoComments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }
    }

   
} 