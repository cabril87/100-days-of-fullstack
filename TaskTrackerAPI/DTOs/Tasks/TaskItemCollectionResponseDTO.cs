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

namespace TaskTrackerAPI.DTOs.Tasks
{
    
    /// Response DTO for a collection of task items with pagination metadata
    
    public class TaskItemCollectionResponseDTO
    {
        
        /// Collection of task items
        
        public IEnumerable<TaskItemResponseDTO> Tasks { get; set; } = new List<TaskItemResponseDTO>();

        
        /// Total count of tasks (for pagination)
        
        public int TotalCount { get; set; }

        
        /// HATEOAS links for pagination
        
        public Dictionary<string, string> Links { get; set; } = new Dictionary<string, string>();
    }
} 