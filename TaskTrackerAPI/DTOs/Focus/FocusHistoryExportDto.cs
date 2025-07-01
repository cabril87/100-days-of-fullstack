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

namespace TaskTrackerAPI.DTOs.Focus;

/// <summary>
/// DTO for focus history export data
/// </summary>
public class FocusHistoryExportDto
{
    /// <summary>
    /// When the export was generated
    /// </summary>
    public DateTime ExportDate { get; set; }

    /// <summary>
    /// Start date of the export range
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// End date of the export range
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Total number of sessions in export
    /// </summary>
    public int TotalSessions { get; set; }

    /// <summary>
    /// Total minutes of focus time in export
    /// </summary>
    public int TotalMinutes { get; set; }

    /// <summary>
    /// List of focus sessions
    /// </summary>
    public List<FocusSessionDTO> Sessions { get; set; } = new();

    /// <summary>
    /// Summary statistics for the export
    /// </summary>
    public FocusExportSummaryDto Summary { get; set; } = new();

    /// <summary>
    /// Export format metadata
    /// </summary>
    public ExportMetadataDto Metadata { get; set; } = new();
}

/// <summary>
/// DTO for focus export summary statistics
/// </summary>
public class FocusExportSummaryDto
{
    /// <summary>
    /// Average session length in minutes
    /// </summary>
    public double AverageSessionLength { get; set; }

    /// <summary>
    /// Number of completed sessions
    /// </summary>
    public int CompletedSessions { get; set; }

    /// <summary>
    /// Number of interrupted sessions
    /// </summary>
    public int InterruptedSessions { get; set; }

    /// <summary>
    /// Total number of distractions recorded
    /// </summary>
    public int TotalDistractions { get; set; }

    /// <summary>
    /// Completion rate as percentage
    /// </summary>
    public double CompletionRate { get; set; }

    /// <summary>
    /// Most productive day (date string)
    /// </summary>
    public string? MostProductiveDay { get; set; }

    /// <summary>
    /// Total hours of focus time
    /// </summary>
    public double TotalHours { get; set; }
}

/// <summary>
/// DTO for export metadata
/// </summary>
public class ExportMetadataDto
{
    /// <summary>
    /// Export format (json, csv, etc.)
    /// </summary>
    public string Format { get; set; } = "json";

    /// <summary>
    /// Version of the export schema
    /// </summary>
    public string Version { get; set; } = "1.0";

    /// <summary>
    /// Application that generated the export
    /// </summary>
    public string GeneratedBy { get; set; } = "TaskTracker Enterprise";

    /// <summary>
    /// Whether personal data was included
    /// </summary>
    public bool IncludesPersonalData { get; set; } = true;
} 