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

namespace TaskTrackerAPI.DTOs
{
    public class FocusStatisticsDto
    {
        public int TotalMinutesFocused { get; set; }
        
        public int SessionCount { get; set; }
        
        public int DistractionCount { get; set; }
        
        public Dictionary<string, int> DistractionsByCategory { get; set; } = new Dictionary<string, int>();
        
        public double AverageSessionLength { get; set; }
        
        public Dictionary<string, int> DailyFocusMinutes { get; set; } = new Dictionary<string, int>();
    }
} 