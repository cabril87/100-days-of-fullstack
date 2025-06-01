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

namespace TaskTrackerAPI.Models.Gamification
{
    /// <summary>
    /// Represents the progress of a user towards an achievement
    /// (Used for displaying both achieved and unachieved achievements)
    /// </summary>
    public class AchievementProgress
    {
        /// <summary>
        /// The achievement this progress relates to
        /// </summary>
        public Achievement Achievement { get; set; } = null!;

        /// <summary>
        /// Current progress value (0-100 typically)
        /// </summary>
        public int Progress { get; set; }

        /// <summary>
        /// Whether the achievement has been earned
        /// </summary>
        public bool IsEarned { get; set; }

        /// <summary>
        /// Date when the achievement was earned (if earned)
        /// </summary>
        public DateTime? EarnedAt { get; set; }

        /// <summary>
        /// Percentage completion (calculated property)
        /// </summary>
        public double ProgressPercentage => Math.Min((double)Progress / 100.0 * 100.0, 100.0);

        /// <summary>
        /// Whether the achievement is in progress (has some progress but not complete)
        /// </summary>
        public bool IsInProgress => Progress > 0 && !IsEarned;

        /// <summary>
        /// Whether the achievement is available to start (no progress yet)
        /// </summary>
        public bool IsAvailable => Progress == 0 && !IsEarned;
    }
} 