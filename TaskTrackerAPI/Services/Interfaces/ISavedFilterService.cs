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
using TaskTrackerAPI.DTOs.Analytics;

namespace TaskTrackerAPI.Services.Interfaces
{
    /// <summary>
    /// Service interface for managing saved analytics filters
    /// </summary>
    public interface ISavedFilterService
    {
        Task<IEnumerable<SavedFilterDTO>> GetUserFiltersAsync(int userId);
        Task<SavedFilterDTO?> GetFilterByIdAsync(int id, int userId);
        Task<SavedFilterDTO> CreateFilterAsync(CreateSavedFilterDTO createDto, int userId);
        Task<SavedFilterDTO> UpdateFilterAsync(int id, UpdateSavedFilterDTO updateDto, int userId);
        Task<bool> DeleteFilterAsync(int id, int userId);
        Task<IEnumerable<SavedFilterDTO>> GetPublicFiltersAsync();
        Task<IEnumerable<SavedFilterDTO>> GetSharedFiltersAsync(int userId);
        Task<bool> ValidateFilterCriteriaAsync(string criteria);
        Task<object> ExecuteFilterAsync(int filterId, int userId);
    }
} 