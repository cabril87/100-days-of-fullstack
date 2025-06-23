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
/// Controller for managing security questions functionality
/// Provides enhanced authentication and password recovery options
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class SecurityQuestionController : BaseApiController
{
    private readonly ISecurityQuestionService _securityQuestionService;
    private readonly ILogger<SecurityQuestionController> _logger;
    private readonly ISecurityMonitoringService _securityMonitoringService;

    public SecurityQuestionController(
        ISecurityQuestionService securityQuestionService,
        ILogger<SecurityQuestionController> logger,
        ISecurityMonitoringService securityMonitoringService)
    {
        _securityQuestionService = securityQuestionService ?? throw new ArgumentNullException(nameof(securityQuestionService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _securityMonitoringService = securityMonitoringService ?? throw new ArgumentNullException(nameof(securityMonitoringService));
    }

    /// <summary>
    /// Sets up security questions for the authenticated user
    /// </summary>
    /// <param name="setupDto">Security question setup data</param>
    /// <returns>Success confirmation</returns>
    [HttpPost("setup")]
    [Authorize]
    public async Task<ActionResult> SetupSecurityQuestions([FromBody] SecurityQuestionSetupDTO setupDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        int userId = GetCurrentUserId();

        try
        {
            _logger.LogInformation("Setting up security questions for user {UserId}", userId);

            bool success = await _securityQuestionService.SetupSecurityQuestionsAsync(userId, setupDto);

            if (success)
            {
                // Log successful security question setup
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "SECURITY_QUESTIONS_SETUP",
                    action: "POST /api/security-questions/setup",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    userId: userId,
                    resource: "/api/security-questions/setup",
                    severity: "INFO",
                    details: "Security questions set up successfully",
                    isSuccessful: true,
                    isSuspicious: false
                );

                _logger.LogInformation("Security questions set up successfully for user {UserId}", userId);
                return Ok(new { message = "Security questions set up successfully", success = true });
            }
            else
            {
                _logger.LogWarning("Failed to set up security questions for user {UserId}", userId);
                return BadRequest(new { message = "Failed to set up security questions", success = false });
            }
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validation error setting up security questions for user {UserId}: {Error}", userId, ex.Message);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_SETUP_VALIDATION_FAILED",
                action: "POST /api/security-questions/setup",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/setup",
                severity: "LOW",
                details: $"Validation error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );

            return BadRequest(new { message = ex.Message, success = false });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up security questions for user {UserId}", userId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_SETUP_ERROR",
                action: "POST /api/security-questions/setup",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/setup",
                severity: "HIGH",
                details: $"Setup error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return StatusCode(500, new { message = "An error occurred while setting up security questions. Please try again later.", success = false });
        }
    }

    /// <summary>
    /// Gets the authenticated user's security questions (without answers)
    /// </summary>
    /// <returns>User's security questions</returns>
    [HttpGet("my-questions")]
    [Authorize]
    public async Task<ActionResult<SecurityQuestionListDTO>> GetMySecurityQuestions()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        int userId = GetCurrentUserId();

        try
        {
            _logger.LogInformation("Retrieving security questions for user {UserId}", userId);

            SecurityQuestionListDTO questions = await _securityQuestionService.GetUserSecurityQuestionsAsync(userId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_RETRIEVED",
                action: "GET /api/security-questions/my-questions",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/my-questions",
                severity: "INFO",
                details: $"Retrieved {questions.QuestionCount} security questions",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security questions for user {UserId}", userId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_RETRIEVAL_ERROR",
                action: "GET /api/security-questions/my-questions",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/my-questions",
                severity: "MEDIUM",
                details: $"Retrieval error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );

            return StatusCode(500, new { message = "An error occurred while retrieving security questions. Please try again later." });
        }
    }

    /// <summary>
    /// Gets security questions for a user by email (for password reset)
    /// </summary>
    /// <param name="email">User's email address</param>
    /// <returns>User's security questions</returns>
    [HttpGet("by-email")]
    [AllowAnonymous]
    public async Task<ActionResult<SecurityQuestionListDTO>> GetSecurityQuestionsByEmail([FromQuery] string email)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        try
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            _logger.LogInformation("Retrieving security questions for email {Email}", email);

            SecurityQuestionListDTO questions = await _securityQuestionService.GetSecurityQuestionsByEmailAsync(email);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_LOOKUP_BY_EMAIL",
                action: "GET /api/security-questions/by-email",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: email,
                resource: "/api/security-questions/by-email",
                severity: "INFO",
                details: $"Retrieved {questions.QuestionCount} security questions for password reset",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving security questions for email {Email}", email);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_LOOKUP_ERROR",
                action: "GET /api/security-questions/by-email",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: email,
                resource: "/api/security-questions/by-email",
                severity: "MEDIUM",
                details: $"Lookup error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );

            return StatusCode(500, new { message = "An error occurred while retrieving security questions. Please try again later." });
        }
    }

    /// <summary>
    /// Verifies security question answers for password reset
    /// </summary>
    /// <param name="verificationDto">Verification data with answers</param>
    /// <returns>Verification result with token if successful</returns>
    [HttpPost("verify")]
    [AllowAnonymous]
    public async Task<ActionResult<SecurityQuestionVerificationResultDTO>> VerifySecurityAnswers([FromBody] SecurityQuestionVerificationDTO verificationDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        try
        {
            _logger.LogInformation("Verifying security answers for email {Email}", verificationDto.Email);

            SecurityQuestionVerificationResultDTO result = await _securityQuestionService.VerifySecurityAnswersAsync(verificationDto);

            string severity = result.IsVerified ? "INFO" : "MEDIUM";
            bool isSuspicious = !result.IsVerified;

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: result.IsVerified ? "SECURITY_QUESTIONS_VERIFIED" : "SECURITY_QUESTIONS_VERIFICATION_FAILED",
                action: "POST /api/security-questions/verify",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: verificationDto.Email,
                resource: "/api/security-questions/verify",
                severity: severity,
                details: result.IsVerified 
                    ? "Security questions verified successfully for password reset" 
                    : $"Security question verification failed: {result.ErrorMessage}",
                isSuccessful: result.IsVerified,
                isSuspicious: isSuspicious
            );

            if (result.IsVerified)
            {
                _logger.LogInformation("Security questions verified successfully for email {Email}", verificationDto.Email);
                return Ok(result);
            }
            else
            {
                _logger.LogWarning("Security question verification failed for email {Email}: {Error}", 
                    verificationDto.Email, result.ErrorMessage);
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying security answers for email {Email}", verificationDto.Email);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_VERIFICATION_ERROR",
                action: "POST /api/security-questions/verify",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: verificationDto.Email,
                resource: "/api/security-questions/verify",
                severity: "HIGH",
                details: $"Verification error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return StatusCode(500, new { message = "An error occurred during verification. Please try again later." });
        }
    }

    /// <summary>
    /// Updates existing security questions for the authenticated user
    /// </summary>
    /// <param name="updateDto">Update data</param>
    /// <returns>Success confirmation</returns>
    [HttpPut("update")]
    [Authorize]
    public async Task<ActionResult> UpdateSecurityQuestions([FromBody] SecurityQuestionUpdateDTO updateDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        int userId = GetCurrentUserId();

        try
        {
            _logger.LogInformation("Updating security questions for user {UserId}", userId);

            bool success = await _securityQuestionService.UpdateSecurityQuestionsAsync(userId, updateDto);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_UPDATED",
                action: "PUT /api/security-questions/update",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/update",
                severity: "INFO",
                details: success ? "Security questions updated successfully" : "No updates provided",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(new { message = success ? "Security questions updated successfully" : "No updates provided", success });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("Validation error updating security questions for user {UserId}: {Error}", userId, ex.Message);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_UPDATE_VALIDATION_FAILED",
                action: "PUT /api/security-questions/update",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/update",
                severity: "LOW",
                details: $"Validation error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );

            return BadRequest(new { message = ex.Message, success = false });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating security questions for user {UserId}", userId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_UPDATE_ERROR",
                action: "PUT /api/security-questions/update",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/update",
                severity: "HIGH",
                details: $"Update error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return StatusCode(500, new { message = "An error occurred while updating security questions. Please try again later.", success = false });
        }
    }

    /// <summary>
    /// Deletes all security questions for the authenticated user
    /// </summary>
    /// <returns>Success confirmation with count of deleted questions</returns>
    [HttpDelete("delete-all")]
    [Authorize]
    public async Task<ActionResult> DeleteAllSecurityQuestions()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        int userId = GetCurrentUserId();

        try
        {
            _logger.LogInformation("Deleting all security questions for user {UserId}", userId);

            int deletedCount = await _securityQuestionService.DeleteAllSecurityQuestionsAsync(userId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_DELETED",
                action: "DELETE /api/security-questions/delete-all",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/delete-all",
                severity: "MEDIUM",
                details: $"Deleted {deletedCount} security questions",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(new { message = $"Successfully deleted {deletedCount} security questions", deletedCount, success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting security questions for user {UserId}", userId);

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "SECURITY_QUESTIONS_DELETE_ERROR",
                action: "DELETE /api/security-questions/delete-all",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/delete-all",
                severity: "HIGH",
                details: $"Delete error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return StatusCode(500, new { message = "An error occurred while deleting security questions. Please try again later.", success = false });
        }
    }

    /// <summary>
    /// Checks if the authenticated user has security questions set up
    /// </summary>
    /// <returns>Boolean indicating if user has security questions</returns>
    [HttpGet("has-questions")]
    [Authorize]
    public async Task<ActionResult<bool>> HasSecurityQuestions()
    {
        int userId = GetCurrentUserId();

        try
        {
            bool hasQuestions = await _securityQuestionService.HasSecurityQuestionsAsync(userId);
            return Ok(new { hasQuestions, userId });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} has security questions", userId);
            return StatusCode(500, new { message = "An error occurred while checking security questions status. Please try again later." });
        }
    }

    /// <summary>
    /// Gets age-appropriate predefined security questions
    /// </summary>
    /// <param name="requestDto">Request parameters including age group</param>
    /// <returns>List of age-appropriate questions</returns>
    [HttpPost("age-appropriate-questions")]
    [AllowAnonymous]
    public async Task<ActionResult<List<PredefinedSecurityQuestionDTO>>> GetAgeAppropriateQuestions([FromBody] AgeAppropriateQuestionsRequestDTO requestDto)
    {
        try
        {
            _logger.LogInformation("Getting age-appropriate questions for age group {AgeGroup}", requestDto.AgeGroup);

            List<PredefinedSecurityQuestionDTO> questions = await _securityQuestionService.GetAgeAppropriateQuestionsAsync(requestDto);

            return Ok(questions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting age-appropriate questions for age group {AgeGroup}", requestDto.AgeGroup);
            return StatusCode(500, new { message = "An error occurred while retrieving questions. Please try again later." });
        }
    }

    /// <summary>
    /// Gets security question usage statistics for the authenticated user
    /// </summary>
    /// <returns>Usage statistics</returns>
    [HttpGet("stats")]
    [Authorize]
    public async Task<ActionResult> GetSecurityQuestionStats()
    {
        int userId = GetCurrentUserId();

        try
        {
            (int totalQuestions, int lastUsedDaysAgo, int totalUsageCount) = 
                await _securityQuestionService.GetSecurityQuestionStatsAsync(userId);

            return Ok(new { 
                totalQuestions, 
                lastUsedDaysAgo, 
                totalUsageCount,
                userId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting security question stats for user {UserId}", userId);
            return StatusCode(500, new { message = "An error occurred while retrieving statistics. Please try again later." });
        }
    }

    /// <summary>
    /// Validates a password reset token generated from security question verification
    /// </summary>
    /// <param name="token">Reset token to validate</param>
    /// <returns>Token validation result</returns>
    [HttpGet("validate-reset-token")]
    [AllowAnonymous]
    public async Task<ActionResult> ValidatePasswordResetToken([FromQuery] string token)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();

        try
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required", isValid = false });
            }

            _logger.LogInformation("Validating password reset token from security questions");

            int? userId = await _securityQuestionService.ValidatePasswordResetTokenAsync(token);
            bool isValid = userId.HasValue;

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: isValid ? "PASSWORD_RESET_TOKEN_VALIDATED" : "PASSWORD_RESET_TOKEN_VALIDATION_FAILED",
                action: "GET /api/security-questions/validate-reset-token",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                resource: "/api/security-questions/validate-reset-token",
                severity: isValid ? "INFO" : "MEDIUM",
                details: isValid ? "Password reset token validated successfully" : "Invalid or expired reset token",
                isSuccessful: isValid,
                isSuspicious: !isValid
            );

            return Ok(new { isValid, userId = userId ?? 0 });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating password reset token");

            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PASSWORD_RESET_TOKEN_VALIDATION_ERROR",
                action: "GET /api/security-questions/validate-reset-token",
                ipAddress: ipAddress,
                userAgent: userAgent,
                resource: "/api/security-questions/validate-reset-token",
                severity: "HIGH",
                details: $"Token validation error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );

            return StatusCode(500, new { message = "An error occurred while validating the token. Please try again later.", isValid = false });
        }
    }

    #region Private Helper Methods

    /// <summary>
    /// Gets the current user's ID from the JWT claims
    /// </summary>
    /// <returns>Current user ID</returns>
    private int GetCurrentUserId()
    {
        string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            throw new UnauthorizedAccessException("Invalid or missing user ID in token");
        }
        return userId;
    }

    #endregion
} 