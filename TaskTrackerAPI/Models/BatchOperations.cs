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

namespace TaskTrackerAPI.Models
{
    /// <summary>
    /// Class representing a batch request
    /// </summary>
    public class BatchRequest
    {
        /// <summary>
        /// List of individual requests in the batch
        /// </summary>
        public List<BatchRequestItem> Requests { get; set; } = new List<BatchRequestItem>();
        
        /// <summary>
        /// Whether the batch should be treated as an atomic operation
        /// (all succeed or all fail)
        /// </summary>
        public bool IsAtomic { get; set; } = false;
    }
    
    /// <summary>
    /// Class representing an individual request in a batch
    /// </summary>
    public class BatchRequestItem
    {
        /// <summary>
        /// Identifier for correlating requests and responses
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        /// <summary>
        /// HTTP method (GET, POST, PUT, DELETE)
        /// </summary>
        public string Method { get; set; } = "GET";
        
        /// <summary>
        /// Relative URL starting with /
        /// </summary>
        public string RelativeUrl { get; set; } = "";
        
        /// <summary>
        /// Request body for POST/PUT requests
        /// </summary>
        public string? Body { get; set; }
    }
    
    /// <summary>
    /// Class representing a response to a batch request item
    /// </summary>
    public class BatchResponse
    {
        /// <summary>
        /// Identifier matching the corresponding request
        /// </summary>
        public string Id { get; set; } = "";
        
        /// <summary>
        /// HTTP status code
        /// </summary>
        public int StatusCode { get; set; }
        
        /// <summary>
        /// Response body
        /// </summary>
        public string Body { get; set; } = "";
        
        /// <summary>
        /// Whether the request was successful (2xx status code)
        /// </summary>
        public bool Success { get; set; }
    }
} 