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

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrackerAPI.DTOs.Analytics;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Attributes;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System;
using System.IO;
using TaskTrackerAPI.Controllers.V2;
using System.Collections.Generic;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// Data export controller - handles user data export requests in various formats.
    /// Accessible to all authenticated users (RegularUser and above).
    /// Users can only export their own data with privacy protections.
    /// </summary>
    [ApiVersion("1.0")]
    [Authorize]
    [RequireRole(UserRole.RegularUser)] // All authenticated users can export their own data
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    [SecurityRequirements(SecurityRequirementLevel.Authenticated)]
    public class DataExportController : BaseApiController
    {
        private readonly IDataExportService _dataExportService;
        private readonly ILogger<DataExportController> _logger;

        public DataExportController(
            IDataExportService dataExportService,
            ILogger<DataExportController> logger)
        {
            _dataExportService = dataExportService;
            _logger = logger;
        }

        /// <summary>
        /// Get all export requests for the current user
        /// </summary>
        /// <returns>List of export requests</returns>
        [HttpGet]
        public async Task<IActionResult> GetUserExportRequests()
        {
            try
            {
                int userId = GetUserIdFromClaims();
                IEnumerable<DataExportRequestDTO> requests = await _dataExportService.GetUserExportRequestsAsync(userId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export requests");
                return StatusCode(500, "An error occurred while retrieving export requests.");
            }
        }

        /// <summary>
        /// Get a specific export request by ID
        /// </summary>
        /// <param name="id">Export request ID</param>
        /// <returns>Export request details</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetExportRequestById(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DataExportRequestDTO? request = await _dataExportService.GetExportRequestByIdAsync(id, userId);
                
                if (request == null)
                {
                    return NotFound("Export request not found or access denied.");
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export request {RequestId}", id);
                return StatusCode(500, "An error occurred while retrieving the export request.");
            }
        }

        /// <summary>
        /// Create a new export request
        /// </summary>
        /// <param name="createDto">Export request creation data</param>
        /// <returns>Created export request</returns>
        [HttpPost]
        public async Task<IActionResult> CreateExportRequest([FromBody] CreateDataExportRequestDTO createDto)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DataExportRequestDTO request = await _dataExportService.CreateExportRequestAsync(createDto, userId);
                return CreatedAtAction(nameof(GetExportRequestById), new { id = request.Id }, request);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating export request");
                return StatusCode(500, "An error occurred while creating the export request.");
            }
        }

        /// <summary>
        /// Create a new export request with simplified format (for frontend compatibility)
        /// </summary>
        /// <param name="simpleRequest">Simple export request with exportType and format</param>
        /// <returns>Created export request</returns>
        [HttpPost("simple")]
        public async Task<IActionResult> CreateSimpleExportRequest([FromBody] SimpleDataExportRequestDTO simpleRequest)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                
                // Convert to the expected DTO format
                CreateDataExportRequestDTO createDto = new CreateDataExportRequestDTO
                {
                    ExportType = simpleRequest.Format, // Use the format as export type (json, csv, pdf)
                    DateRange = "{\"range\":\"all\",\"startDate\":null,\"endDate\":null}", // Default date range
                    Filters = "{\"type\":\"" + simpleRequest.ExportType + "\",\"includeAll\":true}" // Include export type in filters
                };
                
                DataExportRequestDTO request = await _dataExportService.CreateExportRequestAsync(createDto, userId);
                return CreatedAtAction(nameof(GetExportRequestById), new { id = request.Id }, request);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating simple export request");
                return StatusCode(500, "An error occurred while creating the export request.");
            }
        }

        /// <summary>
        /// Delete an export request
        /// </summary>
        /// <param name="id">Export request ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExportRequest(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                bool success = await _dataExportService.DeleteExportRequestAsync(id, userId);
                
                if (!success)
                {
                    return NotFound("Export request not found or access denied.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting export request {RequestId}", id);
                return StatusCode(500, "An error occurred while deleting the export request.");
            }
        }

        /// <summary>
        /// Download an exported file
        /// </summary>
        /// <param name="id">Export request ID</param>
        /// <returns>File download</returns>
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadExportFile(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                var fileBytes = await _dataExportService.DownloadExportFileAsync(id, userId);
                
                DataExportRequestDTO? request = await _dataExportService.GetExportRequestByIdAsync(id, userId);
                if (request == null)
                {
                    return NotFound("Export request not found or access denied.");
                }

                string fileName = $"export_{id}_{DateTime.UtcNow:yyyyMMdd}.{request.ExportType}";
                string contentType = GetContentType(request.ExportType);

                return File(fileBytes, contentType, fileName);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading export file for request {RequestId}", id);
                return StatusCode(500, "An error occurred while downloading the export file.");
            }
        }

        /// <summary>
        /// Check if an export is ready for download
        /// </summary>
        /// <param name="id">Export request ID</param>
        /// <returns>Export status</returns>
        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetExportStatus(int id)
        {
            try
            {
                int userId = GetUserIdFromClaims();
                DataExportRequestDTO? request = await _dataExportService.GetExportRequestByIdAsync(id, userId);
                
                if (request == null)
                {
                    return NotFound("Export request not found or access denied.");
                }

                bool isReady = await _dataExportService.IsExportReadyAsync(id);
                long fileSize = await _dataExportService.GetExportFileSizeAsync(id);

                return Ok(new
                {
                    Id = id,
                    Status = request.Status,
                    IsReady = isReady,
                    FileSize = fileSize,
                    CreatedAt = request.CreatedAt,
                    CompletedAt = request.CompletedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export status for request {RequestId}", id);
                return StatusCode(500, "An error occurred while checking export status.");
            }
        }

        /// <summary>
        /// Get supported export formats
        /// </summary>
        /// <returns>List of supported formats</returns>
        [HttpGet("formats")]
        public async Task<IActionResult> GetSupportedFormats()
        {
            try
            {
                IEnumerable<string> formats = await _dataExportService.GetSupportedFormatsAsync();
                return Ok(formats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported formats");
                return StatusCode(500, "An error occurred while retrieving supported formats.");
            }
        }

        /// <summary>
        /// Cleanup expired export files (admin only)
        /// </summary>
        /// <returns>Success status</returns>
        [HttpPost("cleanup")]
        [SecurityRequirements(SecurityRequirementLevel.AdminOnly)]
        public async Task<IActionResult> CleanupExpiredExports()
        {
            try
            {
                bool success = await _dataExportService.CleanupExpiredExportsAsync();
                
                if (success)
                {
                    return Ok(new { Message = "Cleanup completed successfully" });
                }
                
                return StatusCode(500, "Cleanup operation failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during cleanup operation");
                return StatusCode(500, "An error occurred during cleanup operation.");
            }
        }

        private string GetContentType(string format)
        {
            return format.ToLowerInvariant() switch
            {
                "json" => "application/json",
                "csv" => "text/csv",
                "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                _ => "application/octet-stream"
            };
        }
    }
} 