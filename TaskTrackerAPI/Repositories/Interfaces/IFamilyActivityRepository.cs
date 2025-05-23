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
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

/// <summary>
/// Interface for family activity repository operations
/// </summary>
public interface IFamilyActivityRepository
{
    /// <summary>
    /// Get all family activities for a specific family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <returns>List of family activities</returns>
    Task<IEnumerable<FamilyActivity>> GetAllByFamilyIdAsync(int familyId);
    
    /// <summary>
    /// Gets a specific family activity by ID
    /// </summary>
    /// <param name="id">Activity ID</param>
    /// <returns>Family activity or null if not found</returns>
    Task<FamilyActivity?> GetByIdAsync(int id);
    
    /// <summary>
    /// Creates a new family activity record
    /// </summary>
    /// <param name="activity">Family activity to create</param>
    /// <returns>The created family activity</returns>
    Task<FamilyActivity> CreateAsync(FamilyActivity activity);
    
    /// <summary>
    /// Get filtered and paginated family activities
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="filter">Filter criteria</param>
    /// <returns>Paginated result with family activities</returns>
    Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetFilteredAsync(
        int familyId, 
        FamilyActivityFilterDTO filter);
    
    /// <summary>
    /// Search activities with given search term in descriptions
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="searchTerm">The search term to look for</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Matching activities</returns>
    Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> SearchAsync(
        int familyId,
        string searchTerm,
        int pageNumber = 1,
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities performed by a specific user
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Activities performed by the user</returns>
    Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByActorIdAsync(
        int familyId,
        int userId,
        int pageNumber = 1,
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities targeting a specific user
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the target user</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Activities targeting the user</returns>
    Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByTargetIdAsync(
        int familyId,
        int userId,
        int pageNumber = 1,
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by action type
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actionType">Type of action</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Activities of specified action type</returns>
    Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByActionTypeAsync(
        int familyId,
        string actionType,
        int pageNumber = 1,
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities related to a specific entity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="entityType">Type of entity</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Activities related to the entity</returns>
    Task<(IEnumerable<FamilyActivity> Activities, int TotalCount)> GetByEntityAsync(
        int familyId,
        string entityType,
        int entityId,
        int pageNumber = 1,
        int pageSize = 20);
} 