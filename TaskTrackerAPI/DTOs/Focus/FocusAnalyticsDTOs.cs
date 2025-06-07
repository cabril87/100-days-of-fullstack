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

namespace TaskTrackerAPI.DTOs.Focus
{
    /// <summary>
    /// Hourly session analytics data DTO
    /// </summary>
    public class HourlySessionDataDTO
    {
        public int Count { get; set; }
        public double AvgQuality { get; set; }
        public double AvgLength { get; set; }
        public double CompletionRate { get; set; }
    }

    /// <summary>
    /// Category-based session analytics data DTO
    /// </summary>
    public class CategorySessionDataDTO
    {
        public int Count { get; set; }
        public double AvgQuality { get; set; }
        public int TotalTime { get; set; }
        public int CompletedTasks { get; set; }
    }

    /// <summary>
    /// Hourly recommendation analytics data DTO
    /// </summary>
    public class HourlyRecommendationDataDTO
    {
        public int Count { get; set; }
        public double AvgQuality { get; set; }
    }
} 