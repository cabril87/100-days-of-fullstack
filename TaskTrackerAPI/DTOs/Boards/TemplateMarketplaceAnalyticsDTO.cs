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

namespace TaskTrackerAPI.DTOs.Boards;

/// <summary>
/// DTO for marketplace analytics
/// </summary>
public class TemplateMarketplaceAnalyticsDTO
{
    public int TotalTemplates { get; set; }
    public int PublicTemplates { get; set; }
    public int PrivateTemplates { get; set; }
    public int TotalUsages { get; set; }
    public decimal AverageRating { get; set; }
    public List<TemplateStatisticsDTO> TopTemplates { get; set; } = new List<TemplateStatisticsDTO>();
    public Dictionary<string, int> TemplatesByCategory { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, int> UsagesByMonth { get; set; } = new Dictionary<string, int>();
} 