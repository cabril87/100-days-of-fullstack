using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    /// <summary>
    /// DTO for toggling badge display status
    /// </summary>
    public class BadgeToggleDTO
    {
        /// <summary>
        /// The badge ID to toggle display for
        /// </summary>
        [Required]
        public int BadgeId { get; set; }

        /// <summary>
        /// Whether the badge should be displayed on the user's profile
        /// </summary>
        public bool IsDisplayed { get; set; }
    }
} 