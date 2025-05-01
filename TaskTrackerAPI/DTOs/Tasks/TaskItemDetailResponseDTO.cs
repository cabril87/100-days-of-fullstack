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
    
    /// Response DTO for a single task item with detailed information
    
    public class TaskItemDetailResponseDTO
    {
        
        /// The task item details
        
        public TaskItemResponseDTO Task { get; set; } = new TaskItemResponseDTO();

        
        /// HATEOAS links
        
        public Dictionary<string, string> Links { get; set; } = new Dictionary<string, string>();
    }
} 