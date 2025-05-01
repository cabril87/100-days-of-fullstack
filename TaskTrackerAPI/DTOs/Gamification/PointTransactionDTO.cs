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
    
    /// Data transfer object for point transactions in the gamification system
    
    public class PointTransactionDTO
    {
        
        /// Unique identifier for the transaction
        
        public int Id { get; set; }

        
        /// User identifier
        
        [Required]
        public int UserId { get; set; }

        
        /// Number of points in the transaction (positive for earned, negative for spent)
        
        [Required]
        public int Points { get; set; }

        
        /// Type of transaction (e.g., "TaskComplete", "RewardRedemption", "ChallengeComplete")
        
        [Required]
        [StringLength(50, ErrorMessage = "Transaction type cannot exceed 50 characters")]
        public string TransactionType { get; set; } = string.Empty;

        
        /// Description of the transaction
        
        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Related entity ID (e.g., task ID for task completion)
        
        public int? RelatedEntityId { get; set; }

        
        /// Date when the transaction occurred
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    
    /// DTO for adding points to a user
    
    public class AddPointsDTO
    {
        
        /// Number of points to add
        
        [Required]
        [Range(1, 10000, ErrorMessage = "Points must be between 1 and 10000")]
        public int Points { get; set; }

        
        /// Type of transaction
        
        [Required]
        [StringLength(50, ErrorMessage = "Transaction type cannot exceed 50 characters")]
        public string TransactionType { get; set; } = string.Empty;

        
        /// Description of the transaction
        
        [StringLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
        public string Description { get; set; } = string.Empty;

        
        /// Related entity ID (e.g., task ID for task completion)
        
        public int? RelatedEntityId { get; set; }
    }
} 