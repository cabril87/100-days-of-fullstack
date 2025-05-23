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
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyActivityService
{
    /// <summary>
    /// Logs a family activity
    /// </summary>
    /// <param name="createDto">Activity details</param>
    /// <param name="userId">ID of the user creating the activity</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogActivityAsync(FamilyActivityCreateDTO createDto, int userId);
    
    /// <summary>
    /// Gets an activity by ID
    /// </summary>
    /// <param name="id">Activity ID</param>
    /// <param name="userId">ID of the user requesting the activity</param>
    /// <returns>Activity details</returns>
    Task<FamilyActivityDTO?> GetByIdAsync(int id, int userId);
    
    /// <summary>
    /// Gets all activities for a family with pagination
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetAllByFamilyIdAsync(
        int familyId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets filtered activities for a family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="filter">Filter criteria</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetFilteredAsync(
        int familyId, 
        FamilyActivityFilterDTO filter, 
        int userId);
        
    /// <summary>
    /// Searches activities with the given search term
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="searchTerm">Search term to match in descriptions</param>
    /// <param name="userId">ID of the user performing the search</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of matching activities</returns>
    Task<FamilyActivityPagedResultDTO> SearchAsync(
        int familyId, 
        string searchTerm, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by actor ID (who performed the action)
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actorId">ID of the actor</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByActorIdAsync(
        int familyId, 
        int actorId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by target ID (who was affected by the action)
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="targetId">ID of the target</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByTargetIdAsync(
        int familyId, 
        int targetId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by action type
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actionType">Type of action</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByActionTypeAsync(
        int familyId, 
        string actionType, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities related to a specific entity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="entityType">Type of entity</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByEntityAsync(
        int familyId, 
        string entityType, 
        int entityId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
} 