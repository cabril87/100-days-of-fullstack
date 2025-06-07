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
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using System;
using System.Threading.Tasks;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.Extensions;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Task priority controller - manages task priority levels and settings.
    /// Accessible to all authenticated users (RegularUser and above).
    /// </summary>
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [ApiController]
    [Authorize]
    [RequireRole(UserRole.RegularUser)]
    public class TaskPriorityController : BaseApiController
    {
        private readonly ITaskPriorityService _priorityService;
        private readonly ILogger<TaskPriorityController> _logger;

        public TaskPriorityController(ITaskPriorityService priorityService, ILogger<TaskPriorityController> logger)
        {
            _priorityService = priorityService;
            _logger = logger;
        }

        /// <summary>
        /// Automatically adjusts task priorities based on due dates and other factors
        /// </summary>
        /// <remarks>
        /// This endpoint evaluates all incomplete tasks and adjusts their priorities based on factors like:
        /// - Due date proximity
        /// - Task status
        /// - Historical completion patterns
        /// 
        /// Tasks that are overdue or due soon will have their priorities increased,
        /// while tasks far in the future may have priorities decreased.
        /// </remarks>
        /// <returns>A summary of priority adjustments made</returns>
        /// <response code="200">Returns the adjustment summary</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="429">If the request is rate-limited</response>
        [HttpPost("auto-adjust")]
        [ProducesResponseType(typeof(ApiResponse<PriorityAdjustmentSummaryDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status429TooManyRequests)]
        [RateLimit(10, 60)]
        public async Task<ActionResult<ApiResponse<PriorityAdjustmentSummaryDTO>>> AutoAdjustPriorities()
        {
            try
            {
                int userIdInt = GetUserId();

                _logger.LogInformation("Starting auto-adjustment of task priorities for user {UserId}", userIdInt);
                
                PriorityAdjustmentSummaryDTO? adjustmentSummary = await _priorityService.AutoAdjustTaskPrioritiesAsync(userIdInt);
                
                _logger.LogInformation(
                    "Completed priority auto-adjustment for user {UserId}. " +
                    "Evaluated: {TotalEvaluated}, Adjusted: {TotalAdjusted}, " +
                    "Upgraded: {Upgraded}, Downgraded: {Downgraded}",
                    userIdInt, 
                    adjustmentSummary.TotalTasksEvaluated,
                    adjustmentSummary.TasksAdjusted,
                    adjustmentSummary.UpgradedTasks,
                    adjustmentSummary.DowngradedTasks
                );

                return OkApiResponse(adjustmentSummary, "Task priorities auto-adjusted successfully");
            }
            catch (UnauthorizedAccessException)
            {
                return ApiUnauthorized<PriorityAdjustmentSummaryDTO>("User not authorized");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error auto-adjusting task priorities");
                return ApiServerError<PriorityAdjustmentSummaryDTO>("An error occurred while auto-adjusting task priorities");
            }
        }
    }
} 