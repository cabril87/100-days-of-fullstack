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
using System.Text.Json.Serialization;

namespace TaskTrackerAPI.DTOs.Family
{
    /// <summary>
    /// Enhanced DTO for assigning tasks to family members with flexible member identification
    /// </summary>
    public class FlexibleTaskAssignmentDTO
    {
        /// <summary>
        /// The ID of the task to assign
        /// </summary>
        [Required]
        public int TaskId { get; set; }
        
        /// <summary>
        /// The user ID to assign the task to - this can be handled flexibly
        /// </summary>
        [Required]
        public dynamic AssignToUserId { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Whether the task requires approval when completed
        /// </summary>
        public bool RequiresApproval { get; set; }
        
        /// <summary>
        /// Required: The member ID as expected by validator
        /// </summary>
        [Required]
        public dynamic MemberId { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Required: The user ID as expected by validator
        /// </summary>
        [Required]
        public dynamic UserId { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Optional: Another way to reference the family member
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public dynamic FamilyMemberId { get; set; } = new Dictionary<string, object>();
        
        /// <summary>
        /// Optional: The family ID for cross-reference validation
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? FamilyId { get; set; }
    }
} 