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
    
    /// Exception thrown when a security violation is detected
    
    public class SecurityException : Exception
    {
        public SecurityException() : base() { }

        public SecurityException(string message) : base(message) { }

        public SecurityException(string message, Exception innerException) : base(message, innerException) { }
    }
} 