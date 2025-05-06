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
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Represents a transaction log entry for the Modal Context Protocol
    /// Used to track state transitions across the system
    /// </summary>
    public class TransactionLog
    {
        /// <summary>
        /// Unique identifier for the transaction log entry
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Type of entity being tracked (e.g., "task", "reminder", "family", etc.)
        /// </summary>
        public string EntityType { get; set; } = string.Empty;
        
        /// <summary>
        /// Identifier of the entity being tracked
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
        /// Timestamp when the transition occurred
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Indicates if the transition was successful
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// Reason for failure if the transition was not successful
        /// </summary>
        public string FailureReason { get; set; } = string.Empty;
        
        /// <summary>
        /// Additional metadata about the transition stored as JSON
        /// </summary>
        public string MetadataJson { get; set; } = string.Empty;
        
        /// <summary>
        /// Duration of the transition in milliseconds (for performance tracking)
        /// </summary>
        public long? DurationMs { get; set; }
        
        /// <summary>
        /// Version number for optimistic concurrency
        /// </summary>
        public long Version { get; set; }
        
        /// <summary>
        /// Tenant ID for multi-tenant isolation
        /// </summary>
        public int TenantId { get; set; }
        
        /// <summary>
        /// Indicates if this transaction has been processed by analytics
        /// </summary>
        public bool ProcessedForAnalytics { get; set; }
        
        /// <summary>
        /// Unique transaction ID for distributed operations
        /// </summary>
        public string TransactionId { get; set; } = string.Empty;
        
        /// <summary>
        /// Parent transaction ID for nested operations
        /// </summary>
        public string ParentTransactionId { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets metadata as a typed dictionary
        /// </summary>
        [JsonIgnore]
        public Dictionary<string, object> Metadata 
        { 
            get
            {
                if (string.IsNullOrEmpty(MetadataJson))
                    return new Dictionary<string, object>();
                    
                try
                {
                    var result = JsonSerializer.Deserialize<Dictionary<string, object>>(MetadataJson);
                    return result ?? new Dictionary<string, object>();
                }
                catch
                {
                    return new Dictionary<string, object>();
                }
            }
            set
            {
                MetadataJson = JsonSerializer.Serialize(value);
            }
        }
    }
} 