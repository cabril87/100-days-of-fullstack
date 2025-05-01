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

namespace TaskTrackerAPI.DTOs.Tasks
{
    /// <summary>
    /// DTO for task update conflicts (optimistic concurrency)
    /// </summary>
    public class TaskConflictDTO
    {
        /// <summary>
        /// ID of the task with the conflict
        /// </summary>
        public int TaskId { get; set; }
        
        /// <summary>
        /// The version the client was trying to update
        /// </summary>
        public long ClientVersion { get; set; }
        
        /// <summary>
        /// The current version on the server
        /// </summary>
        public long ServerVersion { get; set; }
        
        /// <summary>
        /// Timestamp when the conflict was detected
        /// </summary>
        public DateTime ConflictTime { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// The client's attempted changes
        /// </summary>
        public TaskItemDTO ClientChanges { get; set; } = null!;
        
        /// <summary>
        /// The current state on the server
        /// </summary>
        public TaskItemDTO ServerState { get; set; } = null!;
        
        /// <summary>
        /// List of specific fields in conflict
        /// </summary>
        public List<string> ConflictingFields { get; set; } = new List<string>();
        
        /// <summary>
        /// Whether the conflict can be auto-resolved
        /// </summary>
        public bool CanAutoResolve { get; set; }
        
        /// <summary>
        /// Suggested resolution strategy
        /// </summary>
        public ConflictResolutionStrategy SuggestedStrategy { get; set; } = ConflictResolutionStrategy.ManualMerge;
    }
    
    /// <summary>
    /// Strategies for resolving task update conflicts
    /// </summary>
    public enum ConflictResolutionStrategy
    {
        /// <summary>
        /// Keep client changes and overwrite server
        /// </summary>
        UseClientVersion = 0,
        
        /// <summary>
        /// Discard client changes and use server version
        /// </summary>
        UseServerVersion = 1,
        
        /// <summary>
        /// Auto-merge changes where possible (non-conflicting fields)
        /// </summary>
        AutoMerge = 2,
        
        /// <summary>
        /// Require manual merge of conflicts
        /// </summary>
        ManualMerge = 3
    }
} 