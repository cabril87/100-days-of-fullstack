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
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Provides security verification services for API endpoints
    /// </summary>
    public class SecurityService : ISecurityService
    {
        private readonly ISecurityRepository _securityRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<SecurityService> _logger;

        public SecurityService(
            ISecurityRepository securityRepository,
            IHttpContextAccessor httpContextAccessor,
            ILogger<SecurityService> logger)
        {
            _securityRepository = securityRepository ?? throw new ArgumentNullException(nameof(securityRepository));
            _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Verifies if the current user owns the specified resource
        /// </summary>
        /// <param name="resourceType">Type of resource to check</param>
        /// <param name="resourceId">ID of the resource to check</param>
        /// <returns>True if the user owns the resource, false otherwise</returns>
        public async Task<bool> VerifyResourceOwnershipAsync(ResourceType resourceType, int resourceId)
        {
            // Get the current user ID
            if (!TryGetCurrentUserId(out int userId))
            {
                _logger.LogWarning("Cannot verify resource ownership: No authenticated user");
                return false;
            }

            try
            {
                // Use the repository's generic method for resource ownership verification
                return await _securityRepository.VerifyResourceOwnershipAsync(resourceType, resourceId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying resource ownership for {ResourceType}:{ResourceId}", 
                    resourceType, resourceId);
                return false;
            }
        }

        /// <summary>
        /// Checks if a user has the required permissions for an operation
        /// </summary>
        /// <param name="requiredPermissions">List of permissions required</param>
        /// <returns>True if the user has all required permissions</returns>
        public bool VerifyPermissions(string[] requiredPermissions)
        {
            if (requiredPermissions == null || requiredPermissions.Length == 0)
            {
                return true;
            }

            // Admin role gets all permissions
            if (_httpContextAccessor.HttpContext?.User?.IsInRole("Admin") == true)
            {
                return true;
            }

            // Get user claims
            ClaimsPrincipal? userPrincipal = _httpContextAccessor.HttpContext?.User;
            if (userPrincipal == null)
            {
                return false;
            }

            // Get permissions from claims
            List<string> permissionClaims = userPrincipal.Claims
                .Where(c => c.Type == "permission")
                .Select(c => c.Value)
                .ToList();

            // Check if the user has all required permissions
            foreach (string requiredPermission in requiredPermissions)
            {
                if (!permissionClaims.Contains(requiredPermission))
                {
                    return false;
                }
            }
            
            return true;
        }

        /// <summary>
        /// Checks if a user has the necessary family role
        /// </summary>
        /// <param name="familyId">ID of the family</param>
        /// <param name="requiredRole">Required role in the family</param>
        /// <returns>True if the user has the required role</returns>
        public async Task<bool> VerifyFamilyRoleAsync(int familyId, string requiredRole)
        {
            if (!TryGetCurrentUserId(out int userId))
            {
                return false;
            }

            try
            {
                FamilyMember? member = await _securityRepository.GetFamilyMemberRoleAsync(familyId, userId);

                if (member == null || member.Role == null)
                {
                    return false;
                }

                // Check if the required role matches
                if (string.Equals(member.Role.Name, requiredRole, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                // Check if there's a hierarchy (e.g., Admin can do anything)
                if (!string.Equals(requiredRole, "Admin", StringComparison.OrdinalIgnoreCase) && 
                    string.Equals(member.Role.Name, "Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying family role for family {FamilyId}", familyId);
                return false;
            }
        }

        /// <summary>
        /// Checks if a user has ownership or admin status for a specific resource
        /// </summary>
        /// <param name="resourceType">Type of resource to check</param>
        /// <param name="resourceId">ID of the resource</param>
        /// <returns>True if user has sufficient access rights</returns>
        public async Task<bool> VerifyOwnershipOrAdminAsync(ResourceType resourceType, int resourceId)
        {
            // Admin users have access to all resources
            if (_httpContextAccessor.HttpContext?.User?.IsInRole("Admin") == true)
            {
                return true;
            }

            // Check for direct ownership
            return await VerifyResourceOwnershipAsync(resourceType, resourceId);
        }

        /// <summary>
        /// Gets the current user ID from claims
        /// </summary>
        /// <param name="userId">Output user ID if successful</param>
        /// <returns>True if user ID was retrieved successfully</returns>
        private bool TryGetCurrentUserId(out int userId)
        {
            userId = 0;
            
            string? userIdString = _httpContextAccessor.HttpContext?.User?
                .FindFirstValue(ClaimTypes.NameIdentifier);
                
            if (string.IsNullOrEmpty(userIdString))
            {
                return false;
            }
            
            return int.TryParse(userIdString, out userId);
        }
    }
} 