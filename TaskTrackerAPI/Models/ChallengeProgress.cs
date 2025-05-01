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

namespace TaskTrackerAPI.Models
{
    public class ChallengeProgress
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ChallengeId { get; set; }
        
        [Required]
        public int CurrentProgress { get; set; }
        
        [Required]
        public bool IsCompleted { get; set; }
        
        [Required]
        public DateTime EnrolledAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        // Additional stats tracking
        public int TasksCompleted { get; set; }
        
        public int PointsEarned { get; set; }
        
        // Navigation properties
        public User? User { get; set; }
        
        public Challenge? Challenge { get; set; }
    }
} 