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
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Models.Analytics;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service implementation for managing data export operations
    /// </summary>
    public class DataExportService : IDataExportService
    {
        private readonly IDataExportRepository _repository;
        private readonly IUnifiedAnalyticsService _analyticsService;
        private readonly IMapper _mapper;
        private readonly ILogger<DataExportService> _logger;
        private readonly string _exportDirectory;

        public DataExportService(
            IDataExportRepository repository,
            IUnifiedAnalyticsService analyticsService,
            IMapper mapper,
            ILogger<DataExportService> logger)
        {
            _repository = repository;
            _analyticsService = analyticsService;
            _mapper = mapper;
            _logger = logger;
            _exportDirectory = Path.Combine(Directory.GetCurrentDirectory(), "ExportFiles");

            // Ensure export directory exists
            if (!Directory.Exists(_exportDirectory))
            {
                Directory.CreateDirectory(_exportDirectory);
            }
        }

        public async Task<IEnumerable<DataExportRequestDTO>> GetUserExportRequestsAsync(int userId)
        {
            try
            {
                var requests = await _repository.GetUserExportRequestsAsync(userId);
                return _mapper.Map<IEnumerable<DataExportRequestDTO>>(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export requests for user {UserId}", userId);
                throw;
            }
        }

        public async Task<DataExportRequestDTO?> GetExportRequestByIdAsync(int id, int userId)
        {
            try
            {
                var request = await _repository.GetByIdAsync(id);
                
                // Check if user has access to this export request
                if (request == null || request.UserId != userId)
                {
                    return null;
                }

                return _mapper.Map<DataExportRequestDTO>(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export request {RequestId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<DataExportRequestDTO> CreateExportRequestAsync(CreateDataExportRequestDTO createDto, int userId)
        {
            try
            {
                var exportRequest = _mapper.Map<DataExportRequest>(createDto);
                exportRequest.UserId = userId;

                var createdRequest = await _repository.CreateAsync(exportRequest);
                
                // Start background export generation (in a real app, this would be queued)
                _ = Task.Run(async () => await GenerateExportFileAsync(createdRequest.Id));

                return _mapper.Map<DataExportRequestDTO>(createdRequest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating export request for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteExportRequestAsync(int id, int userId)
        {
            try
            {
                var request = await _repository.GetByIdAsync(id);
                if (request == null || request.UserId != userId)
                {
                    return false;
                }

                // Delete associated file if it exists
                if (!string.IsNullOrEmpty(request.FilePath) && File.Exists(request.FilePath))
                {
                    File.Delete(request.FilePath);
                }

                return await _repository.DeleteAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting export request {RequestId} for user {UserId}", id, userId);
                throw;
            }
        }

        public async Task<string> GenerateExportFileAsync(int exportRequestId)
        {
            try
            {
                var request = await _repository.GetByIdAsync(exportRequestId);
                if (request == null)
                {
                    throw new ArgumentException("Export request not found");
                }

                await _repository.UpdateStatusAsync(exportRequestId, "processing");

                // Generate analytics data based on request parameters
                var analyticsData = await GetAnalyticsDataAsync(request);
                
                // Generate file based on format
                var fileName = $"export_{exportRequestId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{request.ExportType.ToLowerInvariant()}";
                var filePath = Path.Combine(_exportDirectory, fileName);

                switch (request.ExportType.ToLowerInvariant())
                {
                    case "json":
                        await GenerateJsonFileAsync(filePath, analyticsData);
                        break;
                    case "csv":
                        await GenerateCsvFileAsync(filePath, analyticsData);
                        break;
                    case "excel":
                        await GenerateExcelFileAsync(filePath, analyticsData);
                        break;
                    default:
                        throw new NotSupportedException($"Format {request.ExportType} is not supported");
                }

                await _repository.SetFilePathAsync(exportRequestId, filePath);
                await _repository.UpdateStatusAsync(exportRequestId, "completed");

                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating export file for request {RequestId}", exportRequestId);
                await _repository.UpdateStatusAsync(exportRequestId, "failed", ex.Message);
                throw;
            }
        }

        public async Task<byte[]> DownloadExportFileAsync(int exportRequestId, int userId)
        {
            try
            {
                var request = await _repository.GetByIdAsync(exportRequestId);
                if (request == null || request.UserId != userId)
                {
                    throw new UnauthorizedAccessException("Export request not found or access denied");
                }

                if (string.IsNullOrEmpty(request.FilePath) || !File.Exists(request.FilePath))
                {
                    throw new FileNotFoundException("Export file not found");
                }

                return await File.ReadAllBytesAsync(request.FilePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading export file for request {RequestId}", exportRequestId);
                throw;
            }
        }

        public async Task<bool> CleanupExpiredExportsAsync()
        {
            try
            {
                var expirationDate = DateTime.UtcNow.AddDays(-7); // Clean up files older than 7 days
                var expiredRequests = await _repository.GetExpiredRequestsAsync(expirationDate);

                foreach (var request in expiredRequests)
                {
                    if (!string.IsNullOrEmpty(request.FilePath) && File.Exists(request.FilePath))
                    {
                        File.Delete(request.FilePath);
                    }
                    await _repository.DeleteAsync(request.Id);
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired exports");
                return false;
            }
        }

        public async Task<IEnumerable<string>> GetSupportedFormatsAsync()
        {
            return await Task.FromResult(new[] { "json", "csv", "excel" });
        }

        public async Task<long> GetExportFileSizeAsync(int exportRequestId)
        {
            try
            {
                var request = await _repository.GetByIdAsync(exportRequestId);
                if (request == null || string.IsNullOrEmpty(request.FilePath) || !File.Exists(request.FilePath))
                {
                    return 0;
                }

                var fileInfo = new FileInfo(request.FilePath);
                return fileInfo.Length;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export file size for request {RequestId}", exportRequestId);
                return 0;
            }
        }

        public async Task<bool> IsExportReadyAsync(int exportRequestId)
        {
            try
            {
                var request = await _repository.GetByIdAsync(exportRequestId);
                return request?.Status == "completed";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking export status for request {RequestId}", exportRequestId);
                return false;
            }
        }

        private async Task<object> GetAnalyticsDataAsync(DataExportRequest request)
        {
            // Parse date range from JSON
            var dateRangeOptions = JsonDocument.Parse(request.DateRange);
            
            DateTime? startDate = null;
            DateTime? endDate = null;
            
            if (dateRangeOptions.RootElement.TryGetProperty("start", out var startElement))
            {
                DateTime.TryParse(startElement.GetString(), out var start);
                startDate = start;
            }
            
            if (dateRangeOptions.RootElement.TryGetProperty("end", out var endElement))
            {
                DateTime.TryParse(endElement.GetString(), out var end);
                endDate = end;
            }

            // Parse filters to determine data type
            var filters = JsonDocument.Parse(request.Filters);
            var dataType = "advanced"; // default
            
            if (filters.RootElement.TryGetProperty("dataType", out var dataTypeElement))
            {
                dataType = dataTypeElement.GetString() ?? "advanced";
            }

            // Get analytics data based on data type
            return dataType switch
            {
                "advanced" => await _analyticsService.GetUserAnalyticsDashboardAsync(request.UserId, startDate, endDate),
                "trends" => await _analyticsService.GetUserProductivityInsightsAsync(request.UserId),
                "productivity" => await _analyticsService.GetUserProductivityInsightsAsync(request.UserId),
                _ => await _analyticsService.GetUserAnalyticsDashboardAsync(request.UserId, startDate, endDate)
            };
        }

        private async Task GenerateJsonFileAsync(string filePath, object data)
        {
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);
        }

        private async Task GenerateCsvFileAsync(string filePath, object data)
        {
            // Simple CSV generation - in a real app, you'd use a proper CSV library
            var json = JsonSerializer.Serialize(data);
            var csv = ConvertJsonToCsv(json);
            await File.WriteAllTextAsync(filePath, csv, Encoding.UTF8);
        }

        private async Task GenerateExcelFileAsync(string filePath, object data)
        {
            // For now, just generate JSON - in a real app, you'd use a library like EPPlus
            await GenerateJsonFileAsync(filePath.Replace(".excel", ".json"), data);
        }

        private string ConvertJsonToCsv(string json)
        {
            // Simple JSON to CSV conversion - this is a basic implementation
            var lines = new List<string>();
            lines.Add("Property,Value");
            
            // This is a simplified conversion - a real implementation would be more sophisticated
            var doc = JsonDocument.Parse(json);
            foreach (var property in doc.RootElement.EnumerateObject())
            {
                lines.Add($"{property.Name},{property.Value}");
            }
            
            return string.Join(Environment.NewLine, lines);
        }
    }
} 