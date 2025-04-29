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

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service for accessing information about the current authenticated user
    /// </summary>
    public interface IUserAccessor
    {
        /// <summary>
        /// Gets the user ID of the currently authenticated user
        /// </summary>
        /// <returns>The user ID as a string</returns>
        string GetCurrentUserId();
    }
} 