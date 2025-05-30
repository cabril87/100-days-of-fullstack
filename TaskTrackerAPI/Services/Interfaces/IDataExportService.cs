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
    /// Service interface for managing data export operations
    /// </summary>
    public interface IDataExportService
    {
        Task<IEnumerable<DataExportRequestDTO>> GetUserExportRequestsAsync(int userId);
        Task<DataExportRequestDTO?> GetExportRequestByIdAsync(int id, int userId);
        Task<DataExportRequestDTO> CreateExportRequestAsync(CreateDataExportRequestDTO createDto, int userId);
        Task<bool> DeleteExportRequestAsync(int id, int userId);
        Task<string> GenerateExportFileAsync(int exportRequestId);
        Task<byte[]> DownloadExportFileAsync(int exportRequestId, int userId);
        Task<bool> CleanupExpiredExportsAsync();
        Task<IEnumerable<string>> GetSupportedFormatsAsync();
        Task<long> GetExportFileSizeAsync(int exportRequestId);
        Task<bool> IsExportReadyAsync(int exportRequestId);
    }
} 