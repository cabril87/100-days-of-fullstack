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
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for user session management
    /// </summary>
    public class SessionManagementRepository : ISessionManagementRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SessionManagementRepository> _logger;

        public SessionManagementRepository(ApplicationDbContext context, ILogger<SessionManagementRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<UserSession> CreateSessionAsync(UserSession session)
        {
            try
            {
                session.CreatedAt = DateTime.UtcNow;
                session.LastActivity = DateTime.UtcNow;

                _context.UserSessions.Add(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created user session for user {UserId} from IP {IPAddress}", session.UserId, session.IpAddress);
                return session;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user session for user {UserId}", session.UserId);
                throw;
            }
        }

        public async Task<UserSession?> GetSessionByTokenAsync(string sessionToken)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving session by token {SessionToken}", sessionToken);
                return null;
            }
        }

        public async Task<UserSession?> GetSessionByIdAsync(int sessionId)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.Id == sessionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving session by ID {SessionId}", sessionId);
                return null;
            }
        }

        public async Task<UserSession> UpdateSessionAsync(UserSession session)
        {
            try
            {
                _context.UserSessions.Update(session);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated user session {SessionId}", session.Id);
                return session;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user session {SessionId}", session.Id);
                throw;
            }
        }

        public async Task<IEnumerable<UserSession>> GetActiveSessionsByUserAsync(int userId)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.UserId == userId && s.IsActive)
                    .OrderByDescending(s => s.LastActivity)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active sessions for user {UserId}", userId);
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetUserSessionsAsync(int userId, int limit = 50)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.UserId == userId)
                    .OrderByDescending(s => s.CreatedAt)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sessions for user {UserId}", userId);
                return Enumerable.Empty<UserSession>();
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
                _logger.LogError(ex, "Error counting active sessions for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<IEnumerable<UserSession>> GetActiveSessionsAsync(int limit = 100)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.IsActive)
                    .OrderByDescending(s => s.LastActivity)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active sessions");
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetRecentTerminatedSessionsAsync(int limit = 50)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => !s.IsActive && s.TerminatedAt != null)
                    .OrderByDescending(s => s.TerminatedAt)
                    .Take(limit)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent terminated sessions");
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetExpiredSessionsAsync()
        {
            try
            {
                DateTime now = DateTime.UtcNow;

                return await _context.UserSessions
                    .Where(s => s.IsActive && s.ExpiresAt.HasValue && s.ExpiresAt <= now)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expired sessions");
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetSuspiciousSessionsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.IsSuspicious && s.CreatedAt >= cutoffTime)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving suspicious sessions");
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetSessionsByIPAsync(string ipAddress, int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.IpAddress == ipAddress && s.CreatedAt >= cutoffTime)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sessions by IP {IPAddress}", ipAddress);
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<IEnumerable<UserSession>> GetSessionsInRangeAsync(DateTime from, DateTime to)
        {
            try
            {
                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.CreatedAt >= from && s.CreatedAt <= to)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving sessions in range {From} to {To}", from, to);
                return Enumerable.Empty<UserSession>();
            }
        }

        public async Task<bool> TerminateSessionAsync(string sessionToken, string reason)
        {
            try
            {
                UserSession? session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);

                if (session != null)
                {
                    session.IsActive = false;
                    session.TerminatedAt = DateTime.UtcNow;
                    session.TerminationReason = reason;

                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Terminated session {SessionToken} for user {UserId}. Reason: {Reason}", 
                        sessionToken, session.UserId, reason);
                    return true;
                }

                _logger.LogWarning("Session {SessionToken} not found for termination", sessionToken);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating session {SessionToken}", sessionToken);
                return false;
            }
        }

        public async Task<int> TerminateUserSessionsAsync(int userId, string reason, string? excludeSessionToken = null)
        {
            try
            {
                var sessionsQuery = _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive);

                if (!string.IsNullOrEmpty(excludeSessionToken))
                {
                    sessionsQuery = sessionsQuery.Where(s => s.SessionToken != excludeSessionToken);
                }

                List<UserSession> sessions = await sessionsQuery.ToListAsync();

                foreach (UserSession session in sessions)
                {
                    session.IsActive = false;
                    session.TerminatedAt = DateTime.UtcNow;
                    session.TerminationReason = reason;
                }

                await _context.SaveChangesAsync();

                int terminatedCount = sessions.Count;
                _logger.LogInformation("Terminated {Count} sessions for user {UserId}. Reason: {Reason}", 
                    terminatedCount, userId, reason);
                return terminatedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating sessions for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<bool> MarkSessionSuspiciousAsync(string sessionToken, string reason)
        {
            try
            {
                UserSession? session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken);

                if (session != null)
                {
                    session.IsSuspicious = true;
                    session.SecurityNotes = reason;

                    await _context.SaveChangesAsync();

                    _logger.LogWarning("Marked session {SessionToken} as suspicious. Reason: {Reason}", sessionToken, reason);
                    return true;
                }

                _logger.LogWarning("Session {SessionToken} not found for marking suspicious", sessionToken);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking session suspicious {SessionToken}", sessionToken);
                return false;
            }
        }

        public async Task<bool> UpdateSessionActivityAsync(string sessionToken, DateTime newExpiryTime)
        {
            try
            {
                UserSession? session = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.SessionToken == sessionToken && s.IsActive);

                if (session != null)
                {
                    session.LastActivity = DateTime.UtcNow;
                    session.ExpiresAt = newExpiryTime;

                    await _context.SaveChangesAsync();
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating session activity {SessionToken}", sessionToken);
                return false;
            }
        }

        public async Task<UserSession?> GetOldestActiveSessionAsync(int userId)
        {
            try
            {
                return await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .OrderBy(s => s.CreatedAt)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving oldest active session for user {UserId}", userId);
                return null;
            }
        }

        // Continue with remaining methods in next part due to size...
        public async Task<(int ActiveSessions, int TotalSessions, DateTime? LastLogin)> GetUserSessionStatisticsAsync(int userId)
        {
            try
            {
                var sessions = await _context.UserSessions
                    .Where(s => s.UserId == userId)
                    .ToListAsync();

                int activeSessions = sessions.Count(s => s.IsActive);
                int totalSessions = sessions.Count;
                DateTime? lastLogin = sessions.Any() ? sessions.Max(s => s.CreatedAt) : null;

                return (activeSessions, totalSessions, lastLogin);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving session statistics for user {UserId}", userId);
                return (0, 0, null);
            }
        }

        public async Task<(int TotalActiveSessions, int SuspiciousSessions, int UniqueUsers, int SessionsCreated)> GetSessionStatisticsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var recentSessions = await _context.UserSessions
                    .Where(s => s.CreatedAt >= cutoffTime)
                    .ToListAsync();

                int totalActiveSessions = await _context.UserSessions.CountAsync(s => s.IsActive);
                int suspiciousSessions = recentSessions.Count(s => s.IsSuspicious);
                int uniqueUsers = recentSessions.Select(s => s.UserId).Distinct().Count();
                int sessionsCreated = recentSessions.Count;

                return (totalActiveSessions, suspiciousSessions, uniqueUsers, sessionsCreated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving session statistics");
                return (0, 0, 0, 0);
            }
        }

        public async Task<IEnumerable<(string Country, string City, int SessionCount)>> GetSessionLocationStatisticsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var locationStats = await _context.UserSessions
                    .Where(s => s.CreatedAt >= cutoffTime && s.Country != null && s.City != null)
                    .GroupBy(s => new { s.Country, s.City })
                    .Select(g => new { Country = g.Key.Country!, City = g.Key.City!, SessionCount = g.Count() })
                    .OrderByDescending(g => g.SessionCount)
                    .ToListAsync();

                return locationStats.Select(ls => (ls.Country, ls.City, ls.SessionCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving session location statistics");
                return Enumerable.Empty<(string, string, int)>();
            }
        }

        public async Task<bool> HasConcurrentLocationSessionsAsync(int userId)
        {
            try
            {
                var activeSessions = await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive && s.Country != null)
                    .Select(s => s.Country)
                    .Distinct()
                    .ToListAsync();

                return activeSessions.Count > 1;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking concurrent location sessions for user {UserId}", userId);
                return false;
            }
        }

        public async Task<IEnumerable<(string DeviceType, string Browser, int SessionCount)>> GetDeviceStatisticsAsync(int hoursBack = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-hoursBack);

                var deviceStats = await _context.UserSessions
                    .Where(s => s.CreatedAt >= cutoffTime && s.DeviceType != null && s.Browser != null)
                    .GroupBy(s => new { s.DeviceType, s.Browser })
                    .Select(g => new { DeviceType = g.Key.DeviceType!, Browser = g.Key.Browser!, SessionCount = g.Count() })
                    .OrderByDescending(g => g.SessionCount)
                    .ToListAsync();

                return deviceStats.Select(ds => (ds.DeviceType, ds.Browser, ds.SessionCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving device statistics");
                return Enumerable.Empty<(string, string, int)>();
            }
        }

        public async Task<int> CleanupOldSessionsAsync(int daysOld = 30)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddDays(-daysOld);

                var oldSessions = await _context.UserSessions
                    .Where(s => !s.IsActive && s.TerminatedAt.HasValue && s.TerminatedAt < cutoffTime)
                    .ToListAsync();

                _context.UserSessions.RemoveRange(oldSessions);
                await _context.SaveChangesAsync();

                int removedCount = oldSessions.Count;
                _logger.LogInformation("Cleaned up {Count} old sessions older than {DaysOld} days", removedCount, daysOld);
                return removedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up old sessions");
                return 0;
            }
        }

        public async Task<IEnumerable<UserSession>> GetLongRunningSessionsAsync(int maxDurationHours = 24)
        {
            try
            {
                DateTime cutoffTime = DateTime.UtcNow.AddHours(-maxDurationHours);

                return await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.IsActive && s.CreatedAt <= cutoffTime)
                    .OrderBy(s => s.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving long-running sessions");
                return Enumerable.Empty<UserSession>();
            }
        }
    }
} 