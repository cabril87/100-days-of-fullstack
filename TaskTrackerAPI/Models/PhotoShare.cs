/*
 * Photo Share Model
 * Copyright (c) 2025 TaskTracker Enterprise
 * 
 * Family photo sharing system with reactions and comments
 * Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md standards
 */

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Represents a photo shared with family members
    /// </summary>
    public class PhotoShare
    {
        /// <summary>
        /// Unique identifier for the photo share
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
        /// User who shared the photo
        /// </summary>
        public int SharedBy { get; set; }

        /// <summary>
        /// Navigation property to sharing user
        /// </summary>
        [ForeignKey(nameof(SharedBy))]
        public virtual User SharingUser { get; set; } = null!;

        /// <summary>
        /// Optional message with the share
        /// </summary>
        [MaxLength(500)]
        public string? ShareMessage { get; set; }

        /// <summary>
        /// When the photo was shared
        /// </summary>
        public DateTime SharedAt { get; set; }

        /// <summary>
        /// When the share record was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// When the share record was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Navigation property to photo reactions
        /// </summary>
        public virtual ICollection<PhotoReaction> Reactions { get; set; } = new List<PhotoReaction>();

        /// <summary>
        /// Navigation property to photo comments
        /// </summary>
        public virtual ICollection<PhotoComment> Comments { get; set; } = new List<PhotoComment>();
    }

    /// <summary>
    /// Represents a reaction to a shared photo
    /// </summary>
    public class PhotoReaction
    {
        /// <summary>
        /// Unique identifier for the reaction
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Associated photo share ID
        /// </summary>
        public int PhotoShareId { get; set; }

        /// <summary>
        /// Navigation property to photo share
        /// </summary>
        [ForeignKey(nameof(PhotoShareId))]
        public virtual PhotoShare PhotoShare { get; set; } = null!;

        /// <summary>
        /// User who reacted
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property to reacting user
        /// </summary>
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        /// <summary>
        /// Type of reaction
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string ReactionType { get; set; } = string.Empty; // like, love, wow, celebrate

        /// <summary>
        /// When the reaction was created
        /// </summary>
        public DateTime ReactedAt { get; set; }
    }

    /// <summary>
    /// Represents a comment on a shared photo
    /// </summary>
    public class PhotoComment
    {
        /// <summary>
        /// Unique identifier for the comment
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Associated photo share ID
        /// </summary>
        public int PhotoShareId { get; set; }

        /// <summary>
        /// Navigation property to photo share
        /// </summary>
        [ForeignKey(nameof(PhotoShareId))]
        public virtual PhotoShare PhotoShare { get; set; } = null!;

        /// <summary>
        /// User who commented
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property to commenting user
        /// </summary>
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; } = null!;

        /// <summary>
        /// Comment text
        /// </summary>
        [Required]
        [MaxLength(1000)]
        public string Comment { get; set; } = string.Empty;

        /// <summary>
        /// When the comment was created
        /// </summary>
        public DateTime CommentedAt { get; set; }

        /// <summary>
        /// When the comment was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }
    }
} 