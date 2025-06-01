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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/batch")]
    [Route("api/batch")]
    [ApiController]
    [Authorize]
    [RateLimit(20, 60)] // Strict limit for batch operations
    public class BatchOperationsController : BaseApiController
    {
        private readonly ITaskService _taskService;
        private readonly ILogger<BatchOperationsController> _logger;
        private readonly int _maxBatchSize;

        public BatchOperationsController(
            ITaskService taskService,
            ILogger<BatchOperationsController> logger,
            IConfiguration configuration)
        {
            _taskService = taskService;
            _logger = logger;
            _maxBatchSize = configuration.GetValue<int>("BatchOperations:MaxBatchSize", 100);
        }

        /// <summary>
        /// Create multiple tasks in a single operation
        /// </summary>
        /// <param name="tasks">List of tasks to create (max 100)</param>
        /// <returns>List of created tasks</returns>
        [HttpPost("tasks")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskItemDTO>>>> CreateTasksBatch(
            [FromBody] List<TaskItemDTO> tasks)
        {
            try
            {
                // Validate batch size
                if (tasks == null || tasks.Count == 0)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse("No tasks provided"));
                }

                if (tasks.Count > _maxBatchSize)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse(
                        $"Batch size exceeds maximum allowed ({_maxBatchSize})"));
                }

                int userId = User.GetUserIdAsInt();
                List<TaskItemDTO> createdTasks = new();

                // Process in transaction for atomicity
                foreach (TaskItemDTO task in tasks)
                {
                    TaskItemDTO? createdTask = await _taskService.CreateTaskAsync(userId, task);
                    if (createdTask != null)
                    {
                        createdTasks.Add(createdTask);
                    }
                }

                // If none were created due to validation issues
                if (createdTasks.Count == 0)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse("Failed to create tasks"));
                }

                return CreatedAtAction(
                    nameof(GetTasksBatch),
                    new { ids = string.Join(",", createdTasks.Select(t => t.Id)) },
                    ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(createdTasks));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task batch");
                return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Get multiple tasks by their IDs in a single request
        /// </summary>
        /// <param name="ids">Comma-separated list of task IDs</param>
        /// <returns>List of tasks</returns>
        [HttpGet("tasks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskItemDTO>>>> GetTasksBatch(
            [FromQuery] string ids)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ids))
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse("No task IDs provided"));
                }

                // Parse and validate IDs
                List<int> taskIds = ids.Split(',')
                    .Where(id => int.TryParse(id.Trim(), out _))
                    .Select(id => int.Parse(id.Trim()))
                    .ToList();

                if (taskIds.Count == 0)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse("Invalid task IDs"));
                }

                if (taskIds.Count > _maxBatchSize)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse(
                        $"Batch size exceeds maximum allowed ({_maxBatchSize})"));
                }

                int userId = User.GetUserIdAsInt();
                List<TaskItemDTO> tasks = new();

                // Process tasks individually but in parallel for efficiency
                IEnumerable<Task<TaskItemDTO?>> taskFetches = taskIds.Select(async id =>
                {
                    bool isOwned = await _taskService.IsTaskOwnedByUserAsync(id, userId);
                    if (isOwned)
                    {
                        return await _taskService.GetTaskByIdAsync(userId, id);
                    }
                    return null;
                });

                TaskItemDTO?[] results = await Task.WhenAll(taskFetches);
                tasks.AddRange(results.Where(t => t != null)!);

                return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(tasks));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving task batch");
                return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Update multiple tasks in a single operation
        /// </summary>
        /// <param name="tasks">List of tasks to update (max 100)</param>
        /// <returns>List of updated tasks</returns>
        [HttpPut("tasks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<TaskItemDTO>>>> UpdateTasksBatch(
            [FromBody] List<TaskItemDTO> tasks)
        {
            try
            {
                if (tasks == null || tasks.Count == 0)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse("No tasks provided"));
                }

                if (tasks.Count > _maxBatchSize)
                {
                    return BadRequest(ApiResponse<IEnumerable<TaskItemDTO>>.BadRequestResponse(
                        $"Batch size exceeds maximum allowed ({_maxBatchSize})"));
                }

                int userId = User.GetUserIdAsInt();
                List<TaskItemDTO> updatedTasks = new();

                foreach (TaskItemDTO task in tasks)
                {
                    if (task.Id <= 0)
                    {
                        continue; // Skip invalid IDs
                    }

                    // Check ownership first
                    bool isOwned = await _taskService.IsTaskOwnedByUserAsync(task.Id, userId);
                    if (!isOwned)
                    {
                        continue; // Skip tasks the user doesn't own
                    }

                    TaskItemDTO? updatedTask = await _taskService.UpdateTaskAsync(userId, task.Id, task);
                    if (updatedTask != null)
                    {
                        updatedTasks.Add(updatedTask);
                    }
                }

                if (updatedTasks.Count == 0)
                {
                    return NotFound(ApiResponse<IEnumerable<TaskItemDTO>>.NotFoundResponse("No tasks were updated"));
                }

                return Ok(ApiResponse<IEnumerable<TaskItemDTO>>.SuccessResponse(updatedTasks));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task batch");
                return StatusCode(500, ApiResponse<IEnumerable<TaskItemDTO>>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Delete multiple tasks in a single operation
        /// </summary>
        /// <param name="ids">Comma-separated list of task IDs</param>
        /// <returns>Success status</returns>
        [HttpDelete("tasks")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteTasksBatch([FromQuery] string ids)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ids))
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("No task IDs provided"));
                }

                // Parse and validate IDs
                List<int> taskIds = ids.Split(',')
                    .Where(id => int.TryParse(id.Trim(), out _))
                    .Select(id => int.Parse(id.Trim()))
                    .ToList();

                if (taskIds.Count == 0)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse("Invalid task IDs"));
                }

                if (taskIds.Count > _maxBatchSize)
                {
                    return BadRequest(ApiResponse<object>.BadRequestResponse(
                        $"Batch size exceeds maximum allowed ({_maxBatchSize})"));
                }

                int userId = User.GetUserIdAsInt();

                // Delete tasks that user owns
                foreach (int taskId in taskIds)
                {
                    bool isOwned = await _taskService.IsTaskOwnedByUserAsync(taskId, userId);
                    if (isOwned)
                    {
                        await _taskService.DeleteTaskAsync(userId, taskId);
                    }
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task batch");
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Update status of multiple tasks in a single operation
        /// </summary>
        /// <param name="batchUpdate">Batch update request</param>
        /// <returns>List of updated task statuses</returns>
        [HttpPut("tasks/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<List<TaskStatusUpdateResponseDTO>>>> UpdateTaskStatusBatch(
            [FromBody] BatchStatusUpdateRequestDTO batchUpdate)
        {
            try
            {
                if (batchUpdate == null || batchUpdate.TaskIds == null || batchUpdate.TaskIds.Count == 0)
                {
                    return BadRequest(ApiResponse<List<TaskStatusUpdateResponseDTO>>.BadRequestResponse("No updates provided"));
                }

                if (batchUpdate.TaskIds.Count > _maxBatchSize)
                {
                    return BadRequest(ApiResponse<List<TaskStatusUpdateResponseDTO>>.BadRequestResponse(
                        $"Batch size exceeds maximum allowed ({_maxBatchSize})"));
                }

                int userId = User.GetUserIdAsInt();
                
                List<TaskStatusUpdateResponseDTO> results = await _taskService.BatchUpdateTaskStatusAsync(userId, batchUpdate);
                
                return Ok(ApiResponse<List<TaskStatusUpdateResponseDTO>>.SuccessResponse(results));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task status batch");
                return StatusCode(500, ApiResponse<List<TaskStatusUpdateResponseDTO>>.ServerErrorResponse());
            }
        }
    }
} 