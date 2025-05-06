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

namespace TaskTrackerAPI.DTOs.ModalContext
{
    /// <summary>
    /// DTO for transaction log entries in the Modal Context Protocol
    /// </summary>
    public class TransactionLogDTO
    {
        /// <summary>
        /// Unique identifier for the transaction
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Type of entity involved in the transaction
        /// </summary>
        public string EntityType { get; set; } = string.Empty;
        
        /// <summary>
        /// ID of the entity involved in the transaction
        /// </summary>
        public int EntityId { get; set; }
        
        /// <summary>
        /// Previous state of the entity
        /// </summary>
        public string FromState { get; set; } = string.Empty;
        
        /// <summary>
        /// New state of the entity after the transition
        /// </summary>
        public string ToState { get; set; } = string.Empty;
        
        /// <summary>
        /// User who initiated the state transition
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// Username of the user who initiated the transition (for display purposes)
        /// </summary>
        public string Username { get; set; } = string.Empty;
        
        /// <summary>
        /// Timestamp when the transition occurred
        /// </summary>
        public DateTime Timestamp { get; set; }
        
        /// <summary>
        /// Indicates if the transition was successful
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// Reason for failure if the transition was not successful
        /// </summary>
        public string? FailureReason { get; set; }
        
        /// <summary>
        /// Additional metadata about the transition
        /// </summary>
        public Dictionary<string, object>? Metadata { get; set; }
        
        /// <summary>
        /// Duration of the transition in milliseconds
        /// </summary>
        public long? DurationMs { get; set; }
        
        /// <summary>
        /// Unique transaction ID for distributed operations
        /// </summary>
        public string? TransactionId { get; set; }
    }
} 