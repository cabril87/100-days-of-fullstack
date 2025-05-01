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
using TaskTrackerAPI.DTOs.Tasks;

namespace TaskTrackerAPI.Exceptions
{
    /// <summary>
    /// Exception thrown when a concurrency conflict is detected
    /// </summary>
    public class ConcurrencyException : Exception
    {
        /// <summary>
        /// Details about the conflict
        /// </summary>
        public TaskConflictDTO Conflict { get; }

        /// <summary>
        /// Creates a new instance of the ConcurrencyException class
        /// </summary>
        /// <param name="message">The error message</param>
        /// <param name="conflict">The conflict details</param>
        public ConcurrencyException(string message, TaskConflictDTO conflict) 
            : base(message)
        {
            Conflict = conflict;
        }

        /// <summary>
        /// Creates a new instance of the ConcurrencyException class
        /// </summary>
        /// <param name="message">The error message</param>
        /// <param name="conflict">The conflict details</param>
        /// <param name="innerException">The inner exception</param>
        public ConcurrencyException(string message, TaskConflictDTO conflict, Exception innerException) 
            : base(message, innerException)
        {
            Conflict = conflict;
        }
    }
} 