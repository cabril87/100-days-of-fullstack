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
    public class UserChallengeProgressDTO
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int ChallengeId { get; set; }
        
        public string ChallengeTitle { get; set; } = string.Empty;
        
        public int CurrentProgress { get; set; }
        
        public int RequiredProgress { get; set; }
        
        public bool IsCompleted { get; set; }
        
        public DateTime StartedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
    }
} 