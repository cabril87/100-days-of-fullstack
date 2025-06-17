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
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Models.Analytics;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service implementation for managing saved analytics filters
    /// </summary>
    public class SavedFilterService : ISavedFilterService
    {
        private readonly ISavedFilterRepository _repository;
        private readonly IUnifiedAnalyticsService _analyticsService;
        private readonly IMapper _mapper;
        private readonly ILogger<SavedFilterService> _logger;

        public SavedFilterService(
            ISavedFilterRepository repository,
            IUnifiedAnalyticsService analyticsService,
            IMapper mapper,
            ILogger<SavedFilterService> logger)
        {
            _repository = repository;
            _analyticsService = analyticsService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<SavedFilterDTO>> GetUserFiltersAsync(int userId)
        {
            try
            {
                var filters = await _repository.GetUserFiltersAsync(userId);
                return _mapper.Map<IEnumerable<SavedFilterDTO>>(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user filters for user {UserId}", userId);
                throw;
            }
        }

        public async Task<SavedFilterDTO?> GetFilterByIdAsync(int id, int userId)
        {
            try
            {
                var filter = await _repository.GetByIdAsync(id);
                
                // Check if user has access to this filter
                if (filter == null || (filter.UserId != userId && !filter.IsPublic))
                {
                    return null;
                }

                return _mapper.Map<SavedFilterDTO>(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting filter {FilterId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<SavedFilterDTO> CreateFilterAsync(CreateSavedFilterDTO createDto, int userId)
        {
            try
            {
                // Check if filter name already exists for user
                if (await _repository.ExistsAsync(userId, createDto.Name))
                {
                    throw new InvalidOperationException($"Filter with name '{createDto.Name}' already exists");
                }

                // Validate filter criteria
                if (!await ValidateFilterCriteriaAsync(createDto.FilterCriteria))
                {
                    throw new ArgumentException("Invalid filter criteria");
                }

                var filter = _mapper.Map<SavedFilter>(createDto);
                filter.UserId = userId;

                var createdFilter = await _repository.CreateAsync(filter);
                return _mapper.Map<SavedFilterDTO>(createdFilter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating filter for user {UserId}", userId);
                throw;
            }
        }

        public async Task<SavedFilterDTO> UpdateFilterAsync(int id, UpdateSavedFilterDTO updateDto, int userId)
        {
            try
            {
                var existingFilter = await _repository.GetByIdAsync(id);
                if (existingFilter == null || existingFilter.UserId != userId)
                {
                    throw new UnauthorizedAccessException("Filter not found or access denied");
                }

                // Check if new name conflicts with existing filters
                if (!string.IsNullOrEmpty(updateDto.Name) && 
                    updateDto.Name != existingFilter.Name &&
                    await _repository.ExistsAsync(userId, updateDto.Name))
                {
                    throw new InvalidOperationException($"Filter with name '{updateDto.Name}' already exists");
                }

                // Validate criteria if provided
                if (!string.IsNullOrEmpty(updateDto.FilterCriteria) && 
                    !await ValidateFilterCriteriaAsync(updateDto.FilterCriteria))
                {
                    throw new ArgumentException("Invalid filter criteria");
                }

                _mapper.Map(updateDto, existingFilter);
                var updatedFilter = await _repository.UpdateAsync(existingFilter);
                return _mapper.Map<SavedFilterDTO>(updatedFilter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating filter {FilterId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<bool> DeleteFilterAsync(int id, int userId)
        {
            try
            {
                var filter = await _repository.GetByIdAsync(id);
                if (filter == null || filter.UserId != userId)
                {
                    return false;
                }

                return await _repository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting filter {FilterId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<IEnumerable<SavedFilterDTO>> GetPublicFiltersAsync()
        {
            try
            {
                var filters = await _repository.GetPublicFiltersAsync();
                return _mapper.Map<IEnumerable<SavedFilterDTO>>(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public filters");
                throw;
            }
        }

        public async Task<IEnumerable<SavedFilterDTO>> GetSharedFiltersAsync(int userId)
        {
            try
            {
                var filters = await _repository.GetSharedFiltersAsync(userId);
                return _mapper.Map<IEnumerable<SavedFilterDTO>>(filters);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting shared filters for user {UserId}", userId);
                throw;
            }
        }

        public Task<bool> ValidateFilterCriteriaAsync(string criteria)
        {
            try
            {
                // Basic JSON validation
                if (string.IsNullOrWhiteSpace(criteria))
                    return Task.FromResult(false);

                // Try to parse as JSON
                var jsonDocument = JsonDocument.Parse(criteria);
                
                // Additional validation logic could be added here
                // For example, checking for required fields, valid operators, etc.
                
                return Task.FromResult(true);
            }
            catch (JsonException)
            {
                return Task.FromResult(false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating filter criteria");
                return Task.FromResult(false);
            }
        }

        public async Task<object> ExecuteFilterAsync(int filterId, int userId)
        {
            try
            {
                var filter = await GetFilterByIdAsync(filterId, userId);
                if (filter == null)
                {
                    throw new UnauthorizedAccessException("Filter not found or access denied");
                }

                // Parse filter criteria
                var criteria = JsonDocument.Parse(filter.FilterCriteria);
                
                // Extract date range from criteria
                DateTime? startDate = null;
                DateTime? endDate = null;
                
                if (criteria.RootElement.TryGetProperty("dateRange", out var dateRangeElement))
                {
                    if (dateRangeElement.TryGetProperty("start", out var startElement))
                    {
                        DateTime.TryParse(startElement.GetString(), out var start);
                        startDate = start;
                    }
                    
                    if (dateRangeElement.TryGetProperty("end", out var endElement))
                    {
                        DateTime.TryParse(endElement.GetString(), out var end);
                        endDate = end;
                    }
                }

                // Execute analytics based on filter type
                return filter.QueryType switch
                {
                    "advanced" => await _analyticsService.GetUserAnalyticsDashboardAsync(userId, startDate, endDate),
                    "trends" => await _analyticsService.GetUserProductivityInsightsAsync(userId),
                    "productivity" => await _analyticsService.GetUserProductivityInsightsAsync(userId),
                    "time" => await _analyticsService.GetUserProductivityInsightsAsync(userId),
                    "category" => await _analyticsService.GetUserAnalyticsDashboardAsync(userId, startDate, endDate),
                    _ => await _analyticsService.GetUserAnalyticsDashboardAsync(userId, startDate, endDate)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing filter {FilterId} for user {UserId}", filterId, userId);
                throw;
            }
        }
    }
} 