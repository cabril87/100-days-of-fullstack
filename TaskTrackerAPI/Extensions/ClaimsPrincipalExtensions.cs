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

namespace TaskTrackerAPI.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        /// Gets the user ID from claims as a string
        public static string? GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        /// Gets the user ID from claims as an integer
   
        public static int GetUserIdAsInt(this ClaimsPrincipal user)
        {
            string? userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                throw new InvalidOperationException("User ID claim not found");
            }

            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }
            
            throw new InvalidOperationException("User ID is not a valid integer");
        }

        /// <summary>
        /// Tries to get the user ID as an integer without throwing exceptions
        /// </summary>
        /// <param name="user">The ClaimsPrincipal to extract the ID from</param>
        /// <param name="userId">The output user ID if successful</param>
        /// <returns>True if the user ID was successfully retrieved, false otherwise</returns>
        public static bool TryGetUserIdAsInt(this ClaimsPrincipal user, out int userId)
        {
            userId = 0;
            string? userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdString))
            {
                return false;
            }

            return int.TryParse(userIdString, out userId);
        }

        /// Checks if the principal has the specified role
        public static bool IsInRole(this ClaimsPrincipal user, string role)
        {
            return user.HasClaim(ClaimTypes.Role, role);
        }
    }
} 