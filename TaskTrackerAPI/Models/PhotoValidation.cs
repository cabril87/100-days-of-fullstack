/*
 * Photo Validation Model
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Photo validation system for task completion verification
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Represents validation status and details for photo evidence
    /// </summary>
    public class PhotoValidation
    {
        /// <summary>
        /// Unique identifier for the validation record
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Associated photo attachment ID
        /// </summary>
        public int PhotoAttachmentId { get; set; }

        /// <summary>
        /// Navigation property to photo attachment
        /// </summary>
        [ForeignKey(nameof(PhotoAttachmentId))]
        public virtual PhotoAttachment PhotoAttachment { get; set; } = null!;

        /// <summary>
        /// Whether the photo is considered valid evidence
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// Type of validation performed
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string ValidationType { get; set; } = string.Empty; // automatic, family_review, self_validated

        /// <summary>
        /// User who performed the validation (if applicable)
        /// </summary>
        public int? ValidatedBy { get; set; }

        /// <summary>
        /// Navigation property to validating user
        /// </summary>
        [ForeignKey(nameof(ValidatedBy))]
        public virtual User? ValidatingUser { get; set; }

        /// <summary>
        /// When the validation was performed
        /// </summary>
        public DateTime? ValidatedAt { get; set; }

        /// <summary>
        /// Validation score from 0-100
        /// </summary>
        [Range(0, 100)]
        public int ValidationScore { get; set; }

        /// <summary>
        /// Optional feedback from the validator
        /// </summary>
        [MaxLength(1000)]
        public string? Feedback { get; set; }

        /// <summary>
        /// When the validation record was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the validation record was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 