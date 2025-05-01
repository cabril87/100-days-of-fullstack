/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    /// <summary>
    /// Data transfer object for Badge
    /// </summary>
    public class BadgeDTO
    {
        /// <summary>
        /// Unique identifier for the badge
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Display name of the badge
        /// </summary>
        public string? Name { get; set; }
        
        /// <summary>
        /// Description of how to earn the badge
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Category the badge belongs to
        /// </summary>
        public string? Category { get; set; }
        
        /// <summary>
        /// URL to the badge image
        /// </summary>
        public string? IconUrl { get; set; }
        
        /// <summary>
        /// Criteria for earning the badge
        /// </summary>
        public string? Criteria { get; set; }
        
        /// <summary>
        /// Rarity level of the badge
        /// </summary>
        public string? Rarity { get; set; }
        
        /// <summary>
        /// Color scheme for the badge display
        /// </summary>
        public string? ColorScheme { get; set; }
        
        /// <summary>
        /// Points awarded for earning the badge
        /// </summary>
        public int PointValue { get; set; }
        
        /// <summary>
        /// Order for displaying the badge
        /// </summary>
        public int DisplayOrder { get; set; }
        
        /// <summary>
        /// Whether the badge is active
        /// </summary>
        public bool IsActive { get; set; }
        
        /// <summary>
        /// When the badge was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// When the badge was last updated
        /// </summary>
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO for creating or updating a badge
    /// </summary>
    public class BadgeCreateUpdateDTO
    {
        /// <summary>
        /// Name of the badge
        /// </summary>
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the badge
        /// </summary>
        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Category of the badge
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
        /// Criteria for earning the badge
        /// </summary>
        [Required]
        [StringLength(500)]
        public string Criteria { get; set; } = string.Empty;
        
        /// <summary>
        /// Rarity level of the badge
        /// </summary>
        [Required]
        [StringLength(50)]
        public string Rarity { get; set; } = string.Empty;
        
        /// <summary>
        /// Color scheme for displaying the badge
        /// </summary>
        [Required]
        [StringLength(50)]
        public string ColorScheme { get; set; } = string.Empty;
        
        /// <summary>
        /// Points awarded for earning the badge
        /// </summary>
        [Range(0, 10000)]
        public int PointValue { get; set; } = 100;
        
        /// <summary>
        /// Order for displaying badges
        /// </summary>
        public int DisplayOrder { get; set; } = 0;
        
        /// <summary>
        /// Whether the badge is active and can be earned
        /// </summary>
        public bool IsActive { get; set; } = true;
    }

    /// <summary>
    /// DTO for user badge information
    /// </summary>
    public class UserBadgeDTO
    {
        /// <summary>
        /// User badge assignment ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// The badge data
        /// </summary>
        public BadgeDTO? Badge { get; set; }

        /// <summary>
        /// When the badge was awarded to the user
        /// </summary>
        public DateTime AwardedAt { get; set; }

        /// <summary>
        /// Notes about how the badge was earned
        /// </summary>
        public string? Notes { get; set; }

        /// <summary>
        /// Whether the badge is displayed on the user's profile
        /// </summary>
        public bool IsDisplayed { get; set; }

        /// <summary>
        /// Whether the badge is featured on the user's profile
        /// </summary>
        public bool IsFeatured { get; set; }

        /// <summary>
        /// Optional notes about why the badge was awarded
        /// </summary>
        public string? AwardNote { get; set; }
    }

    /// <summary>
    /// Data transfer object for assigning a badge to a user
    /// </summary>
    public class BadgeAssignmentDTO
    {
        /// <summary>
        /// The badge identifier to assign
        /// </summary>
        [Required]
        public int BadgeId { get; set; }

        /// <summary>
        /// Optional notes about why the badge was awarded
        /// </summary>
        [StringLength(200)]
        public string AwardNotes { get; set; } = string.Empty;

        /// <summary>
        /// Whether the badge should be displayed on the user's profile
        /// </summary>
        public bool IsDisplayed { get; set; } = false;

        /// <summary>
        /// The display order of the badge on the user's profile
        /// </summary>
        public int? DisplayOrder { get; set; }
    }
} 