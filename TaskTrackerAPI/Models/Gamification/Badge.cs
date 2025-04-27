using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskTrackerAPI.Models.Gamification
{
    /// <summary>
    /// Represents badges that users can earn for various accomplishments
    /// </summary>
    public class Badge
    {
        /// <summary>
        /// Primary key for the badge
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Name of the badge
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Description of the badge
        /// </summary>
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Category of the badge (e.g., 'Productivity', 'Teamwork', etc.)
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// URL to the badge icon image
        /// </summary>
        [Required]
        [StringLength(255)]
        public string IconUrl { get; set; } = string.Empty;     

        /// <summary>
        /// Rules for earning the badge
        /// </summary>
        [StringLength(1000)]
        public string Criteria { get; set; } = string.Empty;

        /// <summary>
        /// Rarity level of the badge (e.g., 'Common', 'Rare', 'Legendary')
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Rarity { get; set; } = string.Empty;

        /// <summary>
        /// Color scheme for displaying the badge
        /// </summary>
        [StringLength(50)]
        public string ColorScheme { get; set; } = string.Empty;

        /// <summary>
        /// Order for displaying badges
        /// </summary>
        public int DisplayOrder { get; set; } = 0;

        /// <summary>
        /// Whether the badge is active and can be earned
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// When the badge was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// When the badge was last updated
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Collection of user badge assignments
        /// </summary>
        public virtual ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
    }
} 