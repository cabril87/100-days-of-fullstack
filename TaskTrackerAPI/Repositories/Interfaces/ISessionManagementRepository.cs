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
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for user session management
    /// </summary>
    public interface ISessionManagementRepository
    {
        /// <summary>
        /// Creates a new user session
        /// </summary>
        /// <param name="session">User session to create</param>
        /// <returns>Created user session</returns>
        Task<UserSession> CreateSessionAsync(UserSession session);

        /// <summary>
        /// Gets a user session by session token
        /// </summary>
        /// <param name="sessionToken">Session token to search for</param>
        /// <returns>User session if found</returns>
        Task<UserSession?> GetSessionByTokenAsync(string sessionToken);

        /// <summary>
        /// Gets a user session by ID
        /// </summary>
        /// <param name="sessionId">Session ID to search for</param>
        /// <returns>User session if found</returns>
        Task<UserSession?> GetSessionByIdAsync(int sessionId);

        /// <summary>
        /// Updates an existing user session
        /// </summary>
        /// <param name="session">User session to update</param>
        /// <returns>Updated user session</returns>
        Task<UserSession> UpdateSessionAsync(UserSession session);

        /// <summary>
        /// Gets all active sessions for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Collection of active user sessions</returns>
        Task<IEnumerable<UserSession>> GetActiveSessionsByUserAsync(int userId);

        /// <summary>
        /// Gets all sessions for a user (active and inactive)
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="limit">Maximum number of sessions to return</param>
        /// <returns>Collection of user sessions</returns>
        Task<IEnumerable<UserSession>> GetUserSessionsAsync(int userId, int limit = 50);

        /// <summary>
        /// Counts active sessions for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Count of active sessions</returns>
        Task<int> GetActiveSessionCountAsync(int userId);

        /// <summary>
        /// Gets all currently active sessions
        /// </summary>
        /// <param name="limit">Maximum number of sessions to return</param>
        /// <returns>Collection of active sessions</returns>
        Task<IEnumerable<UserSession>> GetActiveSessionsAsync(int limit = 100);

        /// <summary>
        /// Gets recently terminated sessions
        /// </summary>
        /// <param name="limit">Maximum number of sessions to return</param>
        /// <returns>Collection of recently terminated sessions</returns>
        Task<IEnumerable<UserSession>> GetRecentTerminatedSessionsAsync(int limit = 50);

        /// <summary>
        /// Gets expired sessions that are still marked as active
        /// </summary>
        /// <returns>Collection of expired sessions</returns>
        Task<IEnumerable<UserSession>> GetExpiredSessionsAsync();

        /// <summary>
        /// Gets suspicious sessions
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of suspicious sessions</returns>
        Task<IEnumerable<UserSession>> GetSuspiciousSessionsAsync(int hoursBack = 24);

        /// <summary>
        /// Gets sessions from a specific IP address
        /// </summary>
        /// <param name="ipAddress">IP address to filter by</param>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of sessions from the IP</returns>
        Task<IEnumerable<UserSession>> GetSessionsByIPAsync(string ipAddress, int hoursBack = 24);

        /// <summary>
        /// Gets sessions created within a date range
        /// </summary>
        /// <param name="from">Start date</param>
        /// <param name="to">End date</param>
        /// <returns>Collection of sessions in the date range</returns>
        Task<IEnumerable<UserSession>> GetSessionsInRangeAsync(DateTime from, DateTime to);

        /// <summary>
        /// Terminates (deactivates) a session
        /// </summary>
        /// <param name="sessionToken">Session token to terminate</param>
        /// <param name="reason">Reason for termination</param>
        /// <returns>True if session was terminated successfully</returns>
        Task<bool> TerminateSessionAsync(string sessionToken, string reason);

        /// <summary>
        /// Terminates all active sessions for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <param name="reason">Reason for termination</param>
        /// <param name="excludeSessionToken">Session token to exclude from termination</param>
        /// <returns>Number of sessions terminated</returns>
        Task<int> TerminateUserSessionsAsync(int userId, string reason, string? excludeSessionToken = null);

        /// <summary>
        /// Marks a session as suspicious
        /// </summary>
        /// <param name="sessionToken">Session token to mark</param>
        /// <param name="reason">Reason for suspicion</param>
        /// <returns>True if session was marked successfully</returns>
        Task<bool> MarkSessionSuspiciousAsync(string sessionToken, string reason);

        /// <summary>
        /// Updates the last activity time for a session
        /// </summary>
        /// <param name="sessionToken">Session token to update</param>
        /// <param name="newExpiryTime">New expiry time</param>
        /// <returns>True if update was successful</returns>
        Task<bool> UpdateSessionActivityAsync(string sessionToken, DateTime newExpiryTime);

        /// <summary>
        /// Gets the oldest active session for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Oldest active session</returns>
        Task<UserSession?> GetOldestActiveSessionAsync(int userId);

        /// <summary>
        /// Gets session statistics for a user
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>Session statistics</returns>
        Task<(int ActiveSessions, int TotalSessions, DateTime? LastLogin)> GetUserSessionStatisticsAsync(int userId);

        /// <summary>
        /// Gets global session statistics
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Global session statistics</returns>
        Task<(int TotalActiveSessions, int SuspiciousSessions, int UniqueUsers, int SessionsCreated)> GetSessionStatisticsAsync(int hoursBack = 24);

        /// <summary>
        /// Gets unique locations from sessions
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Collection of unique location combinations</returns>
        Task<IEnumerable<(string Country, string City, int SessionCount)>> GetSessionLocationStatisticsAsync(int hoursBack = 24);

        /// <summary>
        /// Checks if a user has concurrent sessions from different locations
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>True if user has sessions from different locations</returns>
        Task<bool> HasConcurrentLocationSessionsAsync(int userId);

        /// <summary>
        /// Gets device statistics from sessions
        /// </summary>
        /// <param name="hoursBack">Number of hours to look back</param>
        /// <returns>Device usage statistics</returns>
        Task<IEnumerable<(string DeviceType, string Browser, int SessionCount)>> GetDeviceStatisticsAsync(int hoursBack = 24);

        /// <summary>
        /// Removes expired and old terminated sessions
        /// </summary>
        /// <param name="daysOld">Remove sessions older than this many days</param>
        /// <returns>Number of sessions removed</returns>
        Task<int> CleanupOldSessionsAsync(int daysOld = 30);

        /// <summary>
        /// Gets sessions that exceeded normal duration
        /// </summary>
        /// <param name="maxDurationHours">Maximum normal session duration</param>
        /// <returns>Collection of long-running sessions</returns>
        Task<IEnumerable<UserSession>> GetLongRunningSessionsAsync(int maxDurationHours = 24);
    }
} 