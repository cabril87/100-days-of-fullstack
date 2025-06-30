/*
 * Photo Attachment Model
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Enterprise-grade photo attachment system for task completion evidence
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Represents a photo attachment for task completion evidence and family sharing
    /// </summary>
    public class PhotoAttachment
    {
        /// <summary>
        /// Unique identifier for the photo attachment
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Unique string identifier for external references
        /// </summary>
        [MaxLength(100)]
        public string ExternalId { get; set; } = string.Empty;

        /// <summary>
        /// Original filename of the uploaded photo
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        /// <summary>
        /// Original file size in bytes
        /// </summary>
        public long OriginalSize { get; set; }

        /// <summary>
        /// Compressed file size in bytes
        /// </summary>
        public long CompressedSize { get; set; }

        /// <summary>
        /// URL path to the stored photo file
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        /// <summary>
        /// URL path to the thumbnail version
        /// </summary>
        [MaxLength(500)]
        public string ThumbnailPath { get; set; } = string.Empty;

        /// <summary>
        /// MIME type of the photo file
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string MimeType { get; set; } = string.Empty;

        /// <summary>
        /// When the photo was originally captured/uploaded
        /// </summary>
        public DateTime CapturedAt { get; set; }

        /// <summary>
        /// Associated task ID if this is task evidence
        /// </summary>
        public int? TaskId { get; set; }

        /// <summary>
        /// Navigation property to associated task
        /// </summary>
        [ForeignKey(nameof(TaskId))]
        public virtual TaskItem? Task { get; set; }

        /// <summary>
        /// User who uploaded the photo
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property to user
        /// </summary>
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        /// <summary>
        /// Family context for the photo
        /// </summary>
        public int FamilyId { get; set; }

        /// <summary>
        /// Navigation property to family
        /// </summary>
        [ForeignKey(nameof(FamilyId))]
        public virtual Family Family { get; set; } = null!;

        /// <summary>
        /// Whether this photo serves as task completion evidence
        /// </summary>
        public bool IsTaskEvidence { get; set; }

        /// <summary>
        /// Whether this photo is associated with an achievement
        /// </summary>
        public bool IsAchievementPhoto { get; set; }

        /// <summary>
        /// Compression ratio percentage (0-100)
        /// </summary>
        public int CompressionRatio { get; set; }

        /// <summary>
        /// Photo width in pixels
        /// </summary>
        public int Width { get; set; }

        /// <summary>
        /// Photo height in pixels
        /// </summary>
        public int Height { get; set; }

        /// <summary>
        /// Device information when photo was captured
        /// </summary>
        [MaxLength(200)]
        public string? DeviceInfo { get; set; }

        /// <summary>
        /// GPS latitude if location was captured
        /// </summary>
        public double? Latitude { get; set; }

        /// <summary>
        /// GPS longitude if location was captured
        /// </summary>
        public double? Longitude { get; set; }

        /// <summary>
        /// When the photo record was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the photo record was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Navigation property to photo validations
        /// </summary>
        public virtual ICollection<PhotoValidation> Validations { get; set; } = new List<PhotoValidation>();

        /// <summary>
        /// Navigation property to photo shares
        /// </summary>
        public virtual ICollection<PhotoShare> Shares { get; set; } = new List<PhotoShare>();
    }
} 