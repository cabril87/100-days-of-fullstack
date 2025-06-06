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
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// Controller for parental control and family safety operations
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize]
public class ParentalControlController : BaseApiController
{
    private readonly IParentalControlService _parentalControlService;
    private readonly ILogger<ParentalControlController> _logger;
    private readonly ISecurityMonitoringService _securityMonitoringService;

    public ParentalControlController(
        IParentalControlService parentalControlService,
        ILogger<ParentalControlController> logger,
        ISecurityMonitoringService securityMonitoringService)
    {
        _parentalControlService = parentalControlService;
        _logger = logger;
        _securityMonitoringService = securityMonitoringService;
    }

    // Parental Control Management

    /// <summary>
    /// Gets parental control settings for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Parental control settings</returns>
    [HttpGet("children/{childUserId:int}")]
    public async Task<ActionResult<ParentalControlDTO>> GetParentalControlByChildId(int childUserId)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int requestingUserId = GetUserId();

        try
        {
            ParentalControlDTO? parentalControl = await _parentalControlService.GetParentalControlByChildIdAsync(childUserId, requestingUserId);
            
            if (parentalControl == null)
            {
                return NotFound(new { message = "Parental controls not found for this child" });
            }

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PARENTAL_CONTROL_VIEW",
                action: $"GET /api/parental-control/children/{childUserId}",
                ipAddress: ipAddress,
                userId: requestingUserId,
                resource: $"/api/parental-control/children/{childUserId}",
                severity: "INFO",
                details: $"Viewed parental controls for child {childUserId}",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(parentalControl);
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PARENTAL_CONTROL_ACCESS",
                action: $"GET /api/parental-control/children/{childUserId}",
                ipAddress: ipAddress,
                userId: requestingUserId,
                resource: $"/api/parental-control/children/{childUserId}",
                severity: "HIGH",
                details: $"Unauthorized access attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting parental controls for child {ChildUserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while retrieving parental controls" });
        }
    }

    /// <summary>
    /// Gets all children under parental control for the current parent
    /// </summary>
    /// <returns>List of parental control settings</returns>
    [HttpGet("my-children")]
    public async Task<ActionResult<IEnumerable<ParentalControlDTO>>> GetMyParentalControls()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        try
        {
            IEnumerable<ParentalControlDTO> parentalControls = await _parentalControlService.GetParentalControlsByParentIdAsync(parentUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PARENTAL_CONTROL_LIST_VIEW",
                action: "GET /api/parental-control/my-children",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: "/api/parental-control/my-children",
                severity: "INFO",
                details: "Viewed parental control list",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(parentalControls);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting parental controls for parent {ParentUserId}", parentUserId);
            return StatusCode(500, new { message = "An error occurred while retrieving parental controls" });
        }
    }

    /// <summary>
    /// Gets parental control dashboard summary for the current parent
    /// </summary>
    /// <returns>List of parental control summaries</returns>
    [HttpGet("dashboard")]
    public async Task<ActionResult<IEnumerable<ParentalControlSummaryDTO>>> GetParentalControlDashboard()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        try
        {
            IEnumerable<ParentalControlSummaryDTO> summaries = await _parentalControlService.GetParentalControlSummariesAsync(parentUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PARENTAL_CONTROL_DASHBOARD_VIEW",
                action: "GET /api/parental-control/dashboard",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: "/api/parental-control/dashboard",
                severity: "INFO",
                details: "Viewed parental control dashboard",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(summaries);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting parental control dashboard for parent {ParentUserId}", parentUserId);
            return StatusCode(500, new { message = "An error occurred while retrieving the dashboard" });
        }
    }

    /// <summary>
    /// Creates new parental control settings for a child
    /// </summary>
    /// <param name="createDto">Parental control settings to create</param>
    /// <returns>Created parental control settings</returns>
    [HttpPost]
    public async Task<ActionResult<ParentalControlDTO>> CreateParentalControl(ParentalControlCreateUpdateDTO createDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            ParentalControlDTO parentalControl = await _parentalControlService.CreateParentalControlAsync(createDto, parentUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PARENTAL_CONTROL_CREATED",
                action: "POST /api/parental-control",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: "/api/parental-control",
                severity: "INFO",
                details: $"Created parental controls for child {createDto.ChildUserId}",
                isSuccessful: true,
                isSuspicious: false
            );

            return CreatedAtAction(nameof(GetParentalControlByChildId), 
                new { childUserId = createDto.ChildUserId }, parentalControl);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PARENTAL_CONTROL_CREATE",
                action: "POST /api/parental-control",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: "/api/parental-control",
                severity: "HIGH",
                details: $"Unauthorized create attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating parental controls for child {ChildUserId}", createDto.ChildUserId);
            return StatusCode(500, new { message = "An error occurred while creating parental controls" });
        }
    }

    /// <summary>
    /// Updates existing parental control settings for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="updateDto">Updated parental control settings</param>
    /// <returns>Updated parental control settings</returns>
    [HttpPut("children/{childUserId:int}")]
    public async Task<ActionResult<ParentalControlDTO>> UpdateParentalControl(int childUserId, ParentalControlCreateUpdateDTO updateDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            ParentalControlDTO parentalControl = await _parentalControlService.UpdateParentalControlAsync(childUserId, updateDto, parentUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PARENTAL_CONTROL_UPDATED",
                action: $"PUT /api/parental-control/children/{childUserId}",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: $"/api/parental-control/children/{childUserId}",
                severity: "INFO",
                details: $"Updated parental controls for child {childUserId}",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(parentalControl);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PARENTAL_CONTROL_UPDATE",
                action: $"PUT /api/parental-control/children/{childUserId}",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: $"/api/parental-control/children/{childUserId}",
                severity: "HIGH",
                details: $"Unauthorized update attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating parental controls for child {ChildUserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while updating parental controls" });
        }
    }

    /// <summary>
    /// Removes parental control settings for a child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("children/{childUserId:int}")]
    public async Task<IActionResult> RemoveParentalControl(int childUserId)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        try
        {
            await _parentalControlService.RemoveParentalControlAsync(childUserId, parentUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PARENTAL_CONTROL_REMOVED",
                action: $"DELETE /api/parental-control/children/{childUserId}",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: $"/api/parental-control/children/{childUserId}",
                severity: "MEDIUM",
                details: $"Removed parental controls for child {childUserId}",
                isSuccessful: true,
                isSuspicious: false
            );

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PARENTAL_CONTROL_DELETE",
                action: $"DELETE /api/parental-control/children/{childUserId}",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: $"/api/parental-control/children/{childUserId}",
                severity: "HIGH",
                details: $"Unauthorized delete attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing parental controls for child {ChildUserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while removing parental controls" });
        }
    }

    // Permission Request Management

    /// <summary>
    /// Creates a new permission request from a child to their parent
    /// </summary>
    /// <param name="createDto">Permission request details</param>
    /// <returns>Created permission request</returns>
    [HttpPost("permission-requests")]
    public async Task<ActionResult<PermissionRequestDTO>> CreatePermissionRequest(PermissionRequestCreateDTO createDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int childUserId = GetUserId();

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            PermissionRequestDTO permissionRequest = await _parentalControlService.CreatePermissionRequestAsync(createDto, childUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PERMISSION_REQUEST_CREATED",
                action: "POST /api/parental-control/permission-requests",
                ipAddress: ipAddress,
                userId: childUserId,
                resource: "/api/parental-control/permission-requests",
                severity: "INFO",
                details: $"Created permission request: {createDto.RequestType}",
                isSuccessful: true,
                isSuspicious: false
            );

            return CreatedAtAction(nameof(GetPermissionRequestsByChild), 
                new { childUserId }, permissionRequest);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating permission request for user {UserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while creating the permission request" });
        }
    }

    /// <summary>
    /// Gets all permission requests for a specific child
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>List of permission requests</returns>
    [HttpGet("permission-requests/children/{childUserId:int}")]
    public async Task<ActionResult<IEnumerable<PermissionRequestDTO>>> GetPermissionRequestsByChild(int childUserId)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int requestingUserId = GetUserId();

        try
        {
            IEnumerable<PermissionRequestDTO> requests = await _parentalControlService.GetPermissionRequestsByChildIdAsync(childUserId, requestingUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PERMISSION_REQUEST_LIST_VIEW",
                action: $"GET /api/parental-control/permission-requests/children/{childUserId}",
                ipAddress: ipAddress,
                userId: requestingUserId,
                resource: $"/api/parental-control/permission-requests/children/{childUserId}",
                severity: "INFO",
                details: $"Viewed permission requests for child {childUserId}",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(requests);
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PERMISSION_REQUEST_ACCESS",
                action: $"GET /api/parental-control/permission-requests/children/{childUserId}",
                ipAddress: ipAddress,
                userId: requestingUserId,
                resource: $"/api/parental-control/permission-requests/children/{childUserId}",
                severity: "HIGH",
                details: $"Unauthorized access attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting permission requests for child {ChildUserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while retrieving permission requests" });
        }
    }

    /// <summary>
    /// Gets all pending permission requests for the current parent
    /// </summary>
    /// <returns>List of pending permission requests</returns>
    [HttpGet("permission-requests/pending")]
    public async Task<ActionResult<IEnumerable<PermissionRequestDTO>>> GetPendingPermissionRequests()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        try
        {
            IEnumerable<PermissionRequestDTO> requests = await _parentalControlService.GetPendingPermissionRequestsAsync(parentUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PENDING_PERMISSION_REQUEST_VIEW",
                action: "GET /api/parental-control/permission-requests/pending",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: "/api/parental-control/permission-requests/pending",
                severity: "INFO",
                details: "Viewed pending permission requests",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending permission requests for parent {ParentUserId}", parentUserId);
            return StatusCode(500, new { message = "An error occurred while retrieving pending requests" });
        }
    }

    /// <summary>
    /// Gets the count of pending permission requests for the current parent
    /// </summary>
    /// <returns>Count of pending requests</returns>
    [HttpGet("permission-requests/pending/count")]
    public async Task<ActionResult<int>> GetPendingPermissionRequestCount()
    {
        try
        {
            int parentUserId = GetUserId();
            int count = await _parentalControlService.GetPendingPermissionRequestCountAsync(parentUserId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending permission request count");
            return StatusCode(500, new { message = "An error occurred while retrieving the count" });
        }
    }

    /// <summary>
    /// Responds to a permission request (approve or deny)
    /// </summary>
    /// <param name="requestId">Permission request ID</param>
    /// <param name="responseDto">Response details</param>
    /// <returns>Updated permission request</returns>
    [HttpPost("permission-requests/{requestId:int}/respond")]
    public async Task<ActionResult<PermissionRequestDTO>> RespondToPermissionRequest(int requestId, PermissionRequestResponseDTO responseDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            PermissionRequestDTO permissionRequest = await _parentalControlService.RespondToPermissionRequestAsync(requestId, responseDto, parentUserId);

            string action = responseDto.IsApproved ? "APPROVED" : "DENIED";
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: $"PERMISSION_REQUEST_{action}",
                action: $"POST /api/parental-control/permission-requests/{requestId}/respond",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: $"/api/parental-control/permission-requests/{requestId}/respond",
                severity: "INFO",
                details: $"Permission request {requestId} {action.ToLower()}",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(permissionRequest);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PERMISSION_REQUEST_RESPONSE",
                action: $"POST /api/parental-control/permission-requests/{requestId}/respond",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: $"/api/parental-control/permission-requests/{requestId}/respond",
                severity: "HIGH",
                details: $"Unauthorized response attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error responding to permission request {RequestId}", requestId);
            return StatusCode(500, new { message = "An error occurred while responding to the request" });
        }
    }

    /// <summary>
    /// Processes multiple permission requests in bulk
    /// </summary>
    /// <param name="bulkResponseDto">Bulk response details</param>
    /// <returns>List of processed permission requests</returns>
    [HttpPost("permission-requests/bulk-respond")]
    public async Task<ActionResult<IEnumerable<PermissionRequestDTO>>> BulkRespondToPermissionRequests(BulkPermissionRequestResponseDTO bulkResponseDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int parentUserId = GetUserId();

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            IEnumerable<PermissionRequestDTO> processedRequests = await _parentalControlService.BulkRespondToPermissionRequestsAsync(bulkResponseDto, parentUserId);

            string action = bulkResponseDto.IsApproved ? "APPROVED" : "DENIED";
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: $"PERMISSION_REQUEST_BULK_{action}",
                action: "POST /api/parental-control/permission-requests/bulk-respond",
                ipAddress: ipAddress,
                userId: parentUserId,
                resource: "/api/parental-control/permission-requests/bulk-respond",
                severity: "INFO",
                details: $"Bulk {action.ToLower()} {bulkResponseDto.RequestIds.Count} permission requests",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(processedRequests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error bulk responding to permission requests");
            return StatusCode(500, new { message = "An error occurred while processing the bulk response" });
        }
    }

    /// <summary>
    /// Deletes a permission request
    /// </summary>
    /// <param name="requestId">Permission request ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("permission-requests/{requestId:int}")]
    public async Task<IActionResult> DeletePermissionRequest(int requestId)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        int requestingUserId = GetUserId();

        try
        {
            await _parentalControlService.DeletePermissionRequestAsync(requestId, requestingUserId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PERMISSION_REQUEST_DELETED",
                action: $"DELETE /api/parental-control/permission-requests/{requestId}",
                ipAddress: ipAddress,
                userId: requestingUserId,
                resource: $"/api/parental-control/permission-requests/{requestId}",
                severity: "INFO",
                details: $"Deleted permission request {requestId}",
                isSuccessful: true,
                isSuspicious: false
            );

            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "UNAUTHORIZED_PERMISSION_REQUEST_DELETE",
                action: $"DELETE /api/parental-control/permission-requests/{requestId}",
                ipAddress: ipAddress,
                userId: requestingUserId,
                resource: $"/api/parental-control/permission-requests/{requestId}",
                severity: "HIGH",
                details: $"Unauthorized delete attempt: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting permission request {RequestId}", requestId);
            return StatusCode(500, new { message = "An error occurred while deleting the request" });
        }
    }

    // Screen Time Management

    /// <summary>
    /// Records screen time usage for the current user (child)
    /// </summary>
    /// <param name="sessionDurationMinutes">Duration of the session in minutes</param>
    /// <returns>Success response</returns>
    [HttpPost("screen-time/record")]
    public async Task<IActionResult> RecordScreenTime([FromBody] int sessionDurationMinutes)
    {
        try
        {
            int childUserId = GetUserId();
            await _parentalControlService.RecordScreenTimeAsync(childUserId, sessionDurationMinutes);
            return Ok(new { message = "Screen time recorded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording screen time");
            return StatusCode(500, new { message = "An error occurred while recording screen time" });
        }
    }

    /// <summary>
    /// Gets remaining screen time for a child today
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>Remaining screen time in minutes</returns>
    [HttpGet("screen-time/remaining/{childUserId:int}")]
    public async Task<ActionResult<int>> GetRemainingScreenTime(int childUserId)
    {
        try
        {
            int requestingUserId = GetUserId();
            int remainingMinutes = await _parentalControlService.GetRemainingScreenTimeAsync(childUserId, requestingUserId);
            return Ok(remainingMinutes);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting remaining screen time for child {ChildUserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while retrieving screen time" });
        }
    }

    /// <summary>
    /// Checks if a child is currently within their allowed hours
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <returns>True if within allowed hours</returns>
    [HttpGet("screen-time/allowed-hours/{childUserId:int}")]
    public async Task<ActionResult<bool>> IsWithinAllowedHours(int childUserId)
    {
        try
        {
            int requestingUserId = GetUserId();
            bool isWithinAllowedHours = await _parentalControlService.IsWithinAllowedHoursAsync(childUserId, requestingUserId);
            return Ok(isWithinAllowedHours);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking allowed hours for child {ChildUserId}", childUserId);
            return StatusCode(500, new { message = "An error occurred while checking allowed hours" });
        }
    }

    // Validation Endpoints

    /// <summary>
    /// Checks if a child requires parent approval for a specific action
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action</param>
    /// <returns>True if approval is required</returns>
    [HttpGet("validation/requires-approval/{childUserId:int}")]
    public async Task<ActionResult<bool>> RequiresParentApproval(int childUserId, [FromQuery] string actionType)
    {
        try
        {
            bool requiresApproval = await _parentalControlService.RequiresParentApprovalAsync(childUserId, actionType);
            return Ok(requiresApproval);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking parent approval requirement for child {ChildUserId} and action {ActionType}", childUserId, actionType);
            return StatusCode(500, new { message = "An error occurred while checking approval requirements" });
        }
    }

    /// <summary>
    /// Validates if a parent can perform an action on a child's account
    /// </summary>
    /// <param name="childUserId">Child user ID</param>
    /// <param name="actionType">Type of action</param>
    /// <returns>True if action is allowed</returns>
    [HttpGet("validation/can-perform-action/{childUserId:int}")]
    public async Task<ActionResult<bool>> CanParentPerformAction(int childUserId, [FromQuery] string actionType)
    {
        try
        {
            int parentUserId = GetUserId();
            bool canPerformAction = await _parentalControlService.CanParentPerformActionAsync(parentUserId, childUserId, actionType);
            return Ok(canPerformAction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating parent action for child {ChildUserId} and action {ActionType}", childUserId, actionType);
            return StatusCode(500, new { message = "An error occurred while validating the action" });
        }
    }

    // Helper Methods

    /// <summary>
    /// Gets the current user ID from the JWT token
    /// </summary>
    /// <returns>User ID</returns>
    private new int GetUserId()
    {
        string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out int userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("Invalid user token");
    }
} 