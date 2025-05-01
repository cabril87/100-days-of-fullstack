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

namespace TaskTrackerAPI.Exceptions
{
    public class ResourceNotFoundException : Exception
    {
        public ResourceNotFoundException(string message) : base(message)
        {
        }
    }

    public class BadRequestException : Exception
    {
        public IDictionary<string, string[]>? Errors { get; }

        public BadRequestException(string message) : base(message)
        {
        }

        public BadRequestException(string message, IDictionary<string, string[]> errors) : base(message)
        {
            Errors = errors;
        }
    }

    public class ValidationException : Exception
    {
        public IDictionary<string, string[]>? Errors { get; }

        public ValidationException(string message) : base(message)
        {
        }

        public ValidationException(string message, IDictionary<string, string[]> errors) : base(message)
        {
            Errors = errors;
        }
    }

    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message) : base(message)
        {
        }
    }

    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message)
        {
        }
    }
} 