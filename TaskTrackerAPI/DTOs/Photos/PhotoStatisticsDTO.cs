/*
 * Photo Statistics DTO
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Data transfer object for photo statistics
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

namespace TaskTrackerAPI.DTOs.Photos
{
    /// <summary>
    /// Photo statistics data transfer object for family photo reporting
    /// </summary>
    public class PhotoStatisticsDTO
    {
        /// <summary>
        /// Total number of photos in the family
        /// </summary>
        public int TotalPhotos { get; set; }

        /// <summary>
        /// Number of photos used as task evidence
        /// </summary>
        public int TaskEvidencePhotos { get; set; }

        /// <summary>
        /// Number of photos associated with achievements
        /// </summary>
        public int AchievementPhotos { get; set; }

        /// <summary>
        /// Total storage used by all photos in bytes
        /// </summary>
        public long TotalStorageUsed { get; set; }

        /// <summary>
        /// Average compression ratio across all photos
        /// </summary>
        public double AverageCompressionRatio { get; set; }

        /// <summary>
        /// Number of photos uploaded this month
        /// </summary>
        public int PhotosThisMonth { get; set; }

        /// <summary>
        /// Name of the family member who uploads the most photos
        /// </summary>
        public string MostActiveUploader { get; set; } = string.Empty;
    }
} 