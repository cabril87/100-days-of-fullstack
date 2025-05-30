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
using TaskTrackerAPI.Models.Analytics;

namespace TaskTrackerAPI.Repositories.Interfaces
{
    /// <summary>
    /// Repository interface for managing data export requests
    /// </summary>
    public interface IDataExportRepository
    {
        Task<IEnumerable<DataExportRequest>> GetUserExportRequestsAsync(int userId);
        Task<DataExportRequest?> GetByIdAsync(int id);
        Task<DataExportRequest> CreateAsync(DataExportRequest exportRequest);
        Task<DataExportRequest> UpdateAsync(DataExportRequest exportRequest);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<DataExportRequest>> GetPendingRequestsAsync();
        Task<IEnumerable<DataExportRequest>> GetExpiredRequestsAsync(DateTime expirationDate);
        Task<bool> UpdateStatusAsync(int id, string status, string? errorMessage = null);
        Task<bool> SetFilePathAsync(int id, string filePath);
    }
} 