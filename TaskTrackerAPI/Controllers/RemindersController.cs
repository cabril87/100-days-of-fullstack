using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class RemindersController : ControllerBase
    {
        private readonly ILogger<RemindersController> _logger;
        private readonly IReminderService _reminderService;

        public RemindersController(ILogger<RemindersController> logger, IReminderService reminderService)
        {
            _logger = logger;
            _reminderService = reminderService;
        }

        // POST: api/Reminders
        [HttpPost]
        public async Task<ActionResult<ReminderDTO>> PostReminder(CreateReminderDTO reminderDTO)
        {
            try
            {
                int userId = User.GetUserId();
                
                ReminderDTO? createdReminder = await _reminderService.CreateReminderAsync(userId, reminderDTO);
                
                if (createdReminder == null)
                {
                    return BadRequest(ApiResponse<ReminderDTO>.BadRequestResponse("Failed to create reminder"));
                }

                return CreatedAtAction(nameof(GetReminderById), new { id = createdReminder.Id }, createdReminder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reminder");
                return StatusCode(500, ApiResponse<ReminderDTO>.ServerErrorResponse());
            }
        }

        // GET: api/Reminders/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReminderDTO>> GetReminderById(int id)
        {
            try
            {
                int userId = User.GetUserId();
                
                ReminderDTO? reminder = await _reminderService.GetReminderByIdAsync(userId, id);
                
                if (reminder == null)
                {
                    return NotFound(ApiResponse<ReminderDTO>.NotFoundResponse($"Reminder with ID {id} not found"));
                }

                return Ok(ApiResponse<ReminderDTO>.SuccessResponse(reminder));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to access a reminder they don't own");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminder with ID {ReminderId}", id);
                return StatusCode(500, ApiResponse<ReminderDTO>.ServerErrorResponse());
            }
        }

        // PUT: api/Reminders/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ReminderDTO>> PutReminder(int id, UpdateReminderDTO reminderDTO)
        {
            try
            {
                int userId = User.GetUserId();
                
                ReminderDTO? updatedReminder = await _reminderService.UpdateReminderAsync(userId, id, reminderDTO);
                
                if (updatedReminder == null)
                {
                    return NotFound(ApiResponse<ReminderDTO>.NotFoundResponse($"Reminder with ID {id} not found"));
                }

                return Ok(ApiResponse<ReminderDTO>.SuccessResponse(updatedReminder));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to update a reminder they don't own");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating reminder with ID {ReminderId}", id);
                return StatusCode(500, ApiResponse<ReminderDTO>.ServerErrorResponse());
            }
        }

        // DELETE: api/Reminders/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteReminder(int id)
        {
            try
            {
                int userId = User.GetUserId();
                
                await _reminderService.DeleteReminderAsync(userId, id);
                
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to delete a reminder they don't own");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting reminder with ID {ReminderId}", id);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // GET: api/Reminders/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<ReminderDTO>>> GetRemindersByStatus(ReminderStatus status)
        {
            try
            {
                int userId = User.GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetRemindersByStatusAsync(userId, status);
                
                return Ok(ApiResponse<IEnumerable<ReminderDTO>>.SuccessResponse(reminders));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminders with status {Status}", status);
                return StatusCode(500, ApiResponse<IEnumerable<ReminderDTO>>.ServerErrorResponse());
            }
        }

        // GET: api/Reminders/upcoming/{days}
        [HttpGet("upcoming/{days}")]
        public async Task<ActionResult<IEnumerable<ReminderDTO>>> GetUpcomingReminders(int days = 7)
        {
            try
            {
                int userId = User.GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetUpcomingRemindersAsync(userId, days);
                
                return Ok(ApiResponse<IEnumerable<ReminderDTO>>.SuccessResponse(reminders));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving upcoming reminders for the next {Days} days", days);
                return StatusCode(500, ApiResponse<IEnumerable<ReminderDTO>>.ServerErrorResponse());
            }
        }

        // GET: api/Reminders/overdue
        [HttpGet("overdue")]
        public async Task<ActionResult<IEnumerable<ReminderDTO>>> GetOverdueReminders()
        {
            try
            {
                int userId = User.GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetOverdueRemindersAsync(userId);
                
                return Ok(ApiResponse<IEnumerable<ReminderDTO>>.SuccessResponse(reminders));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue reminders");
                return StatusCode(500, ApiResponse<IEnumerable<ReminderDTO>>.ServerErrorResponse());
            }
        }

        // GET: api/Reminders/task/{taskId}
        [HttpGet("task/{taskId}")]
        public async Task<ActionResult<IEnumerable<ReminderDTO>>> GetRemindersByTaskId(int taskId)
        {
            try
            {
                int userId = User.GetUserId();
                
                IEnumerable<ReminderDTO> reminders = await _reminderService.GetRemindersByTaskIdAsync(userId, taskId);
                
                return Ok(ApiResponse<IEnumerable<ReminderDTO>>.SuccessResponse(reminders));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to access reminders for a task they don't own");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminders for task {TaskId}", taskId);
                return StatusCode(500, ApiResponse<IEnumerable<ReminderDTO>>.ServerErrorResponse());
            }
        }

        // GET: api/Reminders/statistics
        [HttpGet("statistics")]
        public async Task<ActionResult<ReminderStatisticsDTO>> GetReminderStatistics()
        {
            try
            {
                int userId = User.GetUserId();
                
                ReminderStatisticsDTO statistics = await _reminderService.GetReminderStatisticsAsync(userId);
                
                return Ok(ApiResponse<ReminderStatisticsDTO>.SuccessResponse(statistics));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving reminder statistics");
                return StatusCode(500, ApiResponse<ReminderStatisticsDTO>.ServerErrorResponse());
            }
        }

        // PUT: api/Reminders/{id}/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateReminderStatus(int id, [FromBody] ReminderStatus status)
        {
            try
            {
                int userId = User.GetUserId();
                
                ReminderDTO? updatedReminder = await _reminderService.UpdateReminderStatusAsync(userId, id, status);
                
                if (updatedReminder == null)
                {
                    return NotFound(ApiResponse<ReminderDTO>.NotFoundResponse($"Reminder with ID {id} not found"));
                }
                
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for reminder with ID {ReminderId}", id);
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }
    }
} 