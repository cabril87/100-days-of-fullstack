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
using TaskTrackerAPI.DTOs.Family;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Services.Interfaces;

/// <summary>
/// Service for family data seeding (Admin only functionality)
/// </summary>
public interface IFamilySeedingService
{
    /// <summary>
    /// Seed a family with test data based on scenario
    /// </summary>
    /// <param name="request">Seeding request with scenario and options</param>
    /// <param name="adminUserId">ID of the admin user requesting the seed</param>
    /// <returns>Seeding result with created family and member information</returns>
    Task<FamilySeedingResponseDTO> SeedFamilyAsync(FamilySeedingRequestDTO request, int adminUserId);
    
    /// <summary>
    /// Get available family scenarios for seeding
    /// </summary>
    /// <returns>List of available scenarios with descriptions</returns>
    Task<List<FamilyScenarioInfoDTO>> GetAvailableScenariosAsync();
    
    /// <summary>
    /// Clear all test family data
    /// </summary>
    /// <param name="adminUserId">ID of the admin user requesting the clear</param>
    /// <returns>Number of families cleared</returns>
    Task<int> ClearTestFamiliesAsync(int adminUserId);
    
    /// <summary>
    /// Get test families created by seeding
    /// </summary>
    /// <param name="adminUserId">ID of the admin user</param>
    /// <returns>List of test families</returns>
    Task<List<FamilyDTO>> GetTestFamiliesAsync(int adminUserId);
} 