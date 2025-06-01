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
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Controllers.V2;
using ModelReminderStatus = TaskTrackerAPI.Models.ReminderStatus;

namespace TaskTrackerAPI.Controllers.V1
{
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Route("api/[controller]")]
    public class RemindersController : BaseApiController
    {
        private readonly ILogger<RemindersController> _logger;
        private readonly IReminderService _reminderService;

        public RemindersController(ILogger<RemindersController> logger, IReminderService reminderService)
        {
            _logger = logger;
            _reminderService = reminderService;
        }

        // GET: api/Reminders
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReminderDTO>>>> GetAllReminders()
        {
            try
            {
                int userId = GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetAllRemindersAsync(userId);
                
                return ApiOk(reminders, "Reminders retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all reminders for user");
                return ApiServerError<IEnumerable<ReminderDTO>>("An error occurred while retrieving reminders");
            }
        }

        // POST: api/Reminders
        [HttpPost]
        public async Task<ActionResult<ApiResponse<ReminderDTO>>> PostReminder(CreateReminderDTO reminderDTO)
        {
            try
            {
                int userId = GetUserId();
                
                ReminderDTO? createdReminder = await _reminderService.CreateReminderAsync(userId, reminderDTO);
                
                if (createdReminder == null)
                {
                    return ApiBadRequest<ReminderDTO>("Failed to create reminder");
                }

                return ApiCreated(createdReminder, "Reminder created successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reminder");
                return ApiServerError<ReminderDTO>("An error occurred while creating the reminder");
            }
        }

        // GET: api/Reminders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ReminderDTO>>> GetReminderById(int id)
        {
            try
            {
                int userId = GetUserId();
                
                ReminderDTO? reminder = await _reminderService.GetReminderByIdAsync(userId, id);
                
                if (reminder == null)
                {
                    return ApiNotFound<ReminderDTO>($"Reminder with ID {id} not found");
                }

                return ApiOk(reminder, "Reminder retrieved successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to access a reminder they don't own");
                return ApiUnauthorized<ReminderDTO>("You do not have permission to access this reminder");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminder with ID {ReminderId}", id);
                return ApiServerError<ReminderDTO>("An error occurred while retrieving the reminder");
            }
        }

        // PUT: api/Reminders/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<ReminderDTO>>> PutReminder(int id, UpdateReminderDTO reminderDTO)
        {
            try
            {
                int userId = GetUserId();
                
                ReminderDTO? updatedReminder = await _reminderService.UpdateReminderAsync(userId, id, reminderDTO);
                
                if (updatedReminder == null)
                {
                    return ApiNotFound<ReminderDTO>($"Reminder with ID {id} not found");
                }

                return ApiOk(updatedReminder, "Reminder updated successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to update a reminder they don't own");
                return ApiUnauthorized<ReminderDTO>("You do not have permission to update this reminder");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating reminder with ID {ReminderId}", id);
                return ApiServerError<ReminderDTO>("An error occurred while updating the reminder");
            }
        }

        // DELETE: api/Reminders/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> DeleteReminder(int id)
        {
            try
            {
                int userId = GetUserId();
                
                await _reminderService.DeleteReminderAsync(userId, id);
                
                return ApiOk<object>(new object(), "Reminder deleted successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to delete a reminder they don't own");
                return ApiUnauthorized<object>("You do not have permission to delete this reminder");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting reminder with ID {ReminderId}", id);
                return ApiServerError<object>("An error occurred while deleting the reminder");
            }
        }

        // GET: api/Reminders/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReminderDTO>>>> GetRemindersByStatus(DTOs.Tasks.ReminderStatus status)
        {
            try
            {
                int userId = GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetRemindersByStatusAsync(userId, (ModelReminderStatus)status);
                
                return ApiOk(reminders, "Reminders retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminders with status {Status}", status);
                return ApiServerError<IEnumerable<ReminderDTO>>("An error occurred while retrieving reminders by status");
            }
        }

        // GET: api/Reminders/upcoming/{days}
        [HttpGet("upcoming/{days}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReminderDTO>>>> GetUpcomingReminders(int days = 7)
        {
            try
            {
                int userId = GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetUpcomingRemindersAsync(userId, days);
                
                return ApiOk(reminders, "Upcoming reminders retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving upcoming reminders for the next {Days} days", days);
                return ApiServerError<IEnumerable<ReminderDTO>>("An error occurred while retrieving upcoming reminders");
            }
        }

        // GET: api/Reminders/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReminderDTO>>>> GetOverdueReminders()
        {
            try
            {
                int userId = GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetOverdueRemindersAsync(userId);
                
                return ApiOk(reminders, "Overdue reminders retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue reminders");
                return ApiServerError<IEnumerable<ReminderDTO>>("An error occurred while retrieving overdue reminders");
            }
        }

        // GET: api/Reminders/duetoday
        [HttpGet("duetoday")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReminderDTO>>>> GetDueTodayReminders()
        {
            try
            {
                int userId = GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetDueTodayRemindersAsync(userId);
                
                return ApiOk(reminders, "Reminders due today retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminders due today");
                return ApiServerError<IEnumerable<ReminderDTO>>("An error occurred while retrieving reminders due today");
            }
        }

        // GET: api/Reminders/task/{taskId}
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<ReminderDTO>>>> GetRemindersByTaskId(int taskId)
        {
            try
            {
                int userId = GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetRemindersByTaskIdAsync(userId, taskId);
                
                return ApiOk(reminders, "Task reminders retrieved successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to access reminders for a task they don't own");
                return ApiUnauthorized<IEnumerable<ReminderDTO>>("You do not have permission to access reminders for this task");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminders for task {TaskId}", taskId);
                return ApiServerError<IEnumerable<ReminderDTO>>("An error occurred while retrieving task reminders");
            }
        }

        // GET: api/Reminders/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<ApiResponse<ReminderStatisticsDTO>>> GetReminderStatistics()
        {
            try
            {
                int userId = GetUserId();
                
                ReminderStatisticsDTO statistics = await _reminderService.GetReminderStatisticsAsync(userId);
                
                return ApiOk(statistics, "Reminder statistics retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminder statistics");
                return ApiServerError<ReminderStatisticsDTO>("An error occurred while retrieving reminder statistics");
            }
        }

        // PUT: api/Reminders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<ApiResponse<object>>> UpdateReminderStatus(int id, [FromBody] DTOs.Tasks.ReminderStatus status)
        {
            try
            {
                int userId = GetUserId();
                
                ReminderDTO? updatedReminder = await _reminderService.UpdateReminderStatusAsync(userId, id, (ModelReminderStatus)status);
                
                if (updatedReminder == null)
                {
                    return ApiNotFound<object>($"Reminder with ID {id} not found");
                }
                
                return ApiOk<object>(new object(), "Reminder status updated successfully");
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to update status for a reminder they don't own");
                return ApiUnauthorized<object>("You do not have permission to update this reminder");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for reminder {ReminderId}", id);
                return ApiServerError<object>("An error occurred while updating reminder status");
            }
        }
    }
} 