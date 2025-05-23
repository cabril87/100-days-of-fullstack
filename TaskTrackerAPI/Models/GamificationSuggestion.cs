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

namespace TaskTrackerAPI.Models
{
    public class GamificationSuggestion
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int? RelevantId { get; set; }
        public int PotentialPoints { get; set; }
        public double RelevanceScore { get; set; }
        public int Points { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public int ActionId { get; set; }
        public bool IsCompleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 