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
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Gamification
{
    public class CharacterProgressDTO
    {
        public int UserId { get; set; }
        public string CurrentCharacterClass { get; set; } = "explorer";
        public int CharacterLevel { get; set; }
        public int CharacterXP { get; set; }
        public List<string> UnlockedCharacters { get; set; } = new List<string>();
        public string CurrentTier { get; set; } = "bronze";
        public int TotalPoints { get; set; }
    }

    public class SwitchCharacterDTO
    {
        [Required]
        [StringLength(50)]
        public string CharacterClass { get; set; } = string.Empty;
    }

    public class UnlockCharacterDTO
    {
        [Required]
        [StringLength(50)]
        public string CharacterClass { get; set; } = string.Empty;
    }

    public class FocusSessionCompletionDTO
    {
        [Required]
        public int SessionId { get; set; }
        
        [Required]
        public int DurationMinutes { get; set; }
        
        public bool WasCompleted { get; set; } = true;
    }

    public class FocusCompletionRewardDTO
    {
        public int PointsAwarded { get; set; }
        public int CharacterXPAwarded { get; set; }
        public List<string> AchievementsUnlocked { get; set; } = new List<string>();
        public List<string> BadgesAwarded { get; set; } = new List<string>();
        public bool LeveledUp { get; set; }
        public bool TierAdvanced { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class TierProgressDTO
    {
        public string CurrentTier { get; set; } = "bronze";
        public int TierLevel { get; set; }
        public int CurrentPoints { get; set; }
        public int PointsForNextTier { get; set; }
        public int ProgressPercentage { get; set; }
        public List<TierInfoDTO> AllTiers { get; set; } = new List<TierInfoDTO>();
    }

    public class TierInfoDTO
    {
        public string Name { get; set; } = string.Empty;
        public int Level { get; set; }
        public int PointsRequired { get; set; }
        public string Color { get; set; } = string.Empty;
        public string BgColor { get; set; } = string.Empty;
        public bool IsUnlocked { get; set; }
        public bool IsCurrent { get; set; }
    }
} 