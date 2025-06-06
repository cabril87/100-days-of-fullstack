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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service interface for admin operations
    /// </summary>
    public interface IAdminService
    {
        /// <summary>
        /// Creates a new user with optional family assignment (Admin only)
        /// </summary>
        /// <param name="adminUserId">ID of the admin creating the user</param>
        /// <param name="userCreateDto">User creation data</param>
        /// <returns>Created user with family assignment info</returns>
        Task<AdminUserCreateResponseDTO> CreateUserWithFamilyAssignmentAsync(int adminUserId, AdminUserCreateDTO userCreateDto);

        /// <summary>
        /// Gets all families that the admin has access to (Admin only)
        /// </summary>
        /// <param name="adminUserId">ID of the admin</param>
        /// <returns>List of families for selection</returns>
        Task<List<AdminFamilySelectionDTO>> GetAdminAccessibleFamiliesAsync(int adminUserId);

        /// <summary>
        /// Gets all available family roles for assignment
        /// </summary>
        /// <returns>List of family roles</returns>
        Task<List<FamilyRoleDTO>> GetFamilyRolesAsync();
    }
} 