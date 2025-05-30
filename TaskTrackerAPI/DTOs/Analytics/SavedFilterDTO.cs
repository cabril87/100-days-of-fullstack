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

namespace TaskTrackerAPI.DTOs.Analytics
{
    /// <summary>
    /// Saved filter data transfer object
    /// </summary>
    public class SavedFilterDTO
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string FilterCriteria { get; set; } = string.Empty; // JSON

        [Required]
        [StringLength(50)]
        public string QueryType { get; set; } = string.Empty;

        public bool IsPublic { get; set; } = false;

        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Create saved filter request DTO
    /// </summary>
    public class CreateSavedFilterDTO
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string FilterCriteria { get; set; } = string.Empty; // JSON

        [Required]
        [StringLength(50)]
        public string QueryType { get; set; } = string.Empty;

        public bool IsPublic { get; set; } = false;
    }

    /// <summary>
    /// Update saved filter request DTO
    /// </summary>
    public class UpdateSavedFilterDTO
    {
        [StringLength(100)]
        public string? Name { get; set; }

        public string? FilterCriteria { get; set; } // JSON

        [StringLength(50)]
        public string? QueryType { get; set; }

        public bool? IsPublic { get; set; }
    }
} 