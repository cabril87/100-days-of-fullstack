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
using System.Threading.Tasks;
using TaskTrackerAPI.Attributes;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Interface for security verification services
    /// </summary>
    public interface ISecurityService
    {
        /// <summary>
        /// Verifies if the current user owns the specified resource
        /// </summary>
        /// <param name="resourceType">Type of resource to check</param>
        /// <param name="resourceId">ID of the resource to check</param>
        /// <returns>True if the user owns the resource, false otherwise</returns>
        Task<bool> VerifyResourceOwnershipAsync(ResourceType resourceType, int resourceId);

        /// <summary>
        /// Checks if a user has the required permissions for an operation
        /// </summary>
        /// <param name="requiredPermissions">List of permissions required</param>
        /// <returns>True if the user has all required permissions</returns>
        bool VerifyPermissions(string[] requiredPermissions);

        /// <summary>
        /// Checks if a user has the necessary family role
        /// </summary>
        /// <param name="familyId">ID of the family</param>
        /// <param name="requiredRole">Required role in the family</param>
        /// <returns>True if the user has the required role</returns>
        Task<bool> VerifyFamilyRoleAsync(int familyId, string requiredRole);

        /// <summary>
        /// Checks if a user has ownership or admin status for a specific resource
        /// </summary>
        /// <param name="resourceType">Type of resource to check</param>
        /// <param name="resourceId">ID of the resource</param>
        /// <returns>True if user has sufficient access rights</returns>
        Task<bool> VerifyOwnershipOrAdminAsync(ResourceType resourceType, int resourceId);
    }
} 