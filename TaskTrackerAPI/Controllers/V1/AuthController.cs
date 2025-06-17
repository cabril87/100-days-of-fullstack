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
using TaskTrackerAPI.Attributes;
using System.Linq;

namespace TaskTrackerAPI.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly ISecurityMonitoringService _securityMonitoringService;
    private readonly IFailedLoginService _failedLoginService;
    private readonly IPasswordResetService _passwordResetService;
    private readonly IMFAService _mfaService;

    public AuthController(
        IAuthService authService, 
        ILogger<AuthController> logger, 
        ISecurityMonitoringService securityMonitoringService, 
        IFailedLoginService failedLoginService,
        IPasswordResetService passwordResetService,
        IMFAService mfaService)
    {
        _authService = authService;
        _logger = logger;
        _securityMonitoringService = securityMonitoringService;
        _failedLoginService = failedLoginService;
        _passwordResetService = passwordResetService;
        _mfaService = mfaService;
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
            
            // Send password reset email
            await _passwordResetService.SendPasswordResetEmailAsync(forgotPasswordRequest.Email);
            
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
            
            // Always return success to prevent email enumeration attacks
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

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(PasswordResetConfirmDTO resetPasswordRequest)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            _logger.LogInformation("Password reset attempt with token: {Token}", resetPasswordRequest.Token);
            
            // Validate and reset password
            bool success = await _passwordResetService.ResetPasswordAsync(resetPasswordRequest.Token, resetPasswordRequest.NewPassword);
            
            if (success)
            {
                // Log successful password reset
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "PASSWORD_RESET_SUCCESS",
                    action: "POST /api/auth/reset-password",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    resource: "/api/auth/reset-password",
                    severity: "INFO",
                    details: "Password reset completed successfully",
                    isSuccessful: true,
                    isSuspicious: false
                );
                
                return Ok(new { message = "Password has been reset successfully. You can now log in with your new password." });
            }
            else
            {
                // Log failed password reset
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "PASSWORD_RESET_FAILED",
                    action: "POST /api/auth/reset-password",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    resource: "/api/auth/reset-password",
                    severity: "MEDIUM",
                    details: "Password reset failed - invalid or expired token",
                    isSuccessful: false,
                    isSuspicious: true
                );
                
                return BadRequest(new { message = "Invalid or expired reset token. Please request a new password reset." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            
            // Log password reset error
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "PASSWORD_RESET_ERROR",
                action: "POST /api/auth/reset-password",
                ipAddress: ipAddress,
                userAgent: userAgent,
                resource: "/api/auth/reset-password",
                severity: "HIGH",
                details: $"Password reset error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return StatusCode(500, new { message = "An error occurred while resetting your password. Please try again." });
        }
    }

    [HttpGet("validate-reset-token")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateResetToken([FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest(new { message = "Token is required" });
            }
            
            bool isValid = await _passwordResetService.ValidateResetTokenAsync(token);
            
            return Ok(new { valid = isValid });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating reset token");
            return StatusCode(500, new { message = "An error occurred while validating the token." });
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

    [RequireGlobalAdmin] // Only Global Admins can view all users
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

    [RequireGlobalAdmin] // Only Global Admins can change user roles
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

    [RequireGlobalAdmin] // Only Global Admins can delete users
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

    [RequireAdminOrSupport] // Global Admins and Customer Support can reset passwords
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
                details: "User logged out successfully",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout for user {Username}: {ErrorMessage}", username, ex.Message);
            
            // Log logout error
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_LOGOUT_ERROR",
                action: "POST /api/auth/logout",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: username,
                resource: "/api/auth/logout",
                severity: "MEDIUM",
                details: $"Logout error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );
            
            return StatusCode(500, new { message = "An error occurred during logout" });
        }
    }

    /// <summary>
    /// Login with HTTP-only cookies for enhanced security (Server Components)
    /// </summary>
    [HttpPost("login/cookie")]
    [AllowAnonymous]
    public async Task<ActionResult> LoginWithCookie(UserLoginDTO userLoginDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            _logger.LogInformation("Cookie login request received: {@UserLoginDto}", new { Email = userLoginDto.EmailOrUsername });
            
            // Check if account is locked out
            bool isLockedOut = await _failedLoginService.IsAccountLockedAsync(userLoginDto.EmailOrUsername);
            if (isLockedOut)
            {
                _logger.LogWarning("Cookie login attempt for locked account: {Email}", userLoginDto.EmailOrUsername);
                
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "ACCOUNT_LOCKOUT_ATTEMPT",
                    action: "POST /api/auth/login/cookie",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    username: userLoginDto.EmailOrUsername,
                    resource: "/api/auth/login/cookie",
                    severity: "HIGH",
                    details: "Cookie login attempt on locked account",
                isSuccessful: false,
                isSuspicious: true
            );
            
                return Unauthorized(new { message = "Account is temporarily locked due to multiple failed login attempts. Please try again later." });
            }
            
            TokensResponseDTO response = await _authService.LoginAsync(userLoginDto, ipAddress, userAgent);
            
            // Set HTTP-only cookies for enhanced security
            // Development-friendly settings that work with HTTP
            bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            CookieOptions accessTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Allow HTTP in development, require HTTPS in production
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict, // More permissive in dev
                Expires = DateTimeOffset.UtcNow.AddMinutes(15), // Short expiry for access token
                Path = "/",
                IsEssential = true
            };
            
            CookieOptions refreshTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Allow HTTP in development, require HTTPS in production
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict, // More permissive in dev
                Expires = DateTimeOffset.UtcNow.AddDays(7), // Longer expiry for refresh token
                Path = "/", // Change from "/api/auth" to "/" for broader access in development
                IsEssential = true
            };
            
            Response.Cookies.Append("access_token", response.AccessToken, accessTokenOptions);
            Response.Cookies.Append("refresh_token", response.RefreshToken, refreshTokenOptions);
            
            _logger.LogInformation("User logged in successfully with cookies: {Email}", userLoginDto.EmailOrUsername);
            
            // Log successful cookie login to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_COOKIE_LOGIN",
                action: "POST /api/auth/login/cookie",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: response.User.Id,
                username: response.User.Username,
                resource: "/api/auth/login/cookie",
                severity: "INFO",
                details: $"User logged in successfully with cookies: {userLoginDto.EmailOrUsername}",
                isSuccessful: true,
                isSuspicious: false
            );
            
            // Return user info without tokens (tokens are in HTTP-only cookies)
            return Ok(new
            {
                user = response.User,
                message = "Logged in successfully"
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized cookie login: {Message}", ex.Message);
            
            await _failedLoginService.LogFailedLoginAttemptAsync(
                userLoginDto.EmailOrUsername,
                ipAddress,
                userAgent,
                ex.Message
            );
            
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_COOKIE_LOGIN_FAILED",
                action: "POST /api/auth/login/cookie",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: userLoginDto.EmailOrUsername,
                resource: "/api/auth/login/cookie",
                severity: "MEDIUM",
                details: $"Cookie login failed: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cookie login for {Email}: {ErrorMessage}", 
                userLoginDto.EmailOrUsername, ex.Message);
            
            await _failedLoginService.LogFailedLoginAttemptAsync(
                userLoginDto.EmailOrUsername,
                ipAddress,
                userAgent,
                $"System error: {ex.Message}"
            );
            
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_COOKIE_LOGIN_ERROR",
                action: "POST /api/auth/login/cookie",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: userLoginDto.EmailOrUsername,
                resource: "/api/auth/login/cookie",
                severity: "HIGH",
                details: $"Cookie login error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: true
            );
            
            return StatusCode(500, new { message = "An error occurred during login. Please try again later." });
        }
    }

    /// <summary>
    /// Logout with HTTP-only cookies cleanup
    /// </summary>
    [HttpPost("logout/cookie")]
    [Authorize]
    public async Task<IActionResult> LogoutWithCookie()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        string? username = User.FindFirstValue(ClaimTypes.Name);
        
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // Get refresh token from cookie
            string? refreshToken = Request.Cookies["refresh_token"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.LogoutAsync(userId, refreshToken, ipAddress);
            }
            
            // Clear HTTP-only cookies
            bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            CookieOptions clearOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Allow HTTP in development
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(-1), // Expire immediately
                Path = "/"
            };
            
            Response.Cookies.Append("access_token", "", clearOptions);
            Response.Cookies.Append("refresh_token", "", new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Allow HTTP in development
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(-1),
                Path = "/"
            });
            
            // Log successful logout to security audit
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_COOKIE_LOGOUT",
                action: "POST /api/auth/logout/cookie",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                username: username,
                resource: "/api/auth/logout/cookie",
                severity: "INFO",
                details: "User logged out successfully with cookie cleanup",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cookie logout for user {Username}: {ErrorMessage}", username, ex.Message);
            
            // Log logout error
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "USER_COOKIE_LOGOUT_ERROR",
                action: "POST /api/auth/logout/cookie",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: username,
                resource: "/api/auth/logout/cookie",
                severity: "MEDIUM",
                details: $"Cookie logout error: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );
            
            return StatusCode(500, new { message = "An error occurred during logout" });
        }
    }

    /// <summary>
    /// Refresh access token using HTTP-only refresh cookie
    /// </summary>
    [HttpPost("refresh-token/cookie")]
    [AllowAnonymous]
    public async Task<ActionResult> RefreshTokenWithCookie()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            string? refreshToken = Request.Cookies["refresh_token"];
            
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "Refresh token not found" });
            }
            
            RefreshTokenRequestDTO refreshRequest = new RefreshTokenRequestDTO
            {
                RefreshToken = refreshToken
            };
            
            TokensResponseDTO response = await _authService.RefreshTokenAsync(refreshRequest.RefreshToken, ipAddress);
            
            // Update HTTP-only cookies with new tokens
            // Development-friendly settings that work with HTTP
            bool isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

            CookieOptions accessTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Allow HTTP in development, require HTTPS in production
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddMinutes(15),
                Path = "/",
                IsEssential = true
            };
            
            CookieOptions refreshTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment, // Allow HTTP in development, require HTTPS in production
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/", // Broader access in development
                IsEssential = true
            };
            
            Response.Cookies.Append("access_token", response.AccessToken, accessTokenOptions);
            Response.Cookies.Append("refresh_token", response.RefreshToken, refreshTokenOptions);
            
            return Ok(new
            {
                user = response.User,
                message = "Token refreshed successfully"
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Unauthorized token refresh: {Message}", ex.Message);
            
            // Clear invalid cookies
            Response.Cookies.Delete("access_token");
            Response.Cookies.Delete("refresh_token");
            
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh: {ErrorMessage}", ex.Message);
            return StatusCode(500, new { message = "An error occurred during token refresh" });
        }
    }

    /// <summary>
    /// Get current user from HTTP-only cookie authentication
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDTO>> GetCurrentUser()
    {
        try
        {
            // Debug logging for cookie authentication troubleshooting
            _logger.LogInformation("GetCurrentUser called - User authenticated: {IsAuthenticated}", User.Identity?.IsAuthenticated);

            // Log available claims
            foreach (Claim claim in User.Claims)
            {
                _logger.LogDebug("User Claim: {Type} = {Value}", claim.Type, claim.Value);
            }

            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            UserDTO profile = await _authService.GetUserProfileAsync(userId);

            _logger.LogInformation("Successfully retrieved user profile for userId: {UserId}", userId);
            return Ok(profile);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning("User not found: {Message}", ex.Message);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving current user profile");
            return StatusCode(500, "An error occurred while retrieving your profile.");
        }
    }

    /// <summary>
    /// Gets authentication headers for SignalR connections
    /// </summary>
    /// <returns>Dictionary of headers for authenticated requests</returns>
    [HttpGet("headers")]
    [Authorize]
    public ActionResult<Dictionary<string, string>> GetAuthHeaders()
    {
        try
        {
            Dictionary<string, string> headers = new Dictionary<string, string>
            {
                { "Accept", "application/json" },
                { "Content-Type", "application/json" }
            };

            // Add user ID if available
            if (User.Identity?.IsAuthenticated == true)
            {
                string? userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!string.IsNullOrEmpty(userId))
                {
                    headers["X-User-Id"] = userId;
                }

                string? username = User.FindFirstValue(ClaimTypes.Name);
                if (!string.IsNullOrEmpty(username))
                {
                    headers["X-Username"] = username;
                }
            }

            return Ok(headers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating auth headers");
            return StatusCode(500, new { message = "An error occurred while generating authentication headers." });
        }
    }

    /// <summary>
    /// Test cookie authentication - Development only
    /// </summary>
    [HttpGet("cookie-test")]
    [AllowAnonymous]
    public IActionResult TestCookieAuth()
    {
        string? environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment != "Development")
        {
            return NotFound("This endpoint is only available in development");
        }

        Dictionary<string, string> cookies = Request.Cookies.ToDictionary(c => c.Key, c => c.Key == "access_token" ? "[REDACTED]" : c.Value);
        bool hasAccessToken = Request.Cookies.ContainsKey("access_token");
        bool hasRefreshToken = Request.Cookies.ContainsKey("refresh_token");
        bool hasAuthHeader = Request.Headers.ContainsKey("Authorization");

        return Ok(new
        {
            Message = "Cookie Authentication Test",
            Environment = environment,
            HasAccessTokenCookie = hasAccessToken,
            HasRefreshTokenCookie = hasRefreshToken,
            HasAuthorizationHeader = hasAuthHeader,
            AllCookies = cookies,
            IsAuthenticated = User.Identity?.IsAuthenticated ?? false,
            UserClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
        });
    }

    #region Device Recognition Endpoints

    /// <summary>
    /// Check device recognition status based on device fingerprint
    /// </summary>
    [HttpPost("device-recognition")]
    [AllowAnonymous]
    public async Task<ActionResult> CheckDeviceRecognition([FromBody] DeviceRecognitionRequestDTO request)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            // Basic device recognition logic
            // For now, we'll implement a simple heuristic-based approach
            // In production, this could be enhanced with ML models or more sophisticated device tracking
            
            var deviceRecognition = new
            {
                isRecognized = false, // Default to not recognized for new implementation
                deviceFingerprint = request.DeviceFingerprint,
                lastSeenLocation = (string?)null,
                lastSeenAt = (string?)null,
                riskScore = CalculateRiskScore(request.DeviceFingerprint, ipAddress, userAgent),
                requiresVerification = true
            };

            // Log device recognition check
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "DEVICE_RECOGNITION_CHECK",
                action: "POST /api/auth/device-recognition",
                ipAddress: ipAddress,
                userAgent: userAgent,
                resource: "/api/auth/device-recognition",
                severity: "INFO",
                details: $"Device recognition check performed for fingerprint: {request.DeviceFingerprint.Substring(0, Math.Min(8, request.DeviceFingerprint.Length))}...",
                isSuccessful: true,
                isSuspicious: false
            );

            return Ok(deviceRecognition);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during device recognition check");
            
            // Return safe defaults on error
            return Ok(new
            {
                isRecognized = false,
                deviceFingerprint = request.DeviceFingerprint,
                lastSeenLocation = (string?)null,
                lastSeenAt = (string?)null,
                riskScore = 50,
                requiresVerification = true
            });
        }
    }

    /// <summary>
    /// Calculate risk score based on device fingerprint and connection details
    /// </summary>
    private int CalculateRiskScore(string deviceFingerprint, string ipAddress, string userAgent)
    {
        int riskScore = 30; // Base risk score for new devices
        
        // Increase risk for certain patterns
        if (string.IsNullOrWhiteSpace(deviceFingerprint) || deviceFingerprint.Length < 10)
        {
            riskScore += 20; // Suspicious or malformed fingerprint
        }
        
        if (userAgent.Contains("bot", StringComparison.OrdinalIgnoreCase) || 
            userAgent.Contains("crawler", StringComparison.OrdinalIgnoreCase))
        {
            riskScore += 30; // Bot or crawler
        }
        
        if (ipAddress == "unknown" || ipAddress.StartsWith("127.") || ipAddress.StartsWith("::1"))
        {
            riskScore += 10; // Local or unknown IP
        }
        
        // Cap the risk score
        return Math.Min(riskScore, 100);
    }

    #endregion

    #region MFA Endpoints

    /// <summary>
    /// Initiates MFA setup for the authenticated user
    /// </summary>
    [Authorize]
    [HttpPost("mfa/setup")]
    public async Task<ActionResult<MFASetupInitiateDTO>> InitiateMFASetup()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        string? username = User.FindFirstValue(ClaimTypes.Name);
        
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            MFASetupInitiateDTO setupData = await _mfaService.InitiateMFASetupAsync(userId);
            
            // Log MFA setup initiation
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "MFA_SETUP_INITIATED",
                action: "POST /api/auth/mfa/setup",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                username: username,
                resource: "/api/auth/mfa/setup",
                severity: "INFO",
                details: "MFA setup initiated",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(setupData);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating MFA setup");
            return StatusCode(500, new { message = "An error occurred while setting up MFA." });
        }
    }

    /// <summary>
    /// Completes MFA setup by verifying the first TOTP code
    /// </summary>
    [Authorize]
    [HttpPost("mfa/setup/complete")]
    public async Task<ActionResult<MFABackupCodesDTO>> CompleteMFASetup(MFASetupCompleteDTO completeDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        string? username = User.FindFirstValue(ClaimTypes.Name);
        
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            MFABackupCodesDTO backupCodes = await _mfaService.CompleteMFASetupAsync(userId, completeDto);
            
            // Log MFA setup completion
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "MFA_SETUP_COMPLETED",
                action: "POST /api/auth/mfa/setup/complete",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                username: username,
                resource: "/api/auth/mfa/setup/complete",
                severity: "INFO",
                details: "MFA setup completed successfully",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(backupCodes);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing MFA setup");
            return StatusCode(500, new { message = "An error occurred while completing MFA setup." });
        }
    }

    /// <summary>
    /// Verifies MFA code during login (called after successful password verification)
    /// </summary>
    [HttpPost("mfa/verify")]
    public async Task<ActionResult> VerifyMFA(MFAVerificationDTO verificationDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            // This endpoint would typically be called with a temporary token or session
            // For now, we'll require the user to be authenticated
            if (!User.Identity?.IsAuthenticated == true)
            {
                return Unauthorized(new { message = "Authentication required" });
            }
            
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string? username = User.FindFirstValue(ClaimTypes.Name);
            
            bool isValid = await _mfaService.VerifyMFACodeAsync(userId, verificationDto);
            
            if (isValid)
            {
                // Log successful MFA verification
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "MFA_VERIFICATION_SUCCESS",
                    action: "POST /api/auth/mfa/verify",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    userId: userId,
                    username: username,
                    resource: "/api/auth/mfa/verify",
                    severity: "INFO",
                    details: "MFA verification successful",
                    isSuccessful: true,
                    isSuspicious: false
                );
                
                return Ok(new { message = "MFA verification successful" });
            }
            else
            {
                // Log failed MFA verification
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "MFA_VERIFICATION_FAILED",
                    action: "POST /api/auth/mfa/verify",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    userId: userId,
                    username: username,
                    resource: "/api/auth/mfa/verify",
                    severity: "MEDIUM",
                    details: "MFA verification failed",
                    isSuccessful: false,
                    isSuspicious: true
                );
                
                return Unauthorized(new { message = "Invalid verification code" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying MFA code");
            return StatusCode(500, new { message = "An error occurred while verifying MFA code." });
        }
    }

    /// <summary>
    /// Verifies backup code during login
    /// </summary>
    [HttpPost("mfa/verify-backup")]
    public async Task<ActionResult> VerifyBackupCode(MFABackupCodeDTO backupCodeDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            if (!User.Identity?.IsAuthenticated == true)
            {
                return Unauthorized(new { message = "Authentication required" });
            }
            
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            string? username = User.FindFirstValue(ClaimTypes.Name);
            
            bool isValid = await _mfaService.VerifyBackupCodeAsync(userId, backupCodeDto);
            
            if (isValid)
            {
                // Log successful backup code verification
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "MFA_BACKUP_CODE_SUCCESS",
                    action: "POST /api/auth/mfa/verify-backup",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    userId: userId,
                    username: username,
                    resource: "/api/auth/mfa/verify-backup",
                    severity: "INFO",
                    details: "Backup code verification successful",
                    isSuccessful: true,
                    isSuspicious: false
                );
                
                return Ok(new { message = "Backup code verification successful" });
            }
            else
            {
                // Log failed backup code verification
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "MFA_BACKUP_CODE_FAILED",
                    action: "POST /api/auth/mfa/verify-backup",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    userId: userId,
                    username: username,
                    resource: "/api/auth/mfa/verify-backup",
                    severity: "MEDIUM",
                    details: "Backup code verification failed",
                    isSuccessful: false,
                    isSuspicious: true
                );
                
                return Unauthorized(new { message = "Invalid backup code" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying backup code");
            return StatusCode(500, new { message = "An error occurred while verifying backup code." });
        }
    }

    /// <summary>
    /// Disables MFA for the authenticated user
    /// </summary>
    [Authorize]
    [HttpPost("mfa/disable")]
    public async Task<ActionResult> DisableMFA(MFADisableDTO disableDto)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        string? username = User.FindFirstValue(ClaimTypes.Name);
        
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            await _mfaService.DisableMFAAsync(userId, disableDto);
            
            // Log MFA disable
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "MFA_DISABLED",
                action: "POST /api/auth/mfa/disable",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                username: username,
                resource: "/api/auth/mfa/disable",
                severity: "MEDIUM",
                details: "MFA disabled for user",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(new { message = "MFA disabled successfully" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling MFA");
            return StatusCode(500, new { message = "An error occurred while disabling MFA." });
        }
    }

    /// <summary>
    /// Generates new backup codes for the authenticated user
    /// </summary>
    [Authorize]
    [HttpPost("mfa/backup-codes/regenerate")]
    public async Task<ActionResult<MFABackupCodesDTO>> RegenerateBackupCodes()
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        string? username = User.FindFirstValue(ClaimTypes.Name);
        
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            MFABackupCodesDTO backupCodes = await _mfaService.GenerateNewBackupCodesAsync(userId);
            
            // Log backup codes regeneration
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "MFA_BACKUP_CODES_REGENERATED",
                action: "POST /api/auth/mfa/backup-codes/regenerate",
                ipAddress: ipAddress,
                userAgent: userAgent,
                userId: userId,
                username: username,
                resource: "/api/auth/mfa/backup-codes/regenerate",
                severity: "INFO",
                details: "MFA backup codes regenerated",
                isSuccessful: true,
                isSuspicious: false
            );
            
            return Ok(backupCodes);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error regenerating backup codes");
            return StatusCode(500, new { message = "An error occurred while regenerating backup codes." });
        }
    }

    /// <summary>
    /// Gets MFA status for the authenticated user
    /// </summary>
    [Authorize]
    [HttpGet("mfa/status")]
    public async Task<ActionResult<MFAStatusDTO>> GetMFAStatus()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            MFAStatusDTO status = await _mfaService.GetMFAStatusAsync(userId);
            
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting MFA status");
            return StatusCode(500, new { message = "An error occurred while getting MFA status." });
        }
    }

    #endregion

    #region Account Unlock

    /// <summary>
    /// Requests account unlock via email verification
    /// </summary>
    /// <param name="request">Unlock request details</param>
    /// <returns>Success response</returns>
    [HttpPost("unlock-request")]
    [AllowAnonymous]
    public async Task<ActionResult> RequestAccountUnlock([FromBody] AccountUnlockRequestDTO request)
    {
        string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        string userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
        
        try
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }

            if (string.IsNullOrEmpty(request.Method))
            {
                return BadRequest(new { message = "Unlock method is required" });
            }

            // Check if account is actually locked
            bool isLockedOut = await _failedLoginService.IsAccountLockedAsync(request.Email);
            if (!isLockedOut)
            {
                // Always return success to prevent email enumeration attacks
                return Ok(new { message = "If your account is locked, an unlock email has been sent." });
            }

            // For email verification method, send unlock email
            if (request.Method == "email_verification")
            {
                // Send unlock email using the password reset service (same infrastructure)
                await _passwordResetService.SendPasswordResetEmailAsync(request.Email);
                
                // Log unlock request
                await _securityMonitoringService.LogSecurityAuditAsync(
                    eventType: "ACCOUNT_UNLOCK_REQUEST",
                    action: "POST /api/auth/unlock-request",
                    ipAddress: ipAddress,
                    userAgent: userAgent,
                    username: request.Email,
                    resource: "/api/auth/unlock-request",
                    severity: "INFO",
                    details: $"Account unlock requested via {request.Method} for: {request.Email}",
                    isSuccessful: true,
                    isSuspicious: false
                );
            }
            
            // Always return success to prevent email enumeration attacks
            return Ok(new { message = "If your account is locked, an unlock email has been sent." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing unlock request for {Email}", request.Email);
            
            // Log failed unlock request
            await _securityMonitoringService.LogSecurityAuditAsync(
                eventType: "ACCOUNT_UNLOCK_REQUEST_FAILED",
                action: "POST /api/auth/unlock-request",
                ipAddress: ipAddress,
                userAgent: userAgent,
                username: request.Email ?? "unknown",
                resource: "/api/auth/unlock-request",
                severity: "MEDIUM",
                details: $"Failed unlock request: {ex.Message}",
                isSuccessful: false,
                isSuspicious: false
            );
            
            // Always return success to prevent information disclosure
            return Ok(new { message = "If your account is locked, an unlock email has been sent." });
        }
    }

    #endregion
} 