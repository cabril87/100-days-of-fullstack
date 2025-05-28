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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using AutoMapper;
using System.Security.Cryptography;
using System.Text;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class SessionManagementService : ISessionManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SessionManagementService> _logger;
        private readonly IMapper _mapper;
        private readonly IGeolocationService _geolocationService;

        // Configuration constants
        private const int MAX_CONCURRENT_SESSIONS = 5;
        private const int SESSION_TIMEOUT_MINUTES = 120; // 2 hours
        private const int CLEANUP_INTERVAL_HOURS = 1;

        public SessionManagementService(
            ApplicationDbContext context,
            ILogger<SessionManagementService> logger,
            IMapper mapper,
            IGeolocationService geolocationService)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
            _geolocationService = geolocationService;
        }

        public async Task<string> CreateSessionAsync(int userId, string ipAddress, string? userAgent)
        {
            try
            {
                // Check if user has exceeded session limit
                if (await IsSessionLimitExceededAsync(userId))
                {
                    // Terminate oldest session to make room
                    await TerminateOldestSessionAsync(userId);
                }

                // Get geolocation and device information
                var geolocation = await _geolocationService.GetLocationAsync(ipAddress);
                var deviceInfo = ParseUserAgent(userAgent);

                // Generate secure session token
                string sessionToken = GenerateSecureToken();

                // Check for suspicious session characteristics
                bool isSuspicious = await IsSuspiciousSessionCreationAsync(userId, ipAddress, userAgent);

                var session = new UserSession
                {
                    UserId = userId,
                    SessionToken = sessionToken,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    CreatedAt = DateTime.UtcNow,
                    LastActivity = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(SESSION_TIMEOUT_MINUTES),
                    IsActive = true,
                    Country = geolocation?.Country,
                    City = geolocation?.City,
                    CountryCode = geolocation?.CountryCode,
                    Latitude = geolocation?.Latitude,
                    Longitude = geolocation?.Longitude,
                    DeviceType = deviceInfo.DeviceType,
                    Browser = deviceInfo.Browser,
                    OperatingSystem = deviceInfo.OperatingSystem,
                    IsSuspicious = isSuspicious
                };

                _context.UserSessions.Add(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Session created for user {userId} from {ipAddress}. Suspicious: {isSuspicious}");
                return sessionToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating session for user {userId}");
                throw;
            }
        }

        public async Task<bool> ValidateSessionAsync(string sessionToken)
        {
            try
            {
                var session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken && s.IsActive);

                if (session == null)
                    return false;

                // Check if session has expired
                if (session.ExpiresAt.HasValue && session.ExpiresAt <= DateTime.UtcNow)
                {
                    await TerminateSessionAsync(sessionToken, "Session expired");
                    return false;
                }

                // Update last activity
                await UpdateSessionActivityAsync(sessionToken);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating session {sessionToken}");
                return false;
            }
        }

        public async Task UpdateSessionActivityAsync(string sessionToken)
        {
            try
            {
                var session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken && s.IsActive);

                if (session != null)
                {
                    session.LastActivity = DateTime.UtcNow;
                    session.ExpiresAt = DateTime.UtcNow.AddMinutes(SESSION_TIMEOUT_MINUTES);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating session activity for {sessionToken}");
            }
        }

        public async Task TerminateSessionAsync(string sessionToken, string reason)
        {
            try
            {
                var session = await _context.UserSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);

                if (session != null)
                {
                    session.IsActive = false;
                    session.TerminatedAt = DateTime.UtcNow;
                    session.TerminationReason = reason;
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"Session {sessionToken} terminated for user {session.UserId}. Reason: {reason}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error terminating session {sessionToken}");
                throw;
            }
        }

        public async Task TerminateAllUserSessionsAsync(int userId, string reason, string? excludeSessionToken = null)
        {
            try
            {
                var sessions = await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .ToListAsync();

                if (!string.IsNullOrEmpty(excludeSessionToken))
                {
                    sessions = sessions.Where(s => s.SessionToken != excludeSessionToken).ToList();
                }

                foreach (var session in sessions)
                {
                    session.IsActive = false;
                    session.TerminatedAt = DateTime.UtcNow;
                    session.TerminationReason = reason;
                }

                await _context.SaveChangesAsync();

                _logger.LogWarning($"All sessions terminated for user {userId}. Reason: {reason}. Count: {sessions.Count}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error terminating all sessions for user {userId}");
                throw;
            }
        }

        public async Task<SessionManagementDTO> GetSessionManagementDataAsync()
        {
            try
            {
                var activeSessions = await GetActiveSessionsAsync();
                var recentSessions = await GetRecentSessionsAsync();
                var securitySummary = await GetSessionSecuritySummaryAsync();

                return new SessionManagementDTO
                {
                    TotalActiveSessions = activeSessions.Count,
                    MaxConcurrentSessions = MAX_CONCURRENT_SESSIONS,
                    DefaultSessionTimeout = TimeSpan.FromMinutes(SESSION_TIMEOUT_MINUTES),
                    ActiveSessions = activeSessions.Take(20).ToList(),
                    RecentSessions = recentSessions.Take(20).ToList(),
                    SecuritySummary = securitySummary
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session management data");
                throw;
            }
        }

        public async Task<List<UserSessionDTO>> GetActiveSessionsAsync(int? userId = null)
        {
            try
            {
                var query = _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.IsActive);

                if (userId.HasValue)
                {
                    query = query.Where(s => s.UserId == userId.Value);
                }

                var sessions = await query
                    .OrderByDescending(s => s.LastActivity)
                    .ToListAsync();

                return sessions.Select(s => MapToSessionDTO(s)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active sessions");
                throw;
            }
        }

        public async Task<List<UserSessionDTO>> GetUserSessionsAsync(int userId, bool activeOnly = false)
        {
            try
            {
                var query = _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.UserId == userId);

                if (activeOnly)
                {
                    query = query.Where(s => s.IsActive);
                }

                var sessions = await query
                    .OrderByDescending(s => s.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return sessions.Select(s => MapToSessionDTO(s)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting sessions for user {userId}");
                throw;
            }
        }

        public async Task<bool> IsSessionLimitExceededAsync(int userId)
        {
            try
            {
                int activeSessionCount = await GetActiveSessionCountAsync(userId);
                return activeSessionCount >= MAX_CONCURRENT_SESSIONS;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking session limit for user {userId}");
                return false;
            }
        }

        public async Task CleanupExpiredSessionsAsync()
        {
            try
            {
                var expiredSessions = await _context.UserSessions
                    .Where(s => s.IsActive && s.ExpiresAt.HasValue && s.ExpiresAt <= DateTime.UtcNow)
                    .ToListAsync();

                foreach (var session in expiredSessions)
                {
                    session.IsActive = false;
                    session.TerminatedAt = DateTime.UtcNow;
                    session.TerminationReason = "Automatic cleanup - session expired";
                }

                await _context.SaveChangesAsync();

                if (expiredSessions.Any())
                {
                    _logger.LogInformation($"Cleaned up {expiredSessions.Count} expired sessions");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired sessions");
            }
        }

        public async Task<UserSessionDTO?> GetSessionByTokenAsync(string sessionToken)
        {
            try
            {
                var session = await _context.UserSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);

                return session != null ? MapToSessionDTO(session) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting session by token {sessionToken}");
                return null;
            }
        }

        public async Task<int> GetActiveSessionCountAsync(int userId)
        {
            try
            {
                return await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting active session count for user {userId}");
                return 0;
            }
        }

        public async Task<bool> IsSuspiciousSessionAsync(string sessionToken)
        {
            try
            {
                var session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);

                return session?.IsSuspicious == true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if session is suspicious: {sessionToken}");
                return false;
            }
        }

        public async Task MarkSessionSuspiciousAsync(string sessionToken, string reason)
        {
            try
            {
                var session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);

                if (session != null)
                {
                    session.IsSuspicious = true;
                    session.SecurityNotes = reason;
                    await _context.SaveChangesAsync();

                    _logger.LogWarning($"Session {sessionToken} marked as suspicious. Reason: {reason}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error marking session as suspicious: {sessionToken}");
                throw;
            }
        }

        private async Task<List<UserSessionDTO>> GetRecentSessionsAsync()
        {
            try
            {
                var sessions = await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => !s.IsActive)
                    .OrderByDescending(s => s.TerminatedAt ?? s.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return sessions.Select(s => MapToSessionDTO(s)).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent sessions");
                return new List<UserSessionDTO>();
            }
        }

        private async Task<SessionSecuritySummaryDTO> GetSessionSecuritySummaryAsync()
        {
            try
            {
                var last24Hours = DateTime.UtcNow.AddHours(-24);
                
                var recentSessions = await _context.UserSessions
                    .Where(s => s.CreatedAt >= last24Hours)
                    .ToListAsync();

                var suspiciousSessions = recentSessions.Count(s => s.IsSuspicious);
                var uniqueLocations = recentSessions
                    .Where(s => !string.IsNullOrEmpty(s.Country))
                    .Select(s => $"{s.Country}, {s.City}")
                    .Distinct()
                    .Count();

                var expiredSessions = recentSessions.Count(s => !s.IsActive && s.TerminationReason == "Session expired");

                var unusualLocations = recentSessions
                    .Where(s => s.IsSuspicious && !string.IsNullOrEmpty(s.Country))
                    .Select(s => $"{s.Country}, {s.City}")
                    .Distinct()
                    .ToList();

                var newDevices = recentSessions
                    .Where(s => !string.IsNullOrEmpty(s.DeviceType))
                    .GroupBy(s => s.DeviceType)
                    .Select(g => $"{g.Key} ({g.Count()} sessions)")
                    .ToList();

                return new SessionSecuritySummaryDTO
                {
                    SuspiciousSessions = suspiciousSessions,
                    UniqueLocations = uniqueLocations,
                    ExpiredSessions = expiredSessions,
                    UnusualLocations = unusualLocations,
                    NewDevices = newDevices
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session security summary");
                return new SessionSecuritySummaryDTO();
            }
        }

        private async Task TerminateOldestSessionAsync(int userId)
        {
            try
            {
                var oldestSession = await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .OrderBy(s => s.LastActivity)
                    .FirstOrDefaultAsync();

                if (oldestSession != null)
                {
                    await TerminateSessionAsync(oldestSession.SessionToken, "Session limit exceeded - oldest session terminated");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error terminating oldest session for user {userId}");
            }
        }

        private async Task<bool> IsSuspiciousSessionCreationAsync(int userId, string ipAddress, string? userAgent)
        {
            try
            {
                // Check for unusual location
                bool isSuspiciousLocation = await _geolocationService.IsLocationSuspiciousAsync(ipAddress, userId);
                if (isSuspiciousLocation)
                    return true;

                // Check for rapid session creation
                var lastMinute = DateTime.UtcNow.AddMinutes(-1);
                int recentSessions = await _context.UserSessions
                    .Where(s => s.UserId == userId && s.CreatedAt >= lastMinute)
                    .CountAsync();

                if (recentSessions >= 3)
                    return true;

                // Check for unusual user agent
                if (string.IsNullOrEmpty(userAgent) || userAgent.Length < 10)
                    return true;

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if session creation is suspicious");
                return false;
            }
        }

        private UserSessionDTO MapToSessionDTO(UserSession session)
        {
            return new UserSessionDTO
            {
                Id = session.Id,
                UserId = session.UserId,
                Username = session.User?.Username ?? "Unknown",
                SessionToken = session.SessionToken,
                IpAddress = session.IpAddress,
                UserAgent = session.UserAgent,
                CreatedAt = session.CreatedAt,
                LastActivity = session.LastActivity,
                ExpiresAt = session.ExpiresAt,
                IsActive = session.IsActive,
                Country = session.Country,
                City = session.City,
                CountryCode = session.CountryCode,
                Latitude = session.Latitude,
                Longitude = session.Longitude,
                DeviceType = session.DeviceType,
                Browser = session.Browser,
                OperatingSystem = session.OperatingSystem,
                IsSuspicious = session.IsSuspicious,
                SecurityNotes = session.SecurityNotes,
                SessionDuration = session.IsActive ? 
                    DateTime.UtcNow - session.CreatedAt : 
                    (session.TerminatedAt ?? DateTime.UtcNow) - session.CreatedAt
            };
        }

        private string GenerateSecureToken()
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] tokenBytes = new byte[32];
            rng.GetBytes(tokenBytes);
            return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }

        private (string DeviceType, string Browser, string OperatingSystem) ParseUserAgent(string? userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return ("Unknown", "Unknown", "Unknown");

            string deviceType = "Desktop";
            string browser = "Unknown";
            string os = "Unknown";

            // Simple user agent parsing (in production, use a proper library)
            if (userAgent.Contains("Mobile") || userAgent.Contains("Android") || userAgent.Contains("iPhone"))
                deviceType = "Mobile";
            else if (userAgent.Contains("Tablet") || userAgent.Contains("iPad"))
                deviceType = "Tablet";

            if (userAgent.Contains("Chrome"))
                browser = "Chrome";
            else if (userAgent.Contains("Firefox"))
                browser = "Firefox";
            else if (userAgent.Contains("Safari"))
                browser = "Safari";
            else if (userAgent.Contains("Edge"))
                browser = "Edge";

            if (userAgent.Contains("Windows"))
                os = "Windows";
            else if (userAgent.Contains("Mac"))
                os = "macOS";
            else if (userAgent.Contains("Linux"))
                os = "Linux";
            else if (userAgent.Contains("Android"))
                os = "Android";
            else if (userAgent.Contains("iOS"))
                os = "iOS";

            return (deviceType, browser, os);
        }
    }
} 