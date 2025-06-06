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
    /// Data export request data transfer object
    /// </summary>
    public class DataExportRequestDTO
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string ExportType { get; set; } = string.Empty; // JSON, CSV, PDF

        [Required]
        public string DateRange { get; set; } = string.Empty; // JSON

        [Required]
        public string Filters { get; set; } = string.Empty; // JSON

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "pending";

        public string? FilePath { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public string? ErrorMessage { get; set; }

        public string? DownloadUrl { get; set; }
    }

    /// <summary>
    /// Create data export request DTO
    /// </summary>
    public class CreateDataExportRequestDTO
    {
        [Required]
        [StringLength(50)]
        public string ExportType { get; set; } = string.Empty; // JSON, CSV, PDF

        [Required]
        public string DateRange { get; set; } = string.Empty; // JSON

        [Required]
        public string Filters { get; set; } = string.Empty; // JSON
    }

    /// <summary>
    /// Data export options DTO
    /// </summary>
    public class DataExportOptionsDTO
    {
        public List<ExportFormatDTO> ExportFormats { get; set; } = new();
        public List<DateRangeDTO> DateRanges { get; set; } = new();
        public List<FilterOptionDTO> FilterOptions { get; set; } = new();
        public List<CustomFieldDTO> CustomFields { get; set; } = new();
    }

    /// <summary>
    /// Export format option DTO
    /// </summary>
    public class ExportFormatDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Extension { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public long? MaxSize { get; set; }
    }

    /// <summary>
    /// Date range option DTO
    /// </summary>
    public class DateRangeDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    /// <summary>
    /// Filter option DTO
    /// </summary>
    public class FilterOptionDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<object> Values { get; set; } = new();
    }

    /// <summary>
    /// Custom field option DTO
    /// </summary>
    public class CustomFieldDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool Required { get; set; }
        public object? DefaultValue { get; set; }
    }

    /// <summary>
    /// Simple data export request DTO for frontend compatibility
    /// </summary>
    public class SimpleDataExportRequestDTO
    {
        [Required]
        [StringLength(50)]
        public string ExportType { get; set; } = "complete"; // complete, profile_only, activity_only, family_only

        [Required]
        [StringLength(20)]
        public string Format { get; set; } = "json"; // json, csv, pdf
    }
} 