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

namespace TaskTrackerAPI.Exceptions
{
    /// <summary>
    /// Exception thrown when a requested resource is not found
    /// </summary>
    public class NotFoundException : Exception
    {
        /// <summary>
        /// Creates a new instance of the NotFoundException class
        /// </summary>
        public NotFoundException() : base("The requested resource was not found.")
        {
        }

        /// <summary>
        /// Creates a new instance of the NotFoundException class with a specific message
        /// </summary>
        /// <param name="message">The error message</param>
        public NotFoundException(string message) : base(message)
        {
        }

        /// <summary>
        /// Creates a new instance of the NotFoundException class with a specific message and inner exception
        /// </summary>
        /// <param name="message">The error message</param>
        /// <param name="innerException">The inner exception</param>
        public NotFoundException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
} 