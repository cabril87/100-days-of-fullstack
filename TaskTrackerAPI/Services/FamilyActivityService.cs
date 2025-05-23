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
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for managing family activities
/// </summary>
public class FamilyActivityService : IFamilyActivityService
{
    private readonly IFamilyActivityRepository _activityRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyActivityService> _logger;

    public FamilyActivityService(
        IFamilyActivityRepository activityRepository,
        IFamilyRepository familyRepository,
        IMapper mapper,
        ILogger<FamilyActivityService> logger)
    {
        _activityRepository = activityRepository;
        _familyRepository = familyRepository;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<FamilyActivityDTO> LogActivityAsync(FamilyActivityCreateDTO createDto, int userId)
    {
        // Verify the user is a member of the family
        bool isMember = await _familyRepository.IsMemberAsync(createDto.FamilyId, userId);
        if (!isMember && createDto.ActorId != userId)
        {
            throw new UnauthorizedAccessException("You do not have permission to log activities for this family.");
        }

        // Convert metadata dictionary to JSON string if it exists
        string? metadataJson = null;
        if (createDto.Metadata != null)
        {
            metadataJson = JsonSerializer.Serialize(createDto.Metadata);
        }

        // Create the activity entity
        FamilyActivity activity = new FamilyActivity
        {
            FamilyId = createDto.FamilyId,
            ActorId = createDto.ActorId,
            TargetId = createDto.TargetId,
            ActionType = createDto.ActionType,
            Description = createDto.Description,
            EntityType = createDto.EntityType,
            EntityId = createDto.EntityId,
            Timestamp = DateTime.UtcNow,
            Metadata = metadataJson
        };

        // Save the activity
        FamilyActivity createdActivity = await _activityRepository.CreateAsync(activity);

        // Map back to DTO
        FamilyActivityDTO result = _mapper.Map<FamilyActivityDTO>(createdActivity);

        // Convert metadata JSON back to dictionary if it exists
        if (!string.IsNullOrEmpty(createdActivity.Metadata))
        {
            try
            {
                result.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(createdActivity.Metadata);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", createdActivity.Id);
                result.Metadata = null;
            }
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<FamilyActivityDTO?> GetByIdAsync(int id, int userId)
    {
        // Get the activity
        FamilyActivity? activity = await _activityRepository.GetByIdAsync(id);
        if (activity == null)
        {
            return null;
        }

        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(activity.FamilyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view this activity.");
        }

        // Map to DTO
        FamilyActivityDTO result = _mapper.Map<FamilyActivityDTO>(activity);

        // Process metadata
        if (!string.IsNullOrEmpty(activity.Metadata))
        {
            try
            {
                result.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(activity.Metadata);
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", activity.Id);
                result.Metadata = null;
            }
        }

        return result;
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> GetAllByFamilyIdAsync(
        int familyId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view activities for this family.");
        }

        // Create filter for pagination
        FamilyActivityFilterDTO filter = new FamilyActivityFilterDTO
        {
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.GetFilteredAsync(familyId, filter);

        // Map to DTOs and process metadata
        List<FamilyActivityDTO> activityDtos = activities.Select(a => 
        {
            FamilyActivityDTO dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> GetFilteredAsync(
        int familyId, 
        FamilyActivityFilterDTO filter, 
        int userId)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view activities for this family.");
        }

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.GetFilteredAsync(familyId, filter);

        // Map to DTOs and process metadata
        List<FamilyActivityDTO> activityDtos = activities.Select(a => 
        {
            FamilyActivityDTO dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize
        };
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> SearchAsync(
        int familyId, 
        string searchTerm, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to search activities for this family.");
        }

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.SearchAsync(
            familyId, 
            searchTerm,
            pageNumber,
            pageSize);

        // Map to DTOs and process metadata
        List<FamilyActivityDTO> activityDtos = activities.Select(a => 
        {
            FamilyActivityDTO dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> GetByActorIdAsync(
        int familyId, 
        int actorId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view activities for this family.");
        }

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.GetByActorIdAsync(
            familyId, 
            actorId,
            pageNumber,
            pageSize);

        // Map to DTOs and process metadata
        List<FamilyActivityDTO> activityDtos = activities.Select(a => 
        {
            FamilyActivityDTO dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> GetByTargetIdAsync(
        int familyId, 
        int targetId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view activities for this family.");
        }

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.GetByTargetIdAsync(
            familyId, 
            targetId,
            pageNumber,
            pageSize);

        // Map to DTOs and process metadata
        List<FamilyActivityDTO> activityDtos = activities.Select(a => 
        {
            FamilyActivityDTO dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> GetByActionTypeAsync(
        int familyId, 
        string actionType, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view activities for this family.");
        }

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.GetByActionTypeAsync(
            familyId, 
            actionType,
            pageNumber,
            pageSize);

        // Map to DTOs and process metadata
        List<FamilyActivityDTO> activityDtos = activities.Select(a => 
        {
            FamilyActivityDTO dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    /// <inheritdoc />
    public async Task<FamilyActivityPagedResultDTO> GetByEntityAsync(
        int familyId, 
        string entityType, 
        int entityId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20)
    {
        // Check permissions
        bool isMember = await _familyRepository.IsMemberAsync(familyId, userId);
        if (!isMember)
        {
            throw new UnauthorizedAccessException("You do not have permission to view activities for this family.");
        }

        // Get activities
        (IEnumerable<FamilyActivity> activities, int totalCount) = await _activityRepository.GetByEntityAsync(
            familyId, 
            entityType,
            entityId,
            pageNumber,
            pageSize);

        // Map to DTOs and process metadata
        var activityDtos = activities.Select(a => 
        {
            var dto = _mapper.Map<FamilyActivityDTO>(a);
            
            if (!string.IsNullOrEmpty(a.Metadata))
            {
                try
                {
                    dto.Metadata = JsonSerializer.Deserialize<Dictionary<string, object>>(a.Metadata);
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing metadata for activity {ActivityId}", a.Id);
                }
            }
            
            return dto;
        }).ToList();

        // Create paged result
        return new FamilyActivityPagedResultDTO
        {
            Activities = activityDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
} 