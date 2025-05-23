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
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Controllers.V1;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Controller for family activity management
/// </summary>
[Authorize]
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/family/{familyId}/activity")]
public class FamilyActivityController : BaseApiController
{
    private readonly IFamilyActivityService _activityService;
    private readonly IFamilyService _familyService;
    private readonly ILogger<FamilyActivityController> _logger;

    public FamilyActivityController(
        IFamilyActivityService activityService,
        IFamilyService familyService,
        ILogger<FamilyActivityController> logger)
    {
        _activityService = activityService;
        _familyService = familyService;
        _logger = logger;
    }

    /// <summary>
    /// Get all activities for a family with pagination
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="pageNumber">Page number (optional, default 1)</param>
    /// <param name="pageSize">Page size (optional, default 20)</param>
    /// <returns>Paged result of activities</returns>
    [HttpGet]
    [RateLimit(30, 60)]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> GetAll(
        int familyId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            // Validate user is member of the family
            int userId = GetUserId();
            bool isMember = await _familyService.IsFamilyMemberAsync(familyId, userId);
            if (!isMember)
            {
                return ApiUnauthorized<FamilyActivityPagedResultDTO>("You are not a member of this family.");
            }

            // Get activities
            FamilyActivityPagedResultDTO result = await _activityService.GetAllByFamilyIdAsync(familyId, userId, pageNumber, pageSize);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving family activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while retrieving family activities.");
        }
    }

    /// <summary>
    /// Get a specific activity by ID
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="id">ID of the activity</param>
    /// <returns>Activity details</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<FamilyActivityDTO>>> GetById(int familyId, int id)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityDTO? activity = await _activityService.GetByIdAsync(id, userId);

            if (activity == null)
            {
                return ApiNotFound<FamilyActivityDTO>("Activity not found.");
            }

            if (activity.FamilyId != familyId)
            {
                return ApiBadRequest<FamilyActivityDTO>("Activity does not belong to the specified family.");
            }

            return ApiOk(activity);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving family activity");
            return ApiServerError<FamilyActivityDTO>("An error occurred while retrieving the family activity.");
        }
    }

    /// <summary>
    /// Log a new family activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="activityDto">Activity details</param>
    /// <returns>Created activity</returns>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<FamilyActivityDTO>>> Create(
        int familyId, 
        [FromBody] FamilyActivityCreateDTO activityDto)
    {
        try
        {
            if (familyId != activityDto.FamilyId)
            {
                return ApiBadRequest<FamilyActivityDTO>("Family ID in URL does not match Family ID in request body.");
            }


            int userId = GetUserId();
            FamilyActivityDTO? activity = await _activityService.LogActivityAsync(activityDto, userId);
           
            return ApiOk(activity, "Activity logged successfully.");
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating family activity");
            return ApiServerError<FamilyActivityDTO>("An error occurred while creating the family activity.");
        }
    }

    /// <summary>
    /// Get filtered activities
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="filter">Filter criteria</param>
    /// <returns>Filtered activities</returns>
    [HttpPost("filter")]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> Filter(
        int familyId, 
        [FromBody] FamilyActivityFilterDTO filter)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityPagedResultDTO result = await _activityService.GetFilteredAsync(familyId, filter, userId);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error filtering family activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while filtering family activities.");
        }
    }

    /// <summary>
    /// Search activities by term
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="term">Search term</param>
    /// <param name="pageNumber">Page number (optional, default 1)</param>
    /// <param name="pageSize">Page size (optional, default 20)</param>
    /// <returns>Matching activities</returns>
    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> Search(
        int familyId, 
        [FromQuery] string term,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityPagedResultDTO result = await _activityService.SearchAsync(familyId, term, userId, pageNumber, pageSize);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching family activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while searching family activities.");
        }
    }

    /// <summary>
    /// Get activities by actor
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actorId">ID of the actor</param>
    /// <param name="pageNumber">Page number (optional, default 1)</param>
    /// <param name="pageSize">Page size (optional, default 20)</param>
    /// <returns>Activities performed by the actor</returns>
    [HttpGet("by-actor/{actorId}")]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> GetByActor(
        int familyId, 
        int actorId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityPagedResultDTO result = await _activityService.GetByActorIdAsync(familyId, actorId, userId, pageNumber, pageSize);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving actor activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while retrieving actor activities.");
        }
    }

    /// <summary>
    /// Get activities by target
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="targetId">ID of the target</param>
    /// <param name="pageNumber">Page number (optional, default 1)</param>
    /// <param name="pageSize">Page size (optional, default 20)</param>
    /// <returns>Activities targeting the specified user</returns>
    [HttpGet("by-target/{targetId}")]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> GetByTarget(
        int familyId, 
        int targetId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityPagedResultDTO result = await _activityService.GetByTargetIdAsync(familyId, targetId, userId, pageNumber, pageSize);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving target activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while retrieving target activities.");
        }
    }

    /// <summary>
    /// Get activities by action type
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actionType">Type of action</param>
    /// <param name="pageNumber">Page number (optional, default 1)</param>
    /// <param name="pageSize">Page size (optional, default 20)</param>
    /// <returns>Activities of the specified type</returns>
    [HttpGet("by-action/{actionType}")]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> GetByActionType(
        int familyId, 
        string actionType,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityPagedResultDTO result = await _activityService.GetByActionTypeAsync(familyId, actionType, userId, pageNumber, pageSize);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving action type activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while retrieving action type activities.");
        }
    }

    /// <summary>
    /// Get activities related to a specific entity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="entityType">Type of entity</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="pageNumber">Page number (optional, default 1)</param>
    /// <param name="pageSize">Page size (optional, default 20)</param>
    /// <returns>Activities related to the entity</returns>
    [HttpGet("by-entity/{entityType}/{entityId}")]
    public async Task<ActionResult<ApiResponse<FamilyActivityPagedResultDTO>>> GetByEntity(
        int familyId, 
        string entityType,
        int entityId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            int userId = GetUserId();
            FamilyActivityPagedResultDTO result = await _activityService.GetByEntityAsync(familyId, entityType, entityId, userId, pageNumber, pageSize);
            return ApiOk(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return ApiUnauthorized<FamilyActivityPagedResultDTO>(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving entity activities");
            return ApiServerError<FamilyActivityPagedResultDTO>("An error occurred while retrieving entity activities.");
        }
    }
} 