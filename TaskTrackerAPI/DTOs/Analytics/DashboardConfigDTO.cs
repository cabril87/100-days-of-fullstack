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
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TaskTrackerAPI.DTOs.Analytics
{
    /// <summary>
    /// Dashboard configuration DTO
    /// </summary>
    public class DashboardConfigDTO
    {
        public List<WidgetConfigDTO> Widgets { get; set; } = new();
        public DashboardLayoutDTO Layout { get; set; } = new();
        public DashboardPreferencesDTO Preferences { get; set; } = new();
        public SharedSettingsDTO SharedSettings { get; set; } = new();
    }

    /// <summary>
    /// Widget configuration DTO
    /// </summary>
    public class WidgetConfigDTO
    {
        public int Id { get; set; }
        public string WidgetType { get; set; } = string.Empty;
        public WidgetPositionDTO Position { get; set; } = new();
        public WidgetConfigurationDTO Configuration { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    /// <summary>
    /// Widget position DTO
    /// </summary>
    public class WidgetPositionDTO
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int W { get; set; }
        public int H { get; set; }
    }

    /// <summary>
    /// Widget configuration details DTO
    /// </summary>
    public class WidgetConfigurationDTO
    {
        public string Title { get; set; } = string.Empty;
        public string DataSource { get; set; } = string.Empty;
        public string? ChartType { get; set; }
        public string? Filters { get; set; } // JSON
        public int? RefreshInterval { get; set; }
        public bool? ShowLegend { get; set; }
        public string? ColorScheme { get; set; }
    }

    /// <summary>
    /// Dashboard layout DTO
    /// </summary>
    public class DashboardLayoutDTO
    {
        public int Columns { get; set; } = 12;
        public int RowHeight { get; set; } = 150;
        public List<int> Margin { get; set; } = new() { 10, 10 };
        public List<int> ContainerPadding { get; set; } = new() { 10, 10 };
    }

    /// <summary>
    /// Dashboard preferences DTO
    /// </summary>
    public class DashboardPreferencesDTO
    {
        public string Theme { get; set; } = "auto"; // light, dark, auto
        public bool AutoRefresh { get; set; } = true;
        public int RefreshInterval { get; set; } = 300; // seconds
        public bool ShowTooltips { get; set; } = true;
        public bool AnimationsEnabled { get; set; } = true;
    }

    /// <summary>
    /// Shared settings DTO
    /// </summary>
    public class SharedSettingsDTO
    {
        public bool IsPublic { get; set; } = false;
        public List<int> AllowedUsers { get; set; } = new();
        public List<DashboardPermissionDTO> Permissions { get; set; } = new();
    }

    /// <summary>
    /// Dashboard permission DTO
    /// </summary>
    public class DashboardPermissionDTO
    {
        public int UserId { get; set; }
        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; } = false;
        public bool CanShare { get; set; } = false;
    }

    /// <summary>
    /// Create widget request DTO
    /// </summary>
    public class CreateWidgetDTO
    {
        [Required]
        [StringLength(50)]
        public string WidgetType { get; set; } = string.Empty;

        [Required]
        public WidgetPositionDTO Position { get; set; } = new();

        [Required]
        public WidgetConfigurationDTO Configuration { get; set; } = new();
    }

    /// <summary>
    /// Update widget request DTO
    /// </summary>
    public class UpdateWidgetDTO
    {
        public WidgetPositionDTO? Position { get; set; }
        public WidgetConfigurationDTO? Configuration { get; set; }
        public bool? IsActive { get; set; }
    }
} 