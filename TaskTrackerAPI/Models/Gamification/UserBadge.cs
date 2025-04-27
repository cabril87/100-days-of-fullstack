using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.Gamification
{
    /// <summary>
    /// Represents a badge awarded to a user
    /// </summary>
    public class UserBadge
    {
        /// <summary>
        /// Primary key for the user badge assignment
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// ID of the user who earned the badge
        /// </summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>
        /// Navigation property to the user
        /// </summary>
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        /// <summary>
        /// ID of the badge earned
        /// </summary>
        [Required]
        public int BadgeId { get; set; }

        /// <summary>
        /// Navigation property to the badge
        /// </summary>
        [ForeignKey("BadgeId")]
        public virtual Badge Badge { get; set; } = null!;

        /// <summary>
        /// Date and time when the badge was awarded
        /// </summary>
        public DateTime AwardedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Optional note about how the badge was earned
        /// </summary>
        [StringLength(500)]
        public string AwardNote { get; set; } = string.Empty;

        /// <summary>
        /// Whether the badge is currently displayed on the user's profile
        /// </summary>
        public bool IsDisplayed { get; set; } = true;

        /// <summary>
        /// Whether this badge is featured (pinned) on the user's profile
        /// </summary>
        public bool IsFeatured { get; set; } = false;
    }
} 