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
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [SecurityRequirements(SecurityRequirementLevel.Authenticated)]
    public class DataVisualizationController : BaseApiController
    {
        private readonly IDataVisualizationService _dataVisualizationService;
        private readonly IAdvancedAnalyticsService _analyticsService;
        private readonly ILogger<DataVisualizationController> _logger;

        public DataVisualizationController(
            IDataVisualizationService dataVisualizationService,
            IAdvancedAnalyticsService analyticsService,
            ILogger<DataVisualizationController> logger)
        {
            _dataVisualizationService = dataVisualizationService;
            _analyticsService = analyticsService;
            _logger = logger;
        }

        /// <summary>
        /// Get chart configuration for a specific chart type
        /// </summary>
        /// <param name="chartType">Type of chart (line, bar, pie, etc.)</param>
        /// <returns>Chart configuration object</returns>
        [HttpGet("chart-config")]
        public async Task<IActionResult> GetChartConfiguration([FromQuery] string chartType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(chartType))
                {
                    return BadRequest("Chart type is required.");
                }

                var config = await _dataVisualizationService.GetChartConfigurationAsync(chartType);
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chart configuration for type {ChartType}", chartType);
                return StatusCode(500, "An error occurred while retrieving chart configuration.");
            }
        }

        /// <summary>
        /// Generate chart data for visualization
        /// </summary>
        /// <param name="request">Chart generation request</param>
        /// <returns>Generated chart data</returns>
        [HttpPost("generate-chart")]
        public async Task<IActionResult> GenerateChart([FromBody] GenerateChartRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.ChartType))
                {
                    return BadRequest("Chart type is required.");
                }

                int userId = GetUserIdFromClaims();

                // Get analytics data based on request
                object analyticsData = await GetAnalyticsDataAsync(userId, request);

                // Generate chart data
                var chartData = await _dataVisualizationService.GenerateChartDataAsync(request.ChartType, analyticsData);

                // Apply theme if specified
                if (!string.IsNullOrWhiteSpace(request.Theme))
                {
                    chartData = await _dataVisualizationService.ApplyChartThemeAsync(chartData, request.Theme);
                }

                // Make responsive if requested
                if (request.Responsive)
                {
                    chartData = await _dataVisualizationService.GenerateResponsiveChartAsync(chartData, request.ResponsiveOptions ?? new object());
                }

                return Ok(chartData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating chart");
                return StatusCode(500, "An error occurred while generating the chart.");
            }
        }

        /// <summary>
        /// Get dashboard data for visualization
        /// </summary>
        /// <param name="dateRange">Date range for data (optional)</param>
        /// <returns>Dashboard data object</returns>
        [HttpGet("dashboard-data")]
        public async Task<IActionResult> GetDashboardData([FromQuery] string? dateRange = null)
        {
            try
            {
                int userId = GetUserIdFromClaims();

                // Parse date range if provided
                DateTime? startDate = null;
                DateTime? endDate = null;

                if (!string.IsNullOrWhiteSpace(dateRange))
                {
                    var dates = dateRange.Split(',');
                    if (dates.Length == 2)
                    {
                        DateTime.TryParse(dates[0], out var start);
                        DateTime.TryParse(dates[1], out var end);
                        startDate = start;
                        endDate = end;
                    }
                }

                // Get comprehensive analytics data
                var analyticsData = await _analyticsService.GetAdvancedAnalyticsAsync(userId, startDate, endDate);
                var taskTrends = await _analyticsService.GetTaskTrendsAsync(userId, 
                    startDate ?? DateTime.UtcNow.AddDays(-30), 
                    endDate ?? DateTime.UtcNow);
                var productivityMetrics = await _analyticsService.GetProductivityMetricsAsync(userId, 
                    startDate ?? DateTime.UtcNow.AddDays(-30), 
                    endDate ?? DateTime.UtcNow);

                var dashboardData = new
                {
                    Overview = analyticsData,
                    TaskTrends = taskTrends,
                    ProductivityMetrics = productivityMetrics,
                    LastUpdated = DateTime.UtcNow,
                    DateRange = new
                    {
                        Start = startDate ?? DateTime.UtcNow.AddDays(-30),
                        End = endDate ?? DateTime.UtcNow
                    }
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard data");
                return StatusCode(500, "An error occurred while retrieving dashboard data.");
            }
        }

        /// <summary>
        /// Get supported chart types
        /// </summary>
        /// <returns>List of supported chart types</returns>
        [HttpGet("chart-types")]
        public async Task<IActionResult> GetSupportedChartTypes()
        {
            try
            {
                var chartTypes = await _dataVisualizationService.GetSupportedChartTypesAsync();
                return Ok(chartTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported chart types");
                return StatusCode(500, "An error occurred while retrieving chart types.");
            }
        }

        /// <summary>
        /// Get visualization templates
        /// </summary>
        /// <returns>List of available visualization templates</returns>
        [HttpGet("templates")]
        public async Task<IActionResult> GetVisualizationTemplates()
        {
            try
            {
                var templates = await _dataVisualizationService.GetVisualizationTemplatesAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visualization templates");
                return StatusCode(500, "An error occurred while retrieving visualization templates.");
            }
        }

        /// <summary>
        /// Create interactive visualization
        /// </summary>
        /// <param name="request">Interactive visualization request</param>
        /// <returns>Interactive visualization configuration</returns>
        [HttpPost("interactive")]
        public async Task<IActionResult> CreateInteractiveVisualization([FromBody] InteractiveVisualizationRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.VisualizationType))
                {
                    return BadRequest("Visualization type is required.");
                }

                int userId = GetUserIdFromClaims();

                // Get data based on request
                object data = await GetAnalyticsDataAsync(userId, new GenerateChartRequest 
                { 
                    DataType = request.DataType,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate
                });

                var visualization = await _dataVisualizationService.CreateInteractiveVisualizationAsync(
                    request.VisualizationType, 
                    data, 
                    request.Options ?? new object());

                return Ok(visualization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating interactive visualization");
                return StatusCode(500, "An error occurred while creating the interactive visualization.");
            }
        }

        /// <summary>
        /// Generate custom chart with custom definition
        /// </summary>
        /// <param name="request">Custom chart request</param>
        /// <returns>Custom chart data</returns>
        [HttpPost("custom-chart")]
        public async Task<IActionResult> GenerateCustomChart([FromBody] CustomChartRequest request)
        {
            try
            {
                if (request == null || request.ChartDefinition == null)
                {
                    return BadRequest("Chart definition is required.");
                }

                int userId = GetUserIdFromClaims();

                // Get data based on request
                object data = await GetAnalyticsDataAsync(userId, new GenerateChartRequest 
                { 
                    DataType = request.DataType,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate
                });

                var customChart = await _dataVisualizationService.GenerateCustomChartAsync(
                    request.ChartDefinition, 
                    data);

                return Ok(customChart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating custom chart");
                return StatusCode(500, "An error occurred while generating the custom chart.");
            }
        }

        private async Task<object> GetAnalyticsDataAsync(int userId, GenerateChartRequest request)
        {
            return request.DataType?.ToLowerInvariant() switch
            {
                "trends" => await _analyticsService.GetTaskTrendsAsync(userId, 
                    request.StartDate ?? DateTime.UtcNow.AddDays(-30), 
                    request.EndDate ?? DateTime.UtcNow),
                "productivity" => await _analyticsService.GetProductivityMetricsAsync(userId, 
                    request.StartDate ?? DateTime.UtcNow.AddDays(-30), 
                    request.EndDate ?? DateTime.UtcNow),
                "time" => await _analyticsService.GetTimeAnalysisAsync(userId, 
                    request.StartDate ?? DateTime.UtcNow.AddDays(-30), 
                    request.EndDate ?? DateTime.UtcNow),
                "category" => await _analyticsService.GetCategoryBreakdownAsync(userId, 
                    request.StartDate ?? DateTime.UtcNow.AddDays(-30), 
                    request.EndDate ?? DateTime.UtcNow),
                _ => await _analyticsService.GetAdvancedAnalyticsAsync(userId, 
                    request.StartDate, request.EndDate)
            };
        }
    }

    // Request DTOs for the controller
    public class GenerateChartRequest
    {
        public string ChartType { get; set; } = string.Empty;
        public string? DataType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Theme { get; set; }
        public bool Responsive { get; set; } = true;
        public object? ResponsiveOptions { get; set; }
    }

    public class InteractiveVisualizationRequest
    {
        public string VisualizationType { get; set; } = string.Empty;
        public string? DataType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public object? Options { get; set; }
    }

    public class CustomChartRequest
    {
        public object ChartDefinition { get; set; } = new object();
        public string? DataType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
} 