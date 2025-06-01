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
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.Web;
using System.Net;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly ISecurityMonitoringService _securityMonitoringService;
    private readonly IFailedLoginService _failedLoginService;

    public AuthController(IAuthService authService, ILogger<AuthController> logger, ISecurityMonitoringService securityMonitoringService, IFailedLoginService failedLoginService)
    {
        _authService = authService;
        _logger = logger;
        _securityMonitoringService = securityMonitoringService;
        _failedLoginService = failedLoginService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(UserCreateDTO userCreateDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            UserDTO user = await _authService.RegisterUserAsync(userCreateDto);
            _logger.LogInformation("User registered successfully: {Username}", user.Username);
            
            // Log successful registration to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_REGISTRATION",
                action: "POST /api/auth/register",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: user.Id,
                username: user.Username,
                resource: "/api/auth/register",
                severity: "INFO",
                details: $"New user registered: {user.Username}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return CreatedAtAction(nameof(Register), user);
        }
        catch (ArgumentException ex)
        {
            // Log failed registration attempt
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_REGISTRATION_FAILED",
                action: "POST /api/auth/register",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: userCreateDto.Username,
                resource: "/api/auth/register",
                severity: "MEDIUM",
                details: $"Registration failed: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );
            
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            
            // Log registration error
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_REGISTRATION_ERROR",
                action: "POST /api/auth/register",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: userCreateDto.Username,
                resource: "/api/auth/register",
                severity: "HIGH",
                details: $"Registration error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return StatusCode(500, new { message = "An error occurred while registering. Please try again later." });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<TokensResponseDTO>> Login(UserLoginDTO userLoginDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            _logger.LogInformation("Login request received: {@UserLoginDto}", new { Email = userLoginDto.EmailOrUsername });
            
            // Check if account is locked out
            bool isLockedOut = await _failedLoginService.IsAccountLockedAsync(userLoginDto.EmailOrUsername);
            if (isLockedOut)
            {
                _logger.LogWarning("Login attempt for locked account: {Email}", userLoginDto.EmailOrUsername);
                
                // Log lockout attempt
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "ACCOUNT_LOCKOUT_ATTEMPT",
                    action: "POST /api/auth/login",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    username: userLoginDto.EmailOrUsername,
                    resource: "/api/auth/login",
                    severity: "HIGH",
                    details: "Login attempt on locked account",
                    isSuccessful: false,
                    isSuspicious: true
                );
                
                return Unauthorized(new { message = "Account is temporarily locked due to multiple failed login attempts. Please try again later." });
            }
            
            TokensResponseDTO response = await _authService.LoginAsync(userLoginDto, ipAddress, userAgent);
            _logger.LogInformation("User logged in successfully: {Email}", userLoginDto.EmailOrUsername);
            
            // Log successful login to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGIN",
                action: "POST /api/auth/login",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: response.User.Id,
                username: response.User.Username,
                resource: "/api/auth/login",
                severity: "INFO",
                details: $"User logged in successfully: {userLoginDto.EmailOrUsername}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized access: {Message}", ex.Message);
            
            // Log failed login attempt to FailedLoginService
            await _failedLoginService.LogFailedLoginAttemptAsync(
                userLoginDto.EmailOrUsername,
                ipAddress,
                userAgent,
                ex.Message
            );
            
            // Log failed login attempt to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGIN_FAILED",
                action: "POST /api/auth/login",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: userLoginDto.EmailOrUsername,
                resource: "/api/auth/login",
                severity: "MEDIUM",
                details: $"Login failed: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}: {ErrorMessage}", 
                userLoginDto.EmailOrUsername, ex.Message);
            
            // Log failed login attempt to FailedLoginService for system errors too
            await _failedLoginService.LogFailedLoginAttemptAsync(
                userLoginDto.EmailOrUsername,
                ipAddress,
                userAgent,
                $"System error: {ex.Message}"
            );
            
            // Log login error to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGIN_ERROR",
                action: "POST /api/auth/login",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: userLoginDto.EmailOrUsername,
                resource: "/api/auth/login",
                severity: "HIGH",
                details: $"Login error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return StatusCode(500, new { message = "An error occurred during login. Please try again later." });
        }
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(PasswordResetRequestDTO forgotPasswordRequest)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            _logger.LogInformation("Password reset request received for: {Email}", forgotPasswordRequest.Email);
            
            // Always return success to prevent email enumeration attacks
            // The actual implementation would send an email if the user exists
            
            // Log password reset request
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PASSWORD_RESET_REQUEST",
                action: "POST /api/auth/forgot-password",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: forgotPasswordRequest.Email,
                resource: "/api/auth/forgot-password",
                severity: "INFO",
                details: $"Password reset requested for: {forgotPasswordRequest.Email}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            // TODO: Implement actual email sending logic here
            // For now, just log the request
            _logger.LogInformation("Password reset email would be sent to: {Email}", forgotPasswordRequest.Email);
            
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing password reset request for {Email}", forgotPasswordRequest.Email);
            
            // Log error
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PASSWORD_RESET_ERROR",
                action: "POST /api/auth/forgot-password",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: forgotPasswordRequest.Email,
                resource: "/api/auth/forgot-password",
                severity: "MEDIUM",
                details: $"Password reset error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );
            
            // Still return success to prevent information disclosure
            return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<TokensResponseDTO>> RefreshToken(RefreshTokenRequestDTO refreshRequest)
    {
        try
        {
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            TokensResponseDTO response = await _authService.RefreshTokenAsync(refreshRequest.RefreshToken, ipAddress);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing token");
            return StatusCode(500, new { message = "An error occurred while refreshing the token." });
        }
    }

    /// <summary>
    /// Provides a CSRF token for SignalR connections
    /// </summary>
    /// <returns>Success response with token in cookie</returns>
    [HttpGet("csrf")]
    [AllowAnonymous]
    public ActionResult GetCsrfToken()
    {
        // CSRF token is automatically set in a cookie by the middleware for GET requests
        return Ok(new { message = "CSRF token has been set" });
    }

    /// <summary>
    /// Provides a CSRF token for unauthenticated requests (specifically for login/register)
    /// </summary>
    /// <returns>Success response with token in cookie</returns>
    [HttpGet("public-csrf")]
    [AllowAnonymous]
    public ActionResult GetPublicCsrfToken()
    {
        // CSRF token is automatically set in a cookie by the middleware for GET requests
        return Ok(new { message = "Public CSRF token has been set" });
    }

    /// <summary>
    /// Provides detailed information about CSRF tokens for debugging in development
    /// </summary>
    /// <returns>Detailed information about CSRF tokens</returns>
    [HttpGet("debug-csrf")]
    [AllowAnonymous]
    public ActionResult DebugCsrfToken()
    {
        IHostEnvironment environment = HttpContext.RequestServices.GetRequiredService<IHostEnvironment>();
        
        if (!environment.IsDevelopment())
        {
            return NotFound("This endpoint is only available in development mode");
        }
        
        // Generate a new CSRF token using the same algorithm as the middleware
        byte[] tokenBytes = new byte[32];
        using (System.Security.Cryptography.RandomNumberGenerator rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        string newToken = Convert.ToBase64String(tokenBytes);
        
        // Get the token from the request header
        string? headerToken = HttpContext.Request.Headers["X-CSRF-TOKEN"];
        
        // Get the token from the cookie
        string? cookieToken = HttpContext.Request.Cookies["XSRF-TOKEN"];
        
        // Set a new token cookie
        CookieOptions cookieOptions = new CookieOptions
        {
            HttpOnly = false, // JavaScript needs to read this cookie
            Secure = HttpContext.Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.Add(TimeSpan.FromDays(1))
        };
        HttpContext.Response.Cookies.Append("XSRF-TOKEN", newToken, cookieOptions);
        
        // Return detailed information about CSRF tokens
        return Ok(new 
        { 
            Message = "New CSRF token has been set",
            Debug = new
            {
                NewToken = newToken,
                ExistingCookieToken = cookieToken,
                HeaderToken = headerToken,
                TokensMatch = !string.IsNullOrEmpty(headerToken) && !string.IsNullOrEmpty(cookieToken) && 
                              WebUtility.UrlDecode(headerToken) == WebUtility.UrlDecode(cookieToken),
                CookieOptions = new
                {
                    HttpOnly = cookieOptions.HttpOnly,
                    Secure = cookieOptions.Secure,
                    SameSite = cookieOptions.SameSite.ToString(),
                    ExpirationTime = cookieOptions.Expires?.ToString()
                },
                Instructions = "To use this token, include it in the X-CSRF-TOKEN header in subsequent requests"
            }
        });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<UserDTO>> GetProfile()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            UserDTO profile = await _authService.GetUserProfileAsync(userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user profile");
            return StatusCode(500, "An error occurred while retrieving your profile.");
        }
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UserProfileUpdateDTO profileUpdateDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _authService.UpdateUserProfileAsync(userId, profileUpdateDto);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return StatusCode(500, "An error occurred while updating your profile.");
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(PasswordChangeDTO changePasswordDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _authService.ChangePasswordAsync(userId, changePasswordDto, ipAddress);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, "An error occurred while changing your password.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAllUsers()
    {
        try
        {
            IEnumerable<UserDTO> users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users");
            return StatusCode(500, "An error occurred while retrieving users.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] string role)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _authService.UpdateUserRoleAsync(id, role, adminId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user role");
            return StatusCode(500, "An error occurred while updating the user role.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _authService.DeleteUserAsync(id, currentUserId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user");
            return StatusCode(500, "An error occurred while deleting the user.");
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users/change-password")]
    public async Task<IActionResult> AdminChangePassword(AdminPasswordChangeDTO changePasswordDto)
    {
        try
        {
            int adminId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            await _authService.AdminChangePasswordAsync(changePasswordDto, adminId, ipAddress);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during admin password change for user {UserId}", changePasswordDto.UserId);
            return StatusCode(500, "An error occurred while changing the user's password.");
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDTO logoutRequest)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        string? username = User.FindFirstValue(ClaimTypes.Name);
        
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _authService.LogoutAsync(userId, logoutRequest.RefreshToken, ipAddress);
            
            // Log successful logout to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGOUT",
                action: "POST /api/auth/logout",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                username: username,
                resource: "/api/auth/logout",
                severity: "INFO",
                details: $"User logged out successfully: {username}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            // Clear cookies
            Response.Headers.Append("Clear-Site-Data", "\"cache\", \"cookies\", \"storage\"");
            
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            // Log logout attempt for non-existent user
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGOUT_FAILED",
                action: "POST /api/auth/logout",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: username,
                resource: "/api/auth/logout",
                severity: "MEDIUM",
                details: "Logout failed: User not found",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return NotFound("User not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            
            // Log logout error
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGOUT_ERROR",
                action: "POST /api/auth/logout",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: username,
                resource: "/api/auth/logout",
                severity: "HIGH",
                details: $"Logout error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return StatusCode(500, "An error occurred during logout");
        }
    }
} 