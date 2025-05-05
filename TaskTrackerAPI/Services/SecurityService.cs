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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Provides security verification services for API endpoints
    /// </summary>
    public class SecurityService : ISecurityService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<SecurityService> _logger;

        public SecurityService(
            ApplicationDbContext dbContext,
            IHttpContextAccessor httpContextAccessor,
            ILogger<SecurityService> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
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
                switch (resourceType)
                {
                    case ResourceType.Task:
                        return await _dbContext.Tasks
                            .AnyAsync(t => t.Id == resourceId && t.UserId == userId);
                    
                    case ResourceType.Category:
                        return await _dbContext.Categories
                            .AnyAsync(c => c.Id == resourceId && c.UserId == userId);
                    
                    case ResourceType.Tag:
                        return await _dbContext.Tags
                            .AnyAsync(t => t.Id == resourceId && t.UserId == userId);
                    
                    case ResourceType.User:
                        // Users can only access their own user resources
                        return userId == resourceId;
                    
                    case ResourceType.Family:
                        // Check if the user is a member of the family
                        return await _dbContext.FamilyMembers
                            .AnyAsync(fm => fm.FamilyId == resourceId && fm.UserId == userId);
                    
                    case ResourceType.FamilyMember:
                        // Check if this is the user's own family member entry
                        FamilyMember? memberEntry = await _dbContext.FamilyMembers
                            .FirstOrDefaultAsync(fm => fm.Id == resourceId);
                        return memberEntry != null && memberEntry.UserId == userId;
                    
                    case ResourceType.Invitation:
                        // Check if the user created the invitation
                        Invitation? invitationEntity = await _dbContext.Invitations
                            .FirstOrDefaultAsync(i => i.Id == resourceId);
                        return invitationEntity != null && 
                               await _dbContext.FamilyMembers
                                   .AnyAsync(fm => fm.FamilyId == invitationEntity.FamilyId && 
                                                 fm.UserId == userId && 
                                                 string.Equals(fm.Role.Name, "Admin", StringComparison.OrdinalIgnoreCase));
                    
                    case ResourceType.Reminder:
                        return await _dbContext.Reminders
                            .AnyAsync(r => r.Id == resourceId && r.UserId == userId);
                    
                    case ResourceType.Notification:
                        return await _dbContext.Notifications
                            .AnyAsync(n => n.Id == resourceId && n.UserId == userId);
                    
                    case ResourceType.Achievement:
                        // For user-specific achievements
                        return await _dbContext.UserAchievements
                            .AnyAsync(ua => ua.Id == resourceId && ua.UserId == userId);
                    
                    case ResourceType.Focus:
                        return await _dbContext.FocusSessions
                            .AnyAsync(f => f.Id == resourceId && f.UserId == userId);
                    
                    case ResourceType.Board:
                        return await _dbContext.Boards
                            .AnyAsync(b => b.Id == resourceId && b.UserId == userId);
                    
                    default:
                        _logger.LogWarning("Unhandled resource type: {ResourceType}", resourceType);
                        return false;
                }
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
                FamilyMember? member = await _dbContext.FamilyMembers
                    .Include(fm => fm.Role)
                    .FirstOrDefaultAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);

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