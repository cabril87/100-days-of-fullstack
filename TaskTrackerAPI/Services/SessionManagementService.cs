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
using Microsoft.Extensions.Logging;
using AutoMapper;
using System.Security.Cryptography;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class SessionManagementService : ISessionManagementService
    {
        private readonly ISessionManagementRepository _sessionRepository;
        private readonly ILogger<SessionManagementService> _logger;
        private readonly IMapper _mapper;
        private readonly IGeolocationService _geolocationService;

        // Configuration constants
        private const int MAX_CONCURRENT_SESSIONS = 5;
        private const int SESSION_TIMEOUT_MINUTES = 120; // 2 hours
        private const int CLEANUP_INTERVAL_HOURS = 1;

        public SessionManagementService(
            ISessionManagementRepository sessionRepository,
            ILogger<SessionManagementService> logger,
            IMapper mapper,
            IGeolocationService geolocationService)
        {
            _sessionRepository = sessionRepository;
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
                GeolocationDTO? geolocation = await _geolocationService.GetLocationAsync(ipAddress);
                (string DeviceType, string Browser, string OperatingSystem) deviceInfo = ParseUserAgent(userAgent);

                // Generate secure session token
                string sessionToken = GenerateSecureToken();

                // Check for suspicious session characteristics
                bool isSuspicious = await IsSuspiciousSessionCreationAsync(userId, ipAddress, userAgent);

                UserSession session = new UserSession
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

                UserSession createdSession = await _sessionRepository.CreateSessionAsync(session);

                _logger.LogInformation("Session created for user {UserId} from {IPAddress}. Suspicious: {IsSuspicious}", userId, ipAddress, isSuspicious);
                return sessionToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating session for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> ValidateSessionAsync(string sessionToken)
        {
            try
            {
                UserSession? session = await _sessionRepository.GetSessionByTokenAsync(sessionToken);

                if (session == null || !session.IsActive)
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
                _logger.LogError(ex, "Error validating session {SessionToken}", sessionToken);
                return false;
            }
        }

        public async Task UpdateSessionActivityAsync(string sessionToken)
        {
            try
            {
                DateTime newExpiryTime = DateTime.UtcNow.AddMinutes(SESSION_TIMEOUT_MINUTES);
                await _sessionRepository.UpdateSessionActivityAsync(sessionToken, newExpiryTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating session activity for {SessionToken}", sessionToken);
            }
        }

        public async Task TerminateSessionAsync(string sessionToken, string reason)
        {
            try
            {
                bool terminated = await _sessionRepository.TerminateSessionAsync(sessionToken, reason);

                if (terminated)
                {
                    _logger.LogInformation("Session {SessionToken} terminated. Reason: {Reason}", sessionToken, reason);
                }
                else
                {
                    _logger.LogWarning("Session {SessionToken} not found for termination", sessionToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating session {SessionToken}", sessionToken);
                throw;
            }
        }

        public async Task TerminateAllUserSessionsAsync(int userId, string reason, string? excludeSessionToken = null)
        {
            try
            {
                int terminatedCount = await _sessionRepository.TerminateUserSessionsAsync(userId, reason, excludeSessionToken);

                _logger.LogWarning("All sessions terminated for user {UserId}. Reason: {Reason}. Count: {Count}", userId, reason, terminatedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating all sessions for user {UserId}", userId);
                throw;
            }
        }

        public async Task<SessionManagementDTO> GetSessionManagementDataAsync()
        {
            try
            {
                List<UserSessionDTO> activeSessions = await GetActiveSessionsAsync();
                List<UserSessionDTO> recentSessions = await GetRecentSessionsAsync();
                SessionSecuritySummaryDTO securitySummary = await GetSessionSecuritySummaryAsync();

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
                IEnumerable<UserSession> sessions;
                
                if (userId.HasValue)
                {
                    sessions = await _sessionRepository.GetActiveSessionsByUserAsync(userId.Value);
                }
                else
                {
                    sessions = await _sessionRepository.GetActiveSessionsAsync(100);
                }

                List<UserSessionDTO> sessionDTOs = sessions.Select(s => MapToSessionDTO(s)).ToList();
                return sessionDTOs;
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
                IEnumerable<UserSession> sessions;
                
                if (activeOnly)
                {
                    sessions = await _sessionRepository.GetActiveSessionsByUserAsync(userId);
                }
                else
                {
                    sessions = await _sessionRepository.GetUserSessionsAsync(userId, 50);
                }

                List<UserSessionDTO> sessionDTOs = sessions.Select(s => MapToSessionDTO(s)).ToList();
                return sessionDTOs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sessions for user {UserId}", userId);
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
                _logger.LogError(ex, "Error checking session limit for user {UserId}", userId);
                return false;
            }
        }

        public async Task CleanupExpiredSessionsAsync()
        {
            try
            {
                IEnumerable<UserSession> expiredSessions = await _sessionRepository.GetExpiredSessionsAsync();

                List<UserSession> expiredSessionsList = expiredSessions.ToList();
                foreach (UserSession session in expiredSessionsList)
                {
                    await _sessionRepository.TerminateSessionAsync(session.SessionToken, "Automatic cleanup - session expired");
                }

                if (expiredSessionsList.Any())
                {
                    _logger.LogInformation("Cleaned up {Count} expired sessions", expiredSessionsList.Count);
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
                UserSession? session = await _sessionRepository.GetSessionByTokenAsync(sessionToken);
                return session != null ? MapToSessionDTO(session) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting session by token {SessionToken}", sessionToken);
                return null;
            }
        }

        public async Task<int> GetActiveSessionCountAsync(int userId)
        {
            try
            {
                return await _sessionRepository.GetActiveSessionCountAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active session count for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<bool> IsSuspiciousSessionAsync(string sessionToken)
        {
            try
            {
                UserSession? session = await _sessionRepository.GetSessionByTokenAsync(sessionToken);
                return session?.IsSuspicious == true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if session is suspicious: {SessionToken}", sessionToken);
                return false;
            }
        }

        public async Task MarkSessionSuspiciousAsync(string sessionToken, string reason)
        {
            try
            {
                bool marked = await _sessionRepository.MarkSessionSuspiciousAsync(sessionToken, reason);

                if (marked)
                {
                    _logger.LogWarning("Session {SessionToken} marked as suspicious. Reason: {Reason}", sessionToken, reason);
                }
                else
                {
                    _logger.LogWarning("Session {SessionToken} not found for marking suspicious", sessionToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking session as suspicious: {SessionToken}", sessionToken);
                throw;
            }
        }

        private async Task<List<UserSessionDTO>> GetRecentSessionsAsync()
        {
            try
            {
                IEnumerable<UserSession> sessions = await _sessionRepository.GetRecentTerminatedSessionsAsync(50);
                List<UserSessionDTO> sessionDTOs = sessions.Select(s => MapToSessionDTO(s)).ToList();
                return sessionDTOs;
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
                (int TotalActiveSessions, int SuspiciousSessions, int UniqueUsers, int SessionsCreated) sessionStats = 
                    await _sessionRepository.GetSessionStatisticsAsync(24);

                IEnumerable<(string Country, string City, int SessionCount)> locationStats = 
                    await _sessionRepository.GetSessionLocationStatisticsAsync(24);

                IEnumerable<(string DeviceType, string Browser, int SessionCount)> deviceStats = 
                    await _sessionRepository.GetDeviceStatisticsAsync(24);

                List<string> unusualLocations = locationStats
                    .Where(ls => ls.SessionCount <= 2) // Consider locations with few sessions as unusual
                    .Select(ls => $"{ls.Country}, {ls.City}")
                    .ToList();

                List<string> newDevices = deviceStats
                    .Select(ds => $"{ds.DeviceType} - {ds.Browser} ({ds.SessionCount} sessions)")
                    .ToList();

                return new SessionSecuritySummaryDTO
                {
                    SuspiciousSessions = sessionStats.SuspiciousSessions,
                    UniqueLocations = locationStats.Count(),
                    ExpiredSessions = 0, // Could be enhanced with expired session count from repository
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
                UserSession? oldestSession = await _sessionRepository.GetOldestActiveSessionAsync(userId);

                if (oldestSession != null)
                {
                    await TerminateSessionAsync(oldestSession.SessionToken, "Session limit exceeded - oldest session terminated");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating oldest session for user {UserId}", userId);
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
                DateTime lastMinute = DateTime.UtcNow.AddMinutes(-1);
                IEnumerable<UserSession> recentSessions = await _sessionRepository.GetSessionsInRangeAsync(lastMinute, DateTime.UtcNow);
                List<UserSession> userRecentSessions = recentSessions.Where(s => s.UserId == userId).ToList();

                if (userRecentSessions.Count >= 3)
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
            // Generate device ID based on browser and OS
            string deviceId = $"{session.DeviceType ?? "Unknown"}_{session.Browser ?? "Unknown"}_{session.OperatingSystem ?? "Unknown"}".Replace(" ", "");
            
            // Create location string for frontend compatibility
            string? location = null;
            if (!string.IsNullOrEmpty(session.City) && !string.IsNullOrEmpty(session.Country))
            {
                location = $"{session.City}, {session.Country}";
            }
            else if (!string.IsNullOrEmpty(session.Country))
            {
                location = session.Country;
            }

            // Create device name for frontend display
            string? deviceName = null;
            if (!string.IsNullOrEmpty(session.Browser) && !string.IsNullOrEmpty(session.OperatingSystem))
            {
                deviceName = $"{session.Browser} on {session.OperatingSystem}";
            }

            return new UserSessionDTO
            {
                Id = session.Id,
                UserId = session.UserId,
                Username = session.User?.Username ?? "Unknown",
                SessionToken = session.SessionToken,
                
                // Frontend compatibility fields
                DeviceId = deviceId,
                DeviceName = deviceName,
                Location = location,
                IsTrusted = !session.IsSuspicious, // Inverse of suspicious for now
                CreatedAt = session.CreatedAt.ToString("O"), // ISO 8601 format
                LastActivityAt = session.LastActivity.ToString("O"), // ISO 8601 format  
                ExpiresAt = session.ExpiresAt?.ToString("O") ?? string.Empty,
                
                // All original security fields preserved
                IpAddress = session.IpAddress,
                UserAgent = session.UserAgent,
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
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
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