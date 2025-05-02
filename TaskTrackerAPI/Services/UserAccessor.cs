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
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service to access current user information from the HTTP context
    /// </summary>
    public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Gets the current user ID from the HTTP context
        /// </summary>
        /// <returns>The current user ID as a string</returns>
        public string GetCurrentUserId()
        {
            string? userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }
            
            return userId;
        }
    }
} 