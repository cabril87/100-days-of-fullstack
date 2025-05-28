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
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;
using TaskTrackerAPI.Attributes;
using Microsoft.Extensions.DependencyInjection;

namespace TaskTrackerAPI.Controllers.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/security")]
[ApiController]
[Authorize(Roles = "Admin")]
[RateLimit(50, 60)] // Admin endpoints get higher limits
public class SecurityMonitoringController : ControllerBase
{
    private readonly ISecurityMonitoringService _securityMonitoringService;
    private readonly ILogger<SecurityMonitoringController> _logger;

    public SecurityMonitoringController(
        ISecurityMonitoringService securityMonitoringService,
        ILogger<SecurityMonitoringController> logger)
    {
        _securityMonitoringService = securityMonitoringService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the complete security monitoring dashboard
    /// </summary>
    /// <returns>Comprehensive security dashboard data</returns>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(ApiResponse<SecurityDashboardDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    public async Task<ActionResult<ApiResponse<SecurityDashboardDTO>>> GetSecurityDashboard()
    {
        try
        {
            _logger.LogInformation("Admin requesting security dashboard");
            
            SecurityDashboardDTO dashboard = await _securityMonitoringService.GetSecurityDashboardAsync();
            
            return Ok(ApiResponse<SecurityDashboardDTO>.SuccessResponse(dashboard));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security dashboard");
            return StatusCode(500, ApiResponse<SecurityDashboardDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets security overview metrics
    /// </summary>
    /// <returns>Security overview data</returns>
    [HttpGet("overview")]
    [ProducesResponseType(typeof(ApiResponse<SecurityOverviewDTO>), 200)]
    public async Task<ActionResult<ApiResponse<SecurityOverviewDTO>>> GetSecurityOverview()
    {
        try
        {
            SecurityOverviewDTO overview = await _securityMonitoringService.GetSecurityOverviewAsync();
            return Ok(ApiResponse<SecurityOverviewDTO>.SuccessResponse(overview));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security overview");
            return StatusCode(500, ApiResponse<SecurityOverviewDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets rate limiting status and configuration
    /// </summary>
    /// <returns>Rate limiting status data</returns>
    [HttpGet("rate-limits")]
    [ProducesResponseType(typeof(ApiResponse<RateLimitStatusDTO>), 200)]
    public async Task<ActionResult<ApiResponse<RateLimitStatusDTO>>> GetRateLimitStatus()
    {
        try
        {
            RateLimitStatusDTO rateLimitStatus = await _securityMonitoringService.GetRateLimitStatusAsync();
            return Ok(ApiResponse<RateLimitStatusDTO>.SuccessResponse(rateLimitStatus));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving rate limit status");
            return StatusCode(500, ApiResponse<RateLimitStatusDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets system health metrics
    /// </summary>
    /// <returns>System health data</returns>
    [HttpGet("system-health")]
    [ProducesResponseType(typeof(ApiResponse<SystemHealthDTO>), 200)]
    public async Task<ActionResult<ApiResponse<SystemHealthDTO>>> GetSystemHealth()
    {
        try
        {
            SystemHealthDTO systemHealth = await _securityMonitoringService.GetSystemHealthAsync();
            return Ok(ApiResponse<SystemHealthDTO>.SuccessResponse(systemHealth));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system health");
            return StatusCode(500, ApiResponse<SystemHealthDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets security metrics within a date range
    /// </summary>
    /// <param name="from">Start date (optional, defaults to 7 days ago)</param>
    /// <param name="to">End date (optional, defaults to now)</param>
    /// <returns>List of security metrics</returns>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(ApiResponse<List<SecurityMetricDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<SecurityMetricDTO>>>> GetSecurityMetrics(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        try
        {
            List<SecurityMetricDTO> metrics = await _securityMonitoringService.GetSecurityMetricsAsync(from, to);
            return Ok(ApiResponse<List<SecurityMetricDTO>>.SuccessResponse(metrics));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security metrics");
            return StatusCode(500, ApiResponse<List<SecurityMetricDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets security audit logs with pagination and filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50, max: 100)</param>
    /// <param name="severity">Filter by severity level (optional)</param>
    /// <returns>Paginated list of security audit logs</returns>
    [HttpGet("audit-logs")]
    [ProducesResponseType(typeof(ApiResponse<List<SecurityAuditLogDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<SecurityAuditLogDTO>>>> GetSecurityAuditLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? severity = null)
    {
        try
        {
            // Cap page size at 100 to prevent performance issues
            pageSize = Math.Min(pageSize, 100);
            page = Math.Max(page, 1);

            List<SecurityAuditLogDTO> auditLogs = await _securityMonitoringService.GetSecurityAuditLogsAsync(page, pageSize, severity);
            return Ok(ApiResponse<List<SecurityAuditLogDTO>>.SuccessResponse(auditLogs));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security audit logs");
            return StatusCode(500, ApiResponse<List<SecurityAuditLogDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets active security alerts
    /// </summary>
    /// <returns>List of active security alerts</returns>
    [HttpGet("alerts")]
    [ProducesResponseType(typeof(ApiResponse<List<SecurityAlertDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<SecurityAlertDTO>>>> GetActiveSecurityAlerts()
    {
        try
        {
            List<SecurityAlertDTO> alerts = await _securityMonitoringService.GetActiveSecurityAlertsAsync();
            return Ok(ApiResponse<List<SecurityAlertDTO>>.SuccessResponse(alerts));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security alerts");
            return StatusCode(500, ApiResponse<List<SecurityAlertDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Clears security audit logs older than specified date
    /// </summary>
    /// <param name="olderThan">Clear logs older than this date (optional, defaults to 30 days ago)</param>
    /// <returns>Number of logs cleared</returns>
    [HttpDelete("audit-logs/clear")]
    [ProducesResponseType(typeof(ApiResponse<ClearLogsResultDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    public async Task<ActionResult<ApiResponse<ClearLogsResultDTO>>> ClearSecurityAuditLogs(
        [FromQuery] DateTime? olderThan = null)
    {
        try
        {
            _logger.LogWarning("Admin requesting to clear security audit logs older than {Date}", olderThan);
            
            int clearedCount = await _securityMonitoringService.ClearSecurityAuditLogsAsync(olderThan);
            
            ClearLogsResultDTO result = new ClearLogsResultDTO
            {
                ClearedCount = clearedCount,
                ClearedDate = olderThan ?? DateTime.UtcNow.AddDays(-30),
                Message = $"Successfully cleared {clearedCount} security audit logs"
            };
            
            return Ok(ApiResponse<ClearLogsResultDTO>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing security audit logs");
            return StatusCode(500, ApiResponse<ClearLogsResultDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Clears security metrics older than specified date
    /// </summary>
    /// <param name="olderThan">Clear metrics older than this date (optional, defaults to 30 days ago)</param>
    /// <returns>Number of metrics cleared</returns>
    [HttpDelete("metrics/clear")]
    [ProducesResponseType(typeof(ApiResponse<ClearLogsResultDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    public async Task<ActionResult<ApiResponse<ClearLogsResultDTO>>> ClearSecurityMetrics(
        [FromQuery] DateTime? olderThan = null)
    {
        try
        {
            _logger.LogWarning("Admin requesting to clear security metrics older than {Date}", olderThan);
            
            int clearedCount = await _securityMonitoringService.ClearSecurityMetricsAsync(olderThan);
            
            ClearLogsResultDTO result = new ClearLogsResultDTO
            {
                ClearedCount = clearedCount,
                ClearedDate = olderThan ?? DateTime.UtcNow.AddDays(-30),
                Message = $"Successfully cleared {clearedCount} security metrics"
            };
            
            return Ok(ApiResponse<ClearLogsResultDTO>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing security metrics");
            return StatusCode(500, ApiResponse<ClearLogsResultDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Clears ALL security logs (audit logs, metrics, and health metrics) - USE WITH CAUTION
    /// </summary>
    /// <returns>Number of total logs cleared</returns>
    [HttpDelete("logs/clear-all")]
    [ProducesResponseType(typeof(ApiResponse<ClearLogsResultDTO>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 401)]
    [ProducesResponseType(typeof(ApiResponse<object>), 403)]
    public async Task<ActionResult<ApiResponse<ClearLogsResultDTO>>> ClearAllSecurityLogs()
    {
        try
        {
            _logger.LogWarning("Admin requesting to clear ALL security logs - this is a destructive operation");
            
            int clearedCount = await _securityMonitoringService.ClearAllSecurityLogsAsync();
            
            ClearLogsResultDTO result = new ClearLogsResultDTO
            {
                ClearedCount = clearedCount,
                ClearedDate = DateTime.UtcNow,
                Message = $"Successfully cleared ALL {clearedCount} security logs (audit logs, metrics, and health metrics)"
            };
            
            return Ok(ApiResponse<ClearLogsResultDTO>.SuccessResponse(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing all security logs");
            return StatusCode(500, ApiResponse<ClearLogsResultDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets performance metrics
    /// </summary>
    /// <returns>Performance metrics data</returns>
    [HttpGet("performance")]
    [ProducesResponseType(typeof(ApiResponse<PerformanceMetricsDTO>), 200)]
    public async Task<ActionResult<ApiResponse<PerformanceMetricsDTO>>> GetPerformanceMetrics()
    {
        try
        {
            PerformanceMetricsDTO performance = await _securityMonitoringService.GetPerformanceMetricsAsync();
            return Ok(ApiResponse<PerformanceMetricsDTO>.SuccessResponse(performance));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving performance metrics");
            return StatusCode(500, ApiResponse<PerformanceMetricsDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets users with suspicious activity
    /// </summary>
    /// <param name="limit">Maximum number of users to return (default: 10, max: 50)</param>
    /// <returns>List of users with suspicious activity</returns>
    [HttpGet("suspicious-users")]
    [ProducesResponseType(typeof(ApiResponse<List<UserActivityDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<UserActivityDTO>>>> GetSuspiciousUsers(
        [FromQuery] int limit = 10)
    {
        try
        {
            limit = Math.Min(limit, 50);
            limit = Math.Max(limit, 1);

            List<UserActivityDTO> suspiciousUsers = await _securityMonitoringService.GetSuspiciousUsersAsync(limit);
            return Ok(ApiResponse<List<UserActivityDTO>>.SuccessResponse(suspiciousUsers));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving suspicious users");
            return StatusCode(500, ApiResponse<List<UserActivityDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Creates a security alert
    /// </summary>
    /// <param name="request">Security alert creation request</param>
    /// <returns>Success response</returns>
    [HttpPost("alerts")]
    [ProducesResponseType(typeof(ApiResponse<object>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<object>>> CreateSecurityAlert([FromBody] CreateSecurityAlertRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                List<string> errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<object>.BadRequestResponse("Validation failed", errors));
            }

            await _securityMonitoringService.CreateSecurityAlertAsync(
                request.Type,
                request.Title,
                request.Description,
                request.Severity,
                request.Source,
                request.RecommendedAction);

            return CreatedAtAction(nameof(GetActiveSecurityAlerts), null,
                ApiResponse<object>.SuccessResponse(new { message = "Security alert created successfully" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating security alert");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Resolves a security alert
    /// </summary>
    /// <param name="alertId">ID of the alert to resolve</param>
    /// <returns>Success response</returns>
    [HttpPost("alerts/{alertId}/resolve")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<object>>> ResolveSecurityAlert(int alertId)
    {
        try
        {
            string resolvedBy = User.Identity?.Name ?? "Unknown Admin";
            await _securityMonitoringService.ResolveSecurityAlertAsync(alertId, resolvedBy);
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = $"Security alert {alertId} resolved successfully by {resolvedBy}" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving security alert {AlertId}", alertId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Logs a custom security metric
    /// </summary>
    /// <param name="request">Security metric logging request</param>
    /// <returns>Success response</returns>
    [HttpPost("metrics")]
    [ProducesResponseType(typeof(ApiResponse<object>), 201)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<object>>> LogSecurityMetric([FromBody] LogSecurityMetricRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                List<string> errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<object>.BadRequestResponse("Validation failed", errors));
            }

            await _securityMonitoringService.LogSecurityMetricAsync(
                request.MetricType,
                request.MetricName,
                request.Value,
                request.Description,
                request.Source,
                request.Severity);

            return CreatedAtAction(nameof(GetSecurityMetrics), null,
                ApiResponse<object>.SuccessResponse(new { message = "Security metric logged successfully" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging security metric");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets the current security score
    /// </summary>
    /// <returns>Current security score</returns>
    [HttpGet("score")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<ActionResult<ApiResponse<object>>> GetSecurityScore()
    {
        try
        {
            double score = await _securityMonitoringService.CalculateSecurityScoreAsync();
            
            return Ok(ApiResponse<object>.SuccessResponse(new 
            { 
                SecurityScore = score,
                Status = GetScoreStatus(score),
                Timestamp = DateTime.UtcNow
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating security score");
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    private string GetScoreStatus(double score)
    {
        return score switch
        {
            >= 90 => "Excellent",
            >= 80 => "Good",
            >= 70 => "Fair",
            >= 60 => "Poor",
            _ => "Critical"
        };
    }

    // Enhanced Security Features Endpoints

    /// <summary>
    /// Gets failed login attempts summary
    /// </summary>
    /// <param name="from">Start date (optional, defaults to 7 days ago)</param>
    /// <param name="to">End date (optional, defaults to now)</param>
    /// <returns>Failed login attempts summary</returns>
    [HttpGet("failed-logins")]
    [ProducesResponseType(typeof(ApiResponse<FailedLoginSummaryDTO>), 200)]
    public async Task<ActionResult<ApiResponse<FailedLoginSummaryDTO>>> GetFailedLoginSummary(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        try
        {
            IFailedLoginService failedLoginService = HttpContext.RequestServices.GetRequiredService<IFailedLoginService>();
            FailedLoginSummaryDTO summary = await failedLoginService.GetFailedLoginSummaryAsync(from, to);
            return Ok(ApiResponse<FailedLoginSummaryDTO>.SuccessResponse(summary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving failed login summary");
            return StatusCode(500, ApiResponse<FailedLoginSummaryDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets failed login attempts with pagination
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 50, max: 100)</param>
    /// <returns>Paginated list of failed login attempts</returns>
    [HttpGet("failed-logins/attempts")]
    [ProducesResponseType(typeof(ApiResponse<List<FailedLoginAttemptDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<FailedLoginAttemptDTO>>>> GetFailedLoginAttempts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            pageSize = Math.Min(pageSize, 100);
            page = Math.Max(page, 1);

            IFailedLoginService failedLoginService = HttpContext.RequestServices.GetRequiredService<IFailedLoginService>();
            List<FailedLoginAttemptDTO> attempts = await failedLoginService.GetFailedLoginAttemptsAsync(page, pageSize);
            return Ok(ApiResponse<List<FailedLoginAttemptDTO>>.SuccessResponse(attempts));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving failed login attempts");
            return StatusCode(500, ApiResponse<List<FailedLoginAttemptDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets account lockout status for a specific user
    /// </summary>
    /// <param name="emailOrUsername">Email or username to check</param>
    /// <returns>Account lockout status</returns>
    [HttpGet("failed-logins/lockout-status")]
    [ProducesResponseType(typeof(ApiResponse<AccountLockoutStatusDTO>), 200)]
    public async Task<ActionResult<ApiResponse<AccountLockoutStatusDTO>>> GetAccountLockoutStatus(
        [FromQuery] string emailOrUsername)
    {
        try
        {
            if (string.IsNullOrEmpty(emailOrUsername))
            {
                return BadRequest(ApiResponse<AccountLockoutStatusDTO>.BadRequestResponse("Email or username is required"));
            }

            IFailedLoginService failedLoginService = HttpContext.RequestServices.GetRequiredService<IFailedLoginService>();
            AccountLockoutStatusDTO status = await failedLoginService.GetAccountLockoutStatusAsync(emailOrUsername);
            return Ok(ApiResponse<AccountLockoutStatusDTO>.SuccessResponse(status));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving account lockout status for {EmailOrUsername}", emailOrUsername);
            return StatusCode(500, ApiResponse<AccountLockoutStatusDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Unlocks a user account
    /// </summary>
    /// <param name="request">Account unlock request</param>
    /// <returns>Success response</returns>
    [HttpPost("failed-logins/unlock-account")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<object>>> UnlockAccount([FromBody] UnlockAccountRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.EmailOrUsername))
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Email or username is required"));
            }

            string unlockedBy = User.Identity?.Name ?? "Unknown Admin";
            IFailedLoginService failedLoginService = HttpContext.RequestServices.GetRequiredService<IFailedLoginService>();
            await failedLoginService.UnlockAccountAsync(request.EmailOrUsername, unlockedBy);
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = $"Account {request.EmailOrUsername} unlocked successfully by {unlockedBy}" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unlocking account {EmailOrUsername}", request.EmailOrUsername);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets session management data
    /// </summary>
    /// <returns>Session management data</returns>
    [HttpGet("sessions")]
    [ProducesResponseType(typeof(ApiResponse<SessionManagementDTO>), 200)]
    public async Task<ActionResult<ApiResponse<SessionManagementDTO>>> GetSessionManagementData()
    {
        try
        {
            ISessionManagementService sessionService = HttpContext.RequestServices.GetRequiredService<ISessionManagementService>();
            SessionManagementDTO sessionData = await sessionService.GetSessionManagementDataAsync();
            return Ok(ApiResponse<SessionManagementDTO>.SuccessResponse(sessionData));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving session management data");
            return StatusCode(500, ApiResponse<SessionManagementDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets active sessions
    /// </summary>
    /// <param name="userId">Optional user ID to filter sessions</param>
    /// <returns>List of active sessions</returns>
    [HttpGet("sessions/active")]
    [ProducesResponseType(typeof(ApiResponse<List<UserSessionDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<UserSessionDTO>>>> GetActiveSessions([FromQuery] int? userId = null)
    {
        try
        {
            ISessionManagementService sessionService = HttpContext.RequestServices.GetRequiredService<ISessionManagementService>();
            List<UserSessionDTO> activeSessions = await sessionService.GetActiveSessionsAsync(userId);
            return Ok(ApiResponse<List<UserSessionDTO>>.SuccessResponse(activeSessions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active sessions");
            return StatusCode(500, ApiResponse<List<UserSessionDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets sessions for a specific user
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="activeOnly">Whether to return only active sessions</param>
    /// <returns>List of user sessions</returns>
    [HttpGet("sessions/user/{userId}")]
    [ProducesResponseType(typeof(ApiResponse<List<UserSessionDTO>>), 200)]
    public async Task<ActionResult<ApiResponse<List<UserSessionDTO>>>> GetUserSessions(int userId, [FromQuery] bool activeOnly = false)
    {
        try
        {
            ISessionManagementService sessionService = HttpContext.RequestServices.GetRequiredService<ISessionManagementService>();
            List<UserSessionDTO> userSessions = await sessionService.GetUserSessionsAsync(userId, activeOnly);
            return Ok(ApiResponse<List<UserSessionDTO>>.SuccessResponse(userSessions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user sessions for user {UserId}", userId);
            return StatusCode(500, ApiResponse<List<UserSessionDTO>>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Terminates a user session
    /// </summary>
    /// <param name="request">Session termination request</param>
    /// <returns>Success response</returns>
    [HttpPost("sessions/terminate")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<object>>> TerminateSession([FromBody] TerminateSessionRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.SessionToken))
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Valid session token is required"));
            }

            string terminatedBy = User.Identity?.Name ?? "Unknown Admin";
            ISessionManagementService sessionService = HttpContext.RequestServices.GetRequiredService<ISessionManagementService>();
            await sessionService.TerminateSessionAsync(request.SessionToken, $"Terminated by admin: {terminatedBy}");
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = $"Session terminated successfully by {terminatedBy}" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error terminating session {SessionToken}", request.SessionToken);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Terminates all sessions for a user
    /// </summary>
    /// <param name="request">Terminate all sessions request</param>
    /// <returns>Success response</returns>
    [HttpPost("sessions/terminate-all")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<object>>> TerminateAllUserSessions([FromBody] TerminateAllSessionsRequest request)
    {
        try
        {
            if (request.UserId <= 0)
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Valid user ID is required"));
            }

            string terminatedBy = User.Identity?.Name ?? "Unknown Admin";
            ISessionManagementService sessionService = HttpContext.RequestServices.GetRequiredService<ISessionManagementService>();
            await sessionService.TerminateAllUserSessionsAsync(request.UserId, $"All sessions terminated by admin: {terminatedBy} - {request.Reason}", request.ExcludeSessionToken);
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = $"All sessions for user {request.UserId} terminated successfully by {terminatedBy}" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error terminating all sessions for user {UserId}", request.UserId);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Marks a session as suspicious
    /// </summary>
    /// <param name="request">Mark session suspicious request</param>
    /// <returns>Success response</returns>
    [HttpPost("sessions/mark-suspicious")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    public async Task<ActionResult<ApiResponse<object>>> MarkSessionSuspicious([FromBody] MarkSessionSuspiciousRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.SessionToken))
            {
                return BadRequest(ApiResponse<object>.BadRequestResponse("Valid session token is required"));
            }

            string markedBy = User.Identity?.Name ?? "Unknown Admin";
            ISessionManagementService sessionService = HttpContext.RequestServices.GetRequiredService<ISessionManagementService>();
            await sessionService.MarkSessionSuspiciousAsync(request.SessionToken, $"Marked by admin: {markedBy} - {request.Reason}");
            
            return Ok(ApiResponse<object>.SuccessResponse(new { message = $"Session marked as suspicious successfully by {markedBy}" }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking session as suspicious {SessionToken}", request.SessionToken);
            return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets IP geolocation summary
    /// </summary>
    /// <returns>IP geolocation summary</returns>
    [HttpGet("geolocation")]
    [ProducesResponseType(typeof(ApiResponse<IPGeolocationSummaryDTO>), 200)]
    public async Task<ActionResult<ApiResponse<IPGeolocationSummaryDTO>>> GetGeolocationSummary()
    {
        try
        {
            IGeolocationService geolocationService = HttpContext.RequestServices.GetRequiredService<IGeolocationService>();
            IPGeolocationSummaryDTO summary = await geolocationService.GetGeolocationSummaryAsync();
            return Ok(ApiResponse<IPGeolocationSummaryDTO>.SuccessResponse(summary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving geolocation summary");
            return StatusCode(500, ApiResponse<IPGeolocationSummaryDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets geolocation data for a specific IP address
    /// </summary>
    /// <param name="ipAddress">IP address to lookup</param>
    /// <returns>Geolocation data</returns>
    [HttpGet("geolocation/lookup")]
    [ProducesResponseType(typeof(ApiResponse<GeolocationDTO>), 200)]
    public async Task<ActionResult<ApiResponse<GeolocationDTO>>> GetIPGeolocation([FromQuery] string ipAddress)
    {
        try
        {
            if (string.IsNullOrEmpty(ipAddress))
            {
                return BadRequest(ApiResponse<GeolocationDTO>.BadRequestResponse("IP address is required"));
            }

            IGeolocationService geolocationService = HttpContext.RequestServices.GetRequiredService<IGeolocationService>();
            GeolocationDTO? geolocation = await geolocationService.GetLocationAsync(ipAddress);
            return Ok(ApiResponse<GeolocationDTO>.SuccessResponse(geolocation));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving geolocation for IP {IPAddress}", ipAddress);
            return StatusCode(500, ApiResponse<GeolocationDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets threat intelligence summary
    /// </summary>
    /// <returns>Threat intelligence summary data</returns>
    [HttpGet("threat-intelligence/summary")]
    [ProducesResponseType(typeof(ApiResponse<ThreatIntelligenceSummaryDTO>), 200)]
    public async Task<ActionResult<ApiResponse<ThreatIntelligenceSummaryDTO>>> GetThreatIntelligenceSummary()
    {
        try
        {
            IThreatIntelligenceService threatIntelligenceService = HttpContext.RequestServices.GetRequiredService<IThreatIntelligenceService>();
            ThreatIntelligenceSummaryDTO summary = await threatIntelligenceService.GetThreatIntelligenceSummaryAsync();
            return Ok(ApiResponse<ThreatIntelligenceSummaryDTO>.SuccessResponse(summary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving threat intelligence summary");
            return StatusCode(500, ApiResponse<ThreatIntelligenceSummaryDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets behavioral analytics summary
    /// </summary>
    /// <returns>Behavioral analytics summary data</returns>
    [HttpGet("behavioral-analytics/summary")]
    [ProducesResponseType(typeof(ApiResponse<BehavioralAnalyticsSummaryDTO>), 200)]
    public async Task<ActionResult<ApiResponse<BehavioralAnalyticsSummaryDTO>>> GetBehavioralAnalyticsSummary()
    {
        try
        {
            IBehavioralAnalyticsService behavioralAnalyticsService = HttpContext.RequestServices.GetRequiredService<IBehavioralAnalyticsService>();
            BehavioralAnalyticsSummaryDTO summary = await behavioralAnalyticsService.GetBehavioralAnalyticsSummaryAsync();
            return Ok(ApiResponse<BehavioralAnalyticsSummaryDTO>.SuccessResponse(summary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving behavioral analytics summary");
            return StatusCode(500, ApiResponse<BehavioralAnalyticsSummaryDTO>.ServerErrorResponse());
        }
    }

    /// <summary>
    /// Gets security monitoring summary
    /// </summary>
    /// <returns>Security monitoring summary data</returns>
    [HttpGet("monitoring/summary")]
    [ProducesResponseType(typeof(ApiResponse<SecurityMonitoringSummaryDTO>), 200)]
    public async Task<ActionResult<ApiResponse<SecurityMonitoringSummaryDTO>>> GetSecurityMonitoringSummary()
    {
        try
        {
            SecurityMonitoringSummaryDTO summary = await _securityMonitoringService.GetSecurityMonitoringSummaryAsync();
            return Ok(ApiResponse<SecurityMonitoringSummaryDTO>.SuccessResponse(summary));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security monitoring summary");
            return StatusCode(500, ApiResponse<SecurityMonitoringSummaryDTO>.ServerErrorResponse());
        }
    }
}

// Request DTOs
public class CreateSecurityAlertRequest
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string? Source { get; set; }
    public string? RecommendedAction { get; set; }
}

public class LogSecurityMetricRequest
{
    public string MetricType { get; set; } = string.Empty;
    public string MetricName { get; set; } = string.Empty;
    public double Value { get; set; }
    public string? Description { get; set; }
    public string? Source { get; set; }
    public string? Severity { get; set; }
}

public class ClearLogsResultDTO
{
    public int ClearedCount { get; set; }
    public DateTime ClearedDate { get; set; }
    public string Message { get; set; } = string.Empty;
}

// Enhanced Security Request DTOs
public class UnlockAccountRequest
{
    public string EmailOrUsername { get; set; } = string.Empty;
}

public class TerminateSessionRequest
{
    public string SessionToken { get; set; } = string.Empty;
}

public class TerminateAllSessionsRequest
{
    public int UserId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ExcludeSessionToken { get; set; }
}

public class MarkSessionSuspiciousRequest
{
    public string SessionToken { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
} 