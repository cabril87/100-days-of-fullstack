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
    /// Service interface for data visualization operations
    /// </summary>
    public interface IDataVisualizationService
    {
        Task<object> GenerateChartDataAsync(string chartType, object data);
        Task<IEnumerable<string>> GetSupportedChartTypesAsync();
        Task<object> GetChartConfigurationAsync(string chartType);
        Task<object> CreateInteractiveVisualizationAsync(string visualizationType, object data, object options);
        Task<object> GenerateCustomChartAsync(object chartDefinition, object data);
        Task<IEnumerable<object>> GetVisualizationTemplatesAsync();
        Task<object> ApplyChartThemeAsync(object chartData, string theme);
        Task<object> GenerateResponsiveChartAsync(object chartData, object responsiveOptions);
    }
} 