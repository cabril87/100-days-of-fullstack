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
using TaskTrackerAPI.Models.Analytics;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for managing saved analytics filters
    /// </summary>
    public interface ISavedFilterRepository
    {
        Task<IEnumerable<SavedFilter>> GetUserFiltersAsync(int userId);
        Task<SavedFilter?> GetByIdAsync(int id);
        Task<SavedFilter> CreateAsync(SavedFilter filter);
        Task<SavedFilter> UpdateAsync(SavedFilter filter);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int userId, string name);
        Task<IEnumerable<SavedFilter>> GetPublicFiltersAsync();
        Task<IEnumerable<SavedFilter>> GetSharedFiltersAsync(int userId);
    }
} 