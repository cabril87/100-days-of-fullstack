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
    /// Repository interface for managing dashboard widgets
    /// </summary>
    public interface IDashboardWidgetRepository
    {
        Task<IEnumerable<DashboardWidget>> GetUserWidgetsAsync(int userId);
        Task<DashboardWidget?> GetByIdAsync(int id);
        Task<DashboardWidget> CreateAsync(DashboardWidget widget);
        Task<DashboardWidget> UpdateAsync(DashboardWidget widget);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<DashboardWidget>> GetWidgetsByTypeAsync(int userId, string widgetType);
        Task<bool> UpdatePositionAsync(int id, string position);
        Task<bool> UpdateConfigurationAsync(int id, string configuration);
        Task<int> GetWidgetCountAsync(int userId);
    }
} 