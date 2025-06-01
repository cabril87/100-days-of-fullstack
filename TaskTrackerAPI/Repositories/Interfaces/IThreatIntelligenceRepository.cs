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
using TaskTrackerAPI.Models.Security;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for threat intelligence data management
    /// </summary>
    public interface IThreatIntelligenceRepository
    {
        /// <summary>
        /// Gets all active threat intelligence records
        /// </summary>
        /// <returns>Collection of active threat intelligence records</returns>
        Task<IEnumerable<ThreatIntelligence>> GetActiveThreatsAsync();

        /// <summary>
        /// Gets threats by threat type
        /// </summary>
        /// <param name="threatType">Type of threat to filter by</param>
        /// <returns>Collection of threats matching the type</returns>
        Task<IEnumerable<ThreatIntelligence>> GetThreatsByTypeAsync(string threatType);

        /// <summary>
        /// Gets threats by severity level
        /// </summary>
        /// <param name="severity">Severity level to filter by</param>
        /// <returns>Collection of threats matching the severity</returns>
        Task<IEnumerable<ThreatIntelligence>> GetThreatsBySeverityAsync(string severity);

        /// <summary>
        /// Gets the most recent threats
        /// </summary>
        /// <param name="count">Number of recent threats to return</param>
        /// <returns>Collection of recent threats</returns>
        Task<IEnumerable<ThreatIntelligence>> GetRecentThreatsAsync(int count = 10);

        /// <summary>
        /// Gets threat intelligence record for a specific IP address
        /// </summary>
        /// <param name="ipAddress">IP address to look up</param>
        /// <returns>Threat intelligence record if found</returns>
        Task<ThreatIntelligence?> GetThreatByIPAsync(string ipAddress);

        /// <summary>
        /// Gets threat intelligence record for a specific IP and threat type
        /// </summary>
        /// <param name="ipAddress">IP address to look up</param>
        /// <param name="threatType">Type of threat</param>
        /// <returns>Threat intelligence record if found</returns>
        Task<ThreatIntelligence?> GetThreatByIPAndTypeAsync(string ipAddress, string threatType);

        /// <summary>
        /// Gets threat intelligence record by ID
        /// </summary>
        /// <param name="threatId">ID of the threat record</param>
        /// <returns>Threat intelligence record if found</returns>
        Task<ThreatIntelligence?> GetThreatByIdAsync(int threatId);

        /// <summary>
        /// Creates a new threat intelligence record
        /// </summary>
        /// <param name="threat">Threat intelligence record to create</param>
        /// <returns>Created threat intelligence record</returns>
        Task<ThreatIntelligence> CreateThreatAsync(ThreatIntelligence threat);

        /// <summary>
        /// Updates an existing threat intelligence record
        /// </summary>
        /// <param name="threat">Threat intelligence record to update</param>
        /// <returns>Updated threat intelligence record</returns>
        Task<ThreatIntelligence> UpdateThreatAsync(ThreatIntelligence threat);

        /// <summary>
        /// Updates the active status of a threat
        /// </summary>
        /// <param name="threatId">ID of the threat to update</param>
        /// <param name="isActive">New active status</param>
        /// <returns>True if update was successful</returns>
        Task<bool> UpdateThreatStatusAsync(int threatId, bool isActive);

        /// <summary>
        /// Checks if an IP address is blacklisted
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <returns>True if the IP is blacklisted</returns>
        Task<bool> IsIPBlacklistedAsync(string ipAddress);

        /// <summary>
        /// Checks if an IP address is whitelisted
        /// </summary>
        /// <param name="ipAddress">IP address to check</param>
        /// <returns>True if the IP is whitelisted</returns>
        Task<bool> IsIPWhitelistedAsync(string ipAddress);

        /// <summary>
        /// Gets all distinct threat types
        /// </summary>
        /// <returns>Collection of threat types</returns>
        Task<IEnumerable<string>> GetThreatTypesAsync();

        /// <summary>
        /// Gets all distinct threat sources
        /// </summary>
        /// <returns>Collection of threat sources</returns>
        Task<IEnumerable<string>> GetThreatSourcesAsync();

        /// <summary>
        /// Gets threats older than specified days that are not blacklisted or whitelisted
        /// </summary>
        /// <param name="daysOld">Number of days old</param>
        /// <returns>Collection of old threats eligible for cleanup</returns>
        Task<IEnumerable<ThreatIntelligence>> GetOldThreatsForCleanupAsync(int daysOld);

        /// <summary>
        /// Removes multiple threat intelligence records
        /// </summary>
        /// <param name="threats">Collection of threats to remove</param>
        /// <returns>Number of records removed</returns>
        Task<int> RemoveThreatsAsync(IEnumerable<ThreatIntelligence> threats);

        /// <summary>
        /// Gets threat intelligence summary statistics
        /// </summary>
        /// <returns>Dictionary containing threat statistics</returns>
        Task<Dictionary<string, int>> GetThreatStatisticsAsync();

        /// <summary>
        /// Gets top threat countries
        /// </summary>
        /// <param name="count">Number of top countries to return</param>
        /// <returns>Collection of country names ordered by threat count</returns>
        Task<IEnumerable<string>> GetTopThreatCountriesAsync(int count = 10);
    }
} 