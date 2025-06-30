/*
 * Photo Attachment DTOs
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Data Transfer Objects for photo attachment system
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using System;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Photos
{
    /// <summary>
    /// DTO for photo attachment responses
    /// </summary>
    public class PhotoAttachmentDTO
    {
        /// <summary>
        /// Unique identifier for the photo attachment
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Original filename of the uploaded photo
        /// </summary>
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
        /// URL to access the photo file
        /// </summary>
        public string Url { get; set; } = string.Empty;

        /// <summary>
        /// URL to access the thumbnail version
        /// </summary>
        public string ThumbnailUrl { get; set; } = string.Empty;

        /// <summary>
        /// MIME type of the photo file
        /// </summary>
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
        /// User ID who uploaded the photo
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Name of the user who uploaded the photo
        /// </summary>
        public string UserName { get; set; } = string.Empty;

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
        /// Photo metadata
        /// </summary>
        public PhotoMetadataDTO Metadata { get; set; } = new();
    }

    /// <summary>
    /// DTO for photo metadata
    /// </summary>
    public class PhotoMetadataDTO
    {
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
        public string? DeviceInfo { get; set; }

        /// <summary>
        /// GPS location if captured
        /// </summary>
        public PhotoLocationDTO? Location { get; set; }
    }

    /// <summary>
    /// DTO for photo GPS location
    /// </summary>
    public class PhotoLocationDTO
    {
        /// <summary>
        /// GPS latitude
        /// </summary>
        public double Latitude { get; set; }

        /// <summary>
        /// GPS longitude
        /// </summary>
        public double Longitude { get; set; }
    }

    /// <summary>
    /// DTO for creating photo attachments
    /// </summary>
    public class CreatePhotoAttachmentDTO
    {
        /// <summary>
        /// Original filename
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        /// <summary>
        /// MIME type of the file
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string MimeType { get; set; } = string.Empty;

        /// <summary>
        /// Original file size in bytes
        /// </summary>
        public long OriginalSize { get; set; }

        /// <summary>
        /// Compressed file size in bytes
        /// </summary>
        public long CompressedSize { get; set; }

        /// <summary>
        /// Compression ratio percentage
        /// </summary>
        public int CompressionRatio { get; set; }

        /// <summary>
        /// Associated task ID if this is task evidence
        /// </summary>
        public int? TaskId { get; set; }

        /// <summary>
        /// Whether this photo serves as task completion evidence
        /// </summary>
        public bool IsTaskEvidence { get; set; }

        /// <summary>
        /// Whether this photo is associated with an achievement
        /// </summary>
        public bool IsAchievementPhoto { get; set; }

        /// <summary>
        /// Photo metadata
        /// </summary>
        public PhotoMetadataDTO Metadata { get; set; } = new();

        /// <summary>
        /// Base64 encoded photo data
        /// </summary>
        [Required]
        public string PhotoData { get; set; } = string.Empty;

        /// <summary>
        /// Base64 encoded thumbnail data
        /// </summary>
        [Required]
        public string ThumbnailData { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for photo validation
    /// </summary>
    public class PhotoValidationDTO
    {
        /// <summary>
        /// Whether the photo is considered valid evidence
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// Type of validation performed
        /// </summary>
        public string ValidationType { get; set; } = string.Empty;

        /// <summary>
        /// User ID who performed the validation
        /// </summary>
        public int? ValidatedBy { get; set; }

        /// <summary>
        /// When the validation was performed
        /// </summary>
        public DateTime? ValidatedAt { get; set; }

        /// <summary>
        /// Validation score from 0-100
        /// </summary>
        public int ValidationScore { get; set; }

        /// <summary>
        /// Optional feedback from the validator
        /// </summary>
        public string? Feedback { get; set; }
    }

    /// <summary>
    /// DTO for creating photo validation
    /// </summary>
    public class CreatePhotoValidationDTO
    {
        /// <summary>
        /// Photo attachment ID to validate
        /// </summary>
        [Required]
        public string PhotoId { get; set; } = string.Empty;

        /// <summary>
        /// Type of validation to perform
        /// </summary>
        [Required]
        public string ValidationType { get; set; } = string.Empty;

        /// <summary>
        /// Optional feedback
        /// </summary>
        [MaxLength(1000)]
        public string? Feedback { get; set; }
    }

    /// <summary>
    /// DTO for photo sharing
    /// </summary>
    public class PhotoShareDTO
    {
        /// <summary>
        /// Photo attachment ID
        /// </summary>
        public string PhotoId { get; set; } = string.Empty;

        /// <summary>
        /// Family member IDs to share with
        /// </summary>
        public int[] SharedWith { get; set; } = Array.Empty<int>();

        /// <summary>
        /// Optional message with the share
        /// </summary>
        public string? ShareMessage { get; set; }

        /// <summary>
        /// Photo reactions
        /// </summary>
        public PhotoReactionDTO[] Reactions { get; set; } = Array.Empty<PhotoReactionDTO>();

        /// <summary>
        /// Photo comments
        /// </summary>
        public PhotoCommentDTO[] Comments { get; set; } = Array.Empty<PhotoCommentDTO>();
    }

    /// <summary>
    /// DTO for photo reactions
    /// </summary>
    public class PhotoReactionDTO
    {
        /// <summary>
        /// User ID who reacted
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Name of the user who reacted
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Type of reaction
        /// </summary>
        public string Reaction { get; set; } = string.Empty;

        /// <summary>
        /// When the reaction was created
        /// </summary>
        public DateTime ReactedAt { get; set; }
    }

    /// <summary>
    /// DTO for photo comments
    /// </summary>
    public class PhotoCommentDTO
    {
        /// <summary>
        /// User ID who commented
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Name of the user who commented
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// Comment text
        /// </summary>
        public string Comment { get; set; } = string.Empty;

        /// <summary>
        /// When the comment was created
        /// </summary>
        public DateTime CommentedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating photo shares
    /// </summary>
    public class CreatePhotoShareDTO
    {
        /// <summary>
        /// Photo attachment ID to share
        /// </summary>
        [Required]
        public string PhotoId { get; set; } = string.Empty;

        /// <summary>
        /// Family member IDs to share with
        /// </summary>
        [Required]
        public int[] SharedWith { get; set; } = Array.Empty<int>();

        /// <summary>
        /// Optional message with the share
        /// </summary>
        [MaxLength(500)]
        public string? ShareMessage { get; set; }
    }
}