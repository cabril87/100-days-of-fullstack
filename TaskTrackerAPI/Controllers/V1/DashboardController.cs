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

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Models.Analytics;
using TaskTrackerAPI.Attributes;
using Microsoft.Extensions.Logging;
using AutoMapper;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [SecurityRequirements(SecurityRequirementLevel.Authenticated)]
    public class DashboardController : BaseApiController
    {
        private readonly IDashboardWidgetRepository _widgetRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            IDashboardWidgetRepository widgetRepository,
            IMapper mapper,
            ILogger<DashboardController> logger)
        {
            _widgetRepository = widgetRepository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard configuration for the current user
        /// </summary>
        /// <returns>Dashboard configuration</returns>
        [HttpGet]
        public async Task<IActionResult> GetDashboardConfig()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                IEnumerable<DashboardWidget> widgets = await _widgetRepository.GetUserWidgetsAsync(userId);
                IEnumerable<WidgetConfigDTO> widgetDtos = _mapper.Map<IEnumerable<WidgetConfigDTO>>(widgets);

                DashboardConfigDTO config = new DashboardConfigDTO
                {
                    Widgets = widgetDtos.ToList(),
                    Layout = new DashboardLayoutDTO(),
                    Preferences = new DashboardPreferencesDTO(),
                    SharedSettings = new SharedSettingsDTO()
                };

                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard configuration");
                return StatusCode(500, "An error occurred while retrieving dashboard configuration.");
            }
        }

        /// <summary>
        /// Get all widgets for the current user
        /// </summary>
        /// <returns>List of widgets</returns>
        [HttpGet("widgets")]
        public async Task<IActionResult> GetUserWidgets()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                IEnumerable<DashboardWidget> widgets = await _widgetRepository.GetUserWidgetsAsync(userId);
                IEnumerable<WidgetConfigDTO> widgetDtos = _mapper.Map<IEnumerable<WidgetConfigDTO>>(widgets);
                return Ok(widgetDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user widgets");
                return StatusCode(500, "An error occurred while retrieving widgets.");
            }
        }

        /// <summary>
        /// Get a specific widget by ID
        /// </summary>
        /// <param name="id">Widget ID</param>
        /// <returns>Widget details</returns>
        [HttpGet("widgets/{id}")]
        public async Task<IActionResult> GetWidgetById(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DashboardWidget? widget = await _widgetRepository.GetByIdAsync(id);
                
                if (widget == null || widget.UserId != userId)
                {
                    return NotFound("Widget not found or access denied.");
                }

                WidgetConfigDTO widgetDto = _mapper.Map<WidgetConfigDTO>(widget);
                return Ok(widgetDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting widget {WidgetId}", id);
                return StatusCode(500, "An error occurred while retrieving the widget.");
            }
        }

        /// <summary>
        /// Create a new dashboard widget
        /// </summary>
        /// <param name="createDto">Widget creation data</param>
        /// <returns>Created widget</returns>
        [HttpPost("widgets")]
        public async Task<IActionResult> CreateWidget([FromBody] CreateWidgetDTO createDto)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                
                DashboardWidget widget = _mapper.Map<DashboardWidget>(createDto);
                widget.UserId = userId;

                DashboardWidget createdWidget = await _widgetRepository.CreateAsync(widget);
                WidgetConfigDTO widgetDto = _mapper.Map<WidgetConfigDTO>(createdWidget);
                
                return CreatedAtAction(nameof(GetWidgetById), new { id = createdWidget.Id }, widgetDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating widget");
                return StatusCode(500, "An error occurred while creating the widget.");
            }
        }

        /// <summary>
        /// Update an existing widget
        /// </summary>
        /// <param name="id">Widget ID</param>
        /// <param name="updateDto">Widget update data</param>
        /// <returns>Updated widget</returns>
        [HttpPut("widgets/{id}")]
        public async Task<IActionResult> UpdateWidget(int id, [FromBody] UpdateWidgetDTO updateDto)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DashboardWidget? existingWidget = await _widgetRepository.GetByIdAsync(id);
                
                if (existingWidget == null || existingWidget.UserId != userId)
                {
                    return NotFound("Widget not found or access denied.");
                }

                _mapper.Map(updateDto, existingWidget);
                DashboardWidget updatedWidget = await _widgetRepository.UpdateAsync(existingWidget);
                WidgetConfigDTO widgetDto = _mapper.Map<WidgetConfigDTO>(updatedWidget);
                
                return Ok(widgetDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating widget {WidgetId}", id);
                return StatusCode(500, "An error occurred while updating the widget.");
            }
        }

        /// <summary>
        /// Delete a widget
        /// </summary>
        /// <param name="id">Widget ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("widgets/{id}")]
        public async Task<IActionResult> DeleteWidget(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DashboardWidget? widget = await _widgetRepository.GetByIdAsync(id);
                
                if (widget == null || widget.UserId != userId)
                {
                    return NotFound("Widget not found or access denied.");
                }

                bool success = await _widgetRepository.DeleteAsync(id);
                
                if (!success)
                {
                    return StatusCode(500, "Failed to delete widget.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting widget {WidgetId}", id);
                return StatusCode(500, "An error occurred while deleting the widget.");
            }
        }

        /// <summary>
        /// Update widget position
        /// </summary>
        /// <param name="id">Widget ID</param>
        /// <param name="position">New position data</param>
        /// <returns>Success status</returns>
        [HttpPatch("widgets/{id}/position")]
        public async Task<IActionResult> UpdateWidgetPosition(int id, [FromBody] WidgetPositionDTO position)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DashboardWidget? widget = await _widgetRepository.GetByIdAsync(id);
                
                if (widget == null || widget.UserId != userId)
                {
                    return NotFound("Widget not found or access denied.");
                }

                string positionJson = System.Text.Json.JsonSerializer.Serialize(position);
                bool success = await _widgetRepository.UpdatePositionAsync(id, positionJson);
                
                if (!success)
                {
                    return StatusCode(500, "Failed to update widget position.");
                }

                return Ok(new { Message = "Widget position updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating widget position for widget {WidgetId}", id);
                return StatusCode(500, "An error occurred while updating widget position.");
            }
        }

        /// <summary>
        /// Update widget configuration
        /// </summary>
        /// <param name="id">Widget ID</param>
        /// <param name="configuration">New configuration data</param>
        /// <returns>Success status</returns>
        [HttpPatch("widgets/{id}/configuration")]
        public async Task<IActionResult> UpdateWidgetConfiguration(int id, [FromBody] WidgetConfigurationDTO configuration)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DashboardWidget? widget = await _widgetRepository.GetByIdAsync(id);
                
                if (widget == null || widget.UserId != userId)
                {
                    return NotFound("Widget not found or access denied.");
                }

                string configJson = System.Text.Json.JsonSerializer.Serialize(configuration);
                bool success = await _widgetRepository.UpdateConfigurationAsync(id, configJson);
                
                if (!success)
                {
                    return StatusCode(500, "Failed to update widget configuration.");
                }

                return Ok(new { Message = "Widget configuration updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating widget configuration for widget {WidgetId}", id);
                return StatusCode(500, "An error occurred while updating widget configuration.");
            }
        }

        /// <summary>
        /// Get widgets by type
        /// </summary>
        /// <param name="type">Widget type</param>
        /// <returns>List of widgets of the specified type</returns>
        [HttpGet("widgets/type/{type}")]
        public async Task<IActionResult> GetWidgetsByType(string type)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                IEnumerable<DashboardWidget> widgets = await _widgetRepository.GetWidgetsByTypeAsync(userId, type);
                IEnumerable<WidgetConfigDTO> widgetDtos = _mapper.Map<IEnumerable<WidgetConfigDTO>>(widgets);
                return Ok(widgetDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting widgets by type {Type}", type);
                return StatusCode(500, "An error occurred while retrieving widgets by type.");
            }
        }

        /// <summary>
        /// Get dashboard statistics
        /// </summary>
        /// <returns>Dashboard statistics</returns>
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                int widgetCount = await _widgetRepository.GetWidgetCountAsync(userId);
                
                object stats = new
                {
                    TotalWidgets = widgetCount,
                    ActiveWidgets = widgetCount, // For now, assume all widgets are active
                    LastUpdated = DateTime.UtcNow
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard statistics");
                return StatusCode(500, "An error occurred while retrieving dashboard statistics.");
            }
        }
    }
} 