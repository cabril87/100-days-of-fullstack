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
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Security;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IGeolocationService
    {
        Task<GeolocationDTO?> GetLocationAsync(string ipAddress);
        Task<bool> IsCountryAllowedAsync(string countryCode);
        Task<bool> IsLocationSuspiciousAsync(string ipAddress, int? userId = null);
        Task<IPGeolocationSummaryDTO> GetGeolocationSummaryAsync();
        Task<List<GeolocationAccessDTO>> GetRecentAccessByLocationAsync(int limit = 50);
        Task AddAllowedCountryAsync(string countryCode, string addedBy);
        Task RemoveAllowedCountryAsync(string countryCode, string removedBy);
        Task AddBlockedCountryAsync(string countryCode, string addedBy);
        Task RemoveBlockedCountryAsync(string countryCode, string removedBy);
        Task<List<string>> GetAllowedCountriesAsync();
        Task<List<string>> GetBlockedCountriesAsync();
        Task<bool> IsVPNOrProxyAsync(string ipAddress);
        Task LogGeolocationAccessAsync(string ipAddress, string? username, bool isAllowed, bool isSuspicious, string? riskFactors = null);
    }
} 