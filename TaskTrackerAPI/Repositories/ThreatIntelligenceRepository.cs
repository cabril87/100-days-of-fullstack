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
using TaskTrackerAPI.Models.Security;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories
{
    /// <summary>
    /// Repository implementation for threat intelligence data management
    /// </summary>
    public class ThreatIntelligenceRepository : IThreatIntelligenceRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ThreatIntelligenceRepository> _logger;

        public ThreatIntelligenceRepository(ApplicationDbContext context, ILogger<ThreatIntelligenceRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<ThreatIntelligence>> GetActiveThreatsAsync()
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .OrderByDescending(t => t.LastSeen)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active threats");
                return Enumerable.Empty<ThreatIntelligence>();
            }
        }

        public async Task<IEnumerable<ThreatIntelligence>> GetThreatsByTypeAsync(string threatType)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.ThreatType == threatType && t.IsActive)
                    .OrderByDescending(t => t.LastSeen)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threats by type {ThreatType}", threatType);
                return Enumerable.Empty<ThreatIntelligence>();
            }
        }

        public async Task<IEnumerable<ThreatIntelligence>> GetThreatsBySeverityAsync(string severity)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.Severity == severity && t.IsActive)
                    .OrderByDescending(t => t.ConfidenceScore)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threats by severity {Severity}", severity);
                return Enumerable.Empty<ThreatIntelligence>();
            }
        }

        public async Task<IEnumerable<ThreatIntelligence>> GetRecentThreatsAsync(int count = 10)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .OrderByDescending(t => t.LastSeen)
                    .Take(count)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent threats");
                return Enumerable.Empty<ThreatIntelligence>();
            }
        }

        public async Task<ThreatIntelligence?> GetThreatByIPAsync(string ipAddress)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.IPAddress == ipAddress && t.IsActive)
                    .OrderByDescending(t => t.ConfidenceScore)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threat by IP {IPAddress}", ipAddress);
                return null;
            }
        }

        public async Task<ThreatIntelligence?> GetThreatByIPAndTypeAsync(string ipAddress, string threatType)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .FirstOrDefaultAsync(t => t.IPAddress == ipAddress && t.ThreatType == threatType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threat by IP {IPAddress} and type {ThreatType}", ipAddress, threatType);
                return null;
            }
        }

        public async Task<ThreatIntelligence?> GetThreatByIdAsync(int threatId)
        {
            try
            {
                return await _context.ThreatIntelligence.FindAsync(threatId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threat by ID {ThreatId}", threatId);
                return null;
            }
        }

        public async Task<ThreatIntelligence> CreateThreatAsync(ThreatIntelligence threat)
        {
            try
            {
                threat.CreatedAt = DateTime.UtcNow;
                threat.UpdatedAt = DateTime.UtcNow;
                
                _context.ThreatIntelligence.Add(threat);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Created new threat intelligence record for IP {IPAddress}", threat.IPAddress);
                return threat;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating threat intelligence record for IP {IPAddress}", threat.IPAddress);
                throw;
            }
        }

        public async Task<ThreatIntelligence> UpdateThreatAsync(ThreatIntelligence threat)
        {
            try
            {
                threat.UpdatedAt = DateTime.UtcNow;
                
                _context.ThreatIntelligence.Update(threat);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Updated threat intelligence record {ThreatId}", threat.Id);
                return threat;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating threat intelligence record {ThreatId}", threat.Id);
                throw;
            }
        }

        public async Task<bool> UpdateThreatStatusAsync(int threatId, bool isActive)
        {
            try
            {
                ThreatIntelligence? threat = await _context.ThreatIntelligence.FindAsync(threatId);
                if (threat != null)
                {
                    threat.IsActive = isActive;
                    threat.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("Updated threat status for ID {ThreatId} to {IsActive}", threatId, isActive);
                    return true;
                }
                
                _logger.LogWarning("Threat with ID {ThreatId} not found for status update", threatId);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating threat status for ID {ThreatId}", threatId);
                return false;
            }
        }

        public async Task<bool> IsIPBlacklistedAsync(string ipAddress)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .AnyAsync(t => t.IPAddress == ipAddress && t.IsBlacklisted && t.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP is blacklisted {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<bool> IsIPWhitelistedAsync(string ipAddress)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .AnyAsync(t => t.IPAddress == ipAddress && t.IsWhitelisted && t.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if IP is whitelisted {IPAddress}", ipAddress);
                return false;
            }
        }

        public async Task<IEnumerable<string>> GetThreatTypesAsync()
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .Select(t => t.ThreatType)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threat types");
                return Enumerable.Empty<string>();
            }
        }

        public async Task<IEnumerable<string>> GetThreatSourcesAsync()
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .Select(t => t.ThreatSource)
                    .Distinct()
                    .OrderBy(t => t)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threat sources");
                return Enumerable.Empty<string>();
            }
        }

        public async Task<IEnumerable<ThreatIntelligence>> GetOldThreatsForCleanupAsync(int daysOld)
        {
            try
            {
                DateTime cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
                
                return await _context.ThreatIntelligence
                    .Where(t => t.LastSeen < cutoffDate && !t.IsBlacklisted && !t.IsWhitelisted)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving old threats for cleanup (older than {DaysOld} days)", daysOld);
                return Enumerable.Empty<ThreatIntelligence>();
            }
        }

        public async Task<int> RemoveThreatsAsync(IEnumerable<ThreatIntelligence> threats)
        {
            try
            {
                List<ThreatIntelligence> threatsList = threats.ToList();
                
                _context.ThreatIntelligence.RemoveRange(threatsList);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Removed {Count} threat intelligence records", threatsList.Count);
                return threatsList.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing threat intelligence records");
                return 0;
            }
        }

        public async Task<Dictionary<string, int>> GetThreatStatisticsAsync()
        {
            try
            {
                List<ThreatIntelligence> activeThreats = await _context.ThreatIntelligence
                    .Where(t => t.IsActive)
                    .ToListAsync();

                Dictionary<string, int> statistics = new Dictionary<string, int>
                {
                    ["TotalThreats"] = activeThreats.Count,
                    ["CriticalThreats"] = activeThreats.Count(t => t.Severity == "Critical"),
                    ["HighThreats"] = activeThreats.Count(t => t.Severity == "High"),
                    ["MediumThreats"] = activeThreats.Count(t => t.Severity == "Medium"),
                    ["LowThreats"] = activeThreats.Count(t => t.Severity == "Low"),
                    ["BlacklistedIPs"] = activeThreats.Count(t => t.IsBlacklisted),
                    ["WhitelistedIPs"] = activeThreats.Count(t => t.IsWhitelisted),
                    ["ThreatTypes"] = activeThreats.Select(t => t.ThreatType).Distinct().Count(),
                    ["ThreatSources"] = activeThreats.Select(t => t.ThreatSource).Distinct().Count()
                };

                return statistics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving threat statistics");
                return new Dictionary<string, int>();
            }
        }

        public async Task<IEnumerable<string>> GetTopThreatCountriesAsync(int count = 10)
        {
            try
            {
                return await _context.ThreatIntelligence
                    .Where(t => t.IsActive && !string.IsNullOrEmpty(t.Country))
                    .GroupBy(t => t.Country)
                    .OrderByDescending(g => g.Count())
                    .Take(count)
                    .Select(g => g.Key)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving top threat countries");
                return Enumerable.Empty<string>();
            }
        }
    }
} 