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
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Attributes;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// API controller for board settings management
/// Supports comprehensive settings customization, export/import, and validation
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/boards/{boardId:int}/settings")]
[Authorize]
[RequireRole(UserRole.RegularUser)]
public class BoardSettingsController : BaseApiController
{
    private readonly IBoardSettingsService _boardSettingsService;
    private readonly IUserAccessor _userAccessor;
    private readonly ILogger<BoardSettingsController> _logger;

    public BoardSettingsController(
        IBoardSettingsService boardSettingsService,
        IUserAccessor userAccessor,
        ILogger<BoardSettingsController> logger)
    {
        _boardSettingsService = boardSettingsService ?? throw new ArgumentNullException(nameof(boardSettingsService));
        _userAccessor = userAccessor ?? throw new ArgumentNullException(nameof(userAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get board settings
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>Board settings</returns>
    [HttpGet]
    [ProducesResponseType(typeof(BoardSettingsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardSettingsDTO>> GetBoardSettings(int boardId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardSettingsDTO? settings = await _boardSettingsService.GetBoardSettingsAsync(boardId, userId);
            if (settings == null)
            {
                return NotFound($"Settings for board {boardId} not found");
            }

            return Ok(settings);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving board settings");
        }
    }

    /// <summary>
    /// Update board settings
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="updateDto">Settings update data</param>
    /// <returns>Updated settings</returns>
    [HttpPut]
    [ProducesResponseType(typeof(BoardSettingsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardSettingsDTO>> UpdateBoardSettings(
        int boardId, 
        [FromBody] UpdateBoardSettingsDTO updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardSettingsDTO updatedSettings = await _boardSettingsService.UpdateBoardSettingsAsync(boardId, updateDto, userId);
            
            return Ok(updatedSettings);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to update settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Invalid settings"))
        {
            _logger.LogWarning(ex, "Invalid settings for board {BoardId}", boardId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating board settings");
        }
    }

    /// <summary>
    /// Reset board settings to defaults
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>Reset settings</returns>
    [HttpPost("reset")]
    [ProducesResponseType(typeof(BoardSettingsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardSettingsDTO>> ResetToDefaults(int boardId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardSettingsDTO resetSettings = await _boardSettingsService.ResetToDefaultsAsync(boardId, userId);
            
            return Ok(resetSettings);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to reset settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while resetting board settings");
        }
    }

    /// <summary>
    /// Check if board has custom settings
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>Whether board has custom settings</returns>
    [HttpGet("has-custom")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> HasCustomSettings(int boardId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            bool hasCustom = await _boardSettingsService.HasCustomSettingsAsync(boardId, userId);
            
            return Ok(hasCustom);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to check custom settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking custom settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while checking custom settings");
        }
    }

    /// <summary>
    /// Export board settings as JSON
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <returns>JSON file with settings</returns>
    [HttpGet("export")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportSettings(int boardId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            string settingsJson = await _boardSettingsService.ExportSettingsAsync(boardId, userId);
            
            byte[] fileBytes = System.Text.Encoding.UTF8.GetBytes(settingsJson);
            string fileName = $"board-{boardId}-settings-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json";
            
            return File(fileBytes, "application/json", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to export settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while exporting board settings");
        }
    }

    /// <summary>
    /// Import board settings from JSON
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="settingsFile">JSON file with settings</param>
    /// <returns>Imported settings</returns>
    [HttpPost("import")]
    [ProducesResponseType(typeof(BoardSettingsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardSettingsDTO>> ImportSettings(
        int boardId, 
        IFormFile settingsFile)
    {
        if (settingsFile == null || settingsFile.Length == 0)
        {
            return BadRequest("Settings file is required");
        }

        if (!settingsFile.ContentType.Contains("json") && !settingsFile.FileName.EndsWith(".json"))
        {
            return BadRequest("File must be a JSON file");
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            string settingsJson;
            using (StreamReader reader = new StreamReader(settingsFile.OpenReadStream()))
            {
                settingsJson = await reader.ReadToEndAsync();
            }

            if (string.IsNullOrWhiteSpace(settingsJson))
            {
                return BadRequest("Settings file is empty");
            }

            BoardSettingsDTO importedSettings = await _boardSettingsService.ImportSettingsAsync(boardId, settingsJson, userId);
            
            return Ok(importedSettings);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to import settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Invalid JSON in settings file for board {BoardId}", boardId);
            return BadRequest("Invalid JSON format in settings file");
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Invalid settings"))
        {
            _logger.LogWarning(ex, "Invalid settings in import for board {BoardId}", boardId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while importing board settings");
        }
    }

    /// <summary>
    /// Copy settings from another board
    /// </summary>
    /// <param name="boardId">Target board ID</param>
    /// <param name="sourceBoardId">Source board ID</param>
    /// <returns>Copied settings</returns>
    [HttpPost("copy/{sourceBoardId:int}")]
    [ProducesResponseType(typeof(BoardSettingsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BoardSettingsDTO>> CopySettings(int boardId, int sourceBoardId)
    {
        if (boardId == sourceBoardId)
        {
            return BadRequest("Source and target boards cannot be the same");
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            BoardSettingsDTO copiedSettings = await _boardSettingsService.CopySettingsAsync(sourceBoardId, boardId, userId);
            
            return Ok(copiedSettings);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to copy settings from board {SourceBoardId} to board {BoardId}", sourceBoardId, boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board not found when copying settings from {SourceBoardId} to {BoardId}", sourceBoardId, boardId);
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error copying settings from board {SourceBoardId} to board {BoardId}", sourceBoardId, boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while copying board settings");
        }
    }

    /// <summary>
    /// Validate settings before applying
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="updateDto">Settings to validate</param>
    /// <returns>Validation result</returns>
    [HttpPost("validate")]
    [ProducesResponseType(typeof(SettingsValidationResultDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<SettingsValidationResultDTO>> ValidateSettings(
        int boardId, 
        [FromBody] UpdateBoardSettingsDTO updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            SettingsValidationResultDTO validation = await _boardSettingsService.ValidateSettingsAsync(updateDto, userId);
            
            return Ok(validation);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to validate settings for board {BoardId}", boardId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating settings for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while validating settings");
        }
    }
} 