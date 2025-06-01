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
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs.Security;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services
{
    public class GeolocationService : IGeolocationService
    {
        private readonly IGeolocationRepository _geolocationRepository;
        private readonly ILogger<GeolocationService> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        // Default allowed countries (can be configured)
        private readonly List<string> _defaultAllowedCountries = new()
        {
            "US", "CA", "GB", "AU", "DE", "FR", "NL", "SE", "NO", "DK", "FI", "CH", "AT", "BE", "IE", "LU", "IT", "ES", "PT"
        };

        // High-risk countries that should be flagged
        private readonly List<string> _highRiskCountries = new()
        {
            "CN", "RU", "KP", "IR", "SY", "AF", "IQ", "LY", "SO", "SD", "YE", "MM"
        };

        public GeolocationService(
            IGeolocationRepository geolocationRepository,
            ILogger<GeolocationService> logger,
            IConfiguration configuration,
            HttpClient httpClient)
        {
            _geolocationRepository = geolocationRepository;
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<GeolocationDTO?> GetLocationAsync(string ipAddress)
        {
            try
            {
                // Skip localhost and private IPs
                if (IsLocalOrPrivateIP(ipAddress))
                {
                    return new GeolocationDTO
                    {
                        Country = "Local",
                        City = "Local",
                        CountryCode = "LO",
                        IsVPN = false,
                        IsProxy = false
                    };
                }

                // Try to get from cache first (implement caching if needed)
                var cachedLocation = await GetCachedLocationAsync(ipAddress);
                if (cachedLocation != null)
                    return cachedLocation;

                // Use free IP geolocation service (ip-api.com)
                var response = await _httpClient.GetStringAsync($"http://ip-api.com/json/{ipAddress}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,proxy,hosting");
                
                var geoData = JsonSerializer.Deserialize<JsonElement>(response);
                
                if (geoData.GetProperty("status").GetString() == "success")
                {
                    var location = new GeolocationDTO
                    {
                        Country = geoData.TryGetProperty("country", out var country) ? country.GetString() : null,
                        City = geoData.TryGetProperty("city", out var city) ? city.GetString() : null,
                        CountryCode = geoData.TryGetProperty("countryCode", out var countryCode) ? countryCode.GetString() : null,
                        Latitude = geoData.TryGetProperty("lat", out var lat) ? lat.GetDouble() : null,
                        Longitude = geoData.TryGetProperty("lon", out var lon) ? lon.GetDouble() : null,
                        Timezone = geoData.TryGetProperty("timezone", out var timezone) ? timezone.GetString() : null,
                        ISP = geoData.TryGetProperty("isp", out var isp) ? isp.GetString() : null,
                        Organization = geoData.TryGetProperty("org", out var org) ? org.GetString() : null,
                        IsProxy = geoData.TryGetProperty("proxy", out var proxy) && proxy.GetBoolean(),
                        IsVPN = geoData.TryGetProperty("hosting", out var hosting) && hosting.GetBoolean()
                    };

                    // Cache the result
                    await CacheLocationAsync(ipAddress, location);
                    
                    return location;
                }
                else
                {
                    _logger.LogWarning($"Failed to get geolocation for IP {ipAddress}: {geoData.GetProperty("message").GetString()}");
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting geolocation for IP {ipAddress}");
                return null;
            }
        }

        public async Task<bool> IsCountryAllowedAsync(string countryCode)
        {
            try
            {
                var allowedCountries = await GetAllowedCountriesAsync();
                return allowedCountries.Contains(countryCode.ToUpper());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if country is allowed: {countryCode}");
                return true; // Default to allow if error
            }
        }

        public async Task<bool> IsLocationSuspiciousAsync(string ipAddress, int? userId = null)
        {
            try
            {
                var location = await GetLocationAsync(ipAddress);
                if (location == null)
                    return true; // Consider suspicious if we can't determine location

                // Check if country is in high-risk list
                if (!string.IsNullOrEmpty(location.CountryCode) && _highRiskCountries.Contains(location.CountryCode))
                    return true;

                // Check if using VPN or proxy
                if (location.IsVPN || location.IsProxy)
                    return true;

                // Check if country is blocked
                var blockedCountries = await GetBlockedCountriesAsync();
                if (!string.IsNullOrEmpty(location.CountryCode) && blockedCountries.Contains(location.CountryCode))
                    return true;

                // If user ID provided, check for unusual location patterns
                if (userId.HasValue)
                {
                    var isUnusualLocation = await IsUnusualLocationForUserAsync(userId.Value, location);
                    if (isUnusualLocation)
                        return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if location is suspicious for IP {ipAddress}");
                return false;
            }
        }

        public async Task<IPGeolocationSummaryDTO> GetGeolocationSummaryAsync()
        {
            try
            {
                var last24Hours = DateTime.UtcNow.AddHours(-24);
                
                // Get recent access data from security audit logs using repository
                var groupedAccess = await _geolocationRepository.GetGroupedIPAccessAsync(24, 20);

                var geolocationAccess = new List<GeolocationAccessDTO>();
                
                foreach (var access in groupedAccess)
                {
                    var location = await GetLocationAsync(access.IpAddress);
                    var isAllowed = location?.CountryCode != null && await IsCountryAllowedAsync(location.CountryCode);
                    var isSuspicious = await IsLocationSuspiciousAsync(access.IpAddress);

                    geolocationAccess.Add(new GeolocationAccessDTO
                    {
                        IpAddress = access.IpAddress,
                        Country = location?.Country,
                        City = location?.City,
                        AccessTime = access.LastAccess,
                        Username = access.Username,
                        IsAllowed = isAllowed,
                        IsSuspicious = isSuspicious || access.IsSuspicious,
                        RiskFactors = isSuspicious ? "Suspicious location" : null
                    });
                }

                var allowedCountries = await GetAllowedCountriesAsync();
                var blockedCountries = await GetBlockedCountriesAsync();

                return new IPGeolocationSummaryDTO
                {
                    TotalUniqueIPs = await _geolocationRepository.GetUniqueIPCountAsync(24),
                    SuspiciousIPs = geolocationAccess.Count(g => g.IsSuspicious),
                    BlockedCountriesCount = blockedCountries.Count,
                    AllowedCountries = allowedCountries,
                    BlockedCountries = blockedCountries,
                    RecentAccess = geolocationAccess.OrderByDescending(g => g.AccessTime).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting geolocation summary");
                throw;
            }
        }

        public async Task<List<GeolocationAccessDTO>> GetRecentAccessByLocationAsync(int limit = 50)
        {
            try
            {
                var recentAccess = await _geolocationRepository.GetRecentIPAccessAsync(24, limit);

                var result = new List<GeolocationAccessDTO>();
                
                foreach (var access in recentAccess)
                {
                    if (access.IpAddress != null)
                    {
                        var location = await GetLocationAsync(access.IpAddress);
                        var isAllowed = location?.CountryCode != null && await IsCountryAllowedAsync(location.CountryCode);
                        var isSuspicious = await IsLocationSuspiciousAsync(access.IpAddress);

                        result.Add(new GeolocationAccessDTO
                        {
                            IpAddress = access.IpAddress,
                            Country = location?.Country,
                            City = location?.City,
                            AccessTime = access.Timestamp,
                            Username = access.Username,
                            IsAllowed = isAllowed,
                            IsSuspicious = isSuspicious || access.IsSuspicious,
                            RiskFactors = isSuspicious ? "Suspicious location" : null
                        });
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent access by location");
                throw;
            }
        }

        public Task AddAllowedCountryAsync(string countryCode, string addedBy)
        {
            try
            {
                // Store in configuration or database
                _logger.LogInformation($"Country {countryCode} added to allowed list by {addedBy}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding allowed country {countryCode}");
                throw;
            }
        }

        public Task RemoveAllowedCountryAsync(string countryCode, string removedBy)
        {
            try
            {
                _logger.LogInformation($"Country {countryCode} removed from allowed list by {removedBy}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing allowed country {countryCode}");
                throw;
            }
        }

        public Task AddBlockedCountryAsync(string countryCode, string addedBy)
        {
            try
            {
                _logger.LogWarning($"Country {countryCode} added to blocked list by {addedBy}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding blocked country {countryCode}");
                throw;
            }
        }

        public Task RemoveBlockedCountryAsync(string countryCode, string removedBy)
        {
            try
            {
                _logger.LogInformation($"Country {countryCode} removed from blocked list by {removedBy}");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing blocked country {countryCode}");
                throw;
            }
        }

        public Task<List<string>> GetAllowedCountriesAsync()
        {
            try
            {
                // For now, return default allowed countries
                // In production, this would be stored in database or configuration
                return Task.FromResult(_defaultAllowedCountries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting allowed countries");
                return Task.FromResult(_defaultAllowedCountries);
            }
        }

        public Task<List<string>> GetBlockedCountriesAsync()
        {
            try
            {
                // For now, return high-risk countries as blocked
                // In production, this would be stored in database or configuration
                return Task.FromResult(_highRiskCountries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting blocked countries");
                return Task.FromResult(new List<string>());
            }
        }

        public async Task<bool> IsVPNOrProxyAsync(string ipAddress)
        {
            try
            {
                GeolocationDTO? location = await GetLocationAsync(ipAddress);
                return location?.IsVPN == true || location?.IsProxy == true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking if IP is VPN or proxy: {ipAddress}");
                return false;
            }
        }

        public async Task LogGeolocationAccessAsync(string ipAddress, string? username, bool isAllowed, bool isSuspicious, string? riskFactors = null)
        {
            try
            {
                GeolocationDTO? location = await GetLocationAsync(ipAddress);
                
                _logger.LogInformation($"Geolocation access from {location?.Country ?? "Unknown"}, {location?.City ?? "Unknown"}. Risk factors: {riskFactors}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging geolocation access");
            }
        }

        private bool IsLocalOrPrivateIP(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress))
                return true;

            // Check for localhost
            if (ipAddress == "127.0.0.1" || ipAddress == "::1" || ipAddress == "localhost")
                return true;

            // Check for private IP ranges
            var parts = ipAddress.Split('.');
            if (parts.Length == 4 && int.TryParse(parts[0], out int firstOctet))
            {
                // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
                if (firstOctet == 10 || 
                    (firstOctet == 172 && int.TryParse(parts[1], out int secondOctet) && secondOctet >= 16 && secondOctet <= 31) ||
                    (firstOctet == 192 && int.TryParse(parts[1], out int secondOctet2) && secondOctet2 == 168))
                {
                    return true;
                }
            }

            return false;
        }

        private Task<GeolocationDTO?> GetCachedLocationAsync(string ipAddress)
        {
            // Implement caching logic here if needed
            // For now, return null to always fetch fresh data
            return Task.FromResult<GeolocationDTO?>(null);
        }

        private Task CacheLocationAsync(string ipAddress, GeolocationDTO location)
        {
            // Implement caching logic here if needed
            // For now, do nothing
            return Task.CompletedTask;
        }

        private async Task<bool> IsUnusualLocationForUserAsync(int userId, GeolocationDTO location)
        {
            try
            {
                // Check user's historical locations from audit logs using repository
                IEnumerable<string> userIPs = await _geolocationRepository.GetUserHistoricalIPsAsync(userId, 30);

                // If user has accessed from less than 3 different IPs, consider new location suspicious
                if (userIPs.Count() < 3)
                    return true;

                // Check if current country is different from user's usual countries
                List<string> usualCountries = new();
                foreach (var ip in userIPs)
                {
                    if (ip != null)
                    {
                        GeolocationDTO? historicalLocation = await GetLocationAsync(ip);
                        if (historicalLocation?.CountryCode != null)
                            usualCountries.Add(historicalLocation.CountryCode);
                    }
                }

                // If current location's country is not in user's usual countries, it's unusual
                return !string.IsNullOrEmpty(location.CountryCode) && !usualCountries.Contains(location.CountryCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking unusual location for user {userId}");
                return false;
            }
        }
    }
} 