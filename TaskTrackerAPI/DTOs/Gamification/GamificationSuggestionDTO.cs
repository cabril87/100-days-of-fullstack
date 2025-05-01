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
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    /// <summary>
    /// Represents a personalized gamification suggestion for a user
    /// </summary>
    public class GamificationSuggestionDetailDTO
    {
        /// <summary>
        /// Unique identifier for the suggestion
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Title of the suggestion
        /// </summary>
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Detailed description of the suggestion
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// Type of suggestion (task, login, achievement, reward, challenge)
        /// </summary>
        public string SuggestionType { get; set; } = string.Empty;
        
        /// <summary>
        /// Action type for the suggestion (complete_task, login, unlock_achievement, etc.)
        /// </summary>
        public string ActionType { get; set; } = string.Empty;
        
        /// <summary>
        /// ID of the related entity (task, achievement, reward, etc.)
        /// </summary>
        public int ActionId { get; set; }
        
        /// <summary>
        /// Priority level of the suggestion (1-10)
        /// </summary>
        public int Priority { get; set; }
        
        /// <summary>
        /// Number of points required or rewarded for this suggestion
        /// </summary>
        public int? RequiredPoints { get; set; }
        
        /// <summary>
        /// Whether the suggestion has been completed
        /// </summary>
        public bool IsCompleted { get; set; }
        
        /// <summary>
        /// When the suggestion was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
} 