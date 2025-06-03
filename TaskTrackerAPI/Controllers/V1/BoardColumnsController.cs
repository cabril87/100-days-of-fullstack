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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Controllers.V2;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers.V1;

/// <summary>
/// API controller for board column management operations
/// Supports custom columns, WIP limits, reordering, and visibility management
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/boards/{boardId:int}/columns")]
[Authorize]
public class BoardColumnsController : BaseApiController
{
    private readonly IBoardColumnService _boardColumnService;
    private readonly IUserAccessor _userAccessor;
    private readonly ILogger<BoardColumnsController> _logger;

    public BoardColumnsController(
        IBoardColumnService boardColumnService,
        IUserAccessor userAccessor,
        ILogger<BoardColumnsController> logger)
    {
        _boardColumnService = boardColumnService ?? throw new ArgumentNullException(nameof(boardColumnService));
        _userAccessor = userAccessor ?? throw new ArgumentNullException(nameof(userAccessor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get all columns for a board
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="includeHidden">Include hidden columns in response</param>
    /// <returns>List of board columns</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<EnhancedBoardColumnDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<EnhancedBoardColumnDTO>>> GetBoardColumns(
        int boardId, 
        [FromQuery] bool includeHidden = false)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            IEnumerable<EnhancedBoardColumnDTO> columns = includeHidden 
                ? await _boardColumnService.GetBoardColumnsAsync(boardId, userId)
                : await _boardColumnService.GetVisibleBoardColumnsAsync(boardId, userId);

            return Ok(columns);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to board {BoardId} columns", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Board {BoardId} not found", boardId);
            return NotFound($"Board {boardId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting columns for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving board columns");
        }
    }

    /// <summary>
    /// Get a specific column by ID
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID</param>
    /// <returns>Board column details</returns>
    [HttpGet("{columnId:int}")]
    [ProducesResponseType(typeof(EnhancedBoardColumnDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnhancedBoardColumnDTO>> GetColumn(int boardId, int columnId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            EnhancedBoardColumnDTO? column = await _boardColumnService.GetColumnByIdAsync(columnId, userId);
            if (column == null)
            {
                return NotFound($"Column {columnId} not found");
            }

            return Ok(column);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to column {ColumnId}", columnId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the column");
        }
    }

    /// <summary>
    /// Create a new column for a board
    /// </summary>
    [HttpPost]
#if DEBUG
    [AllowAnonymous] // Allow anonymous column creation in development
#endif
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BoardColumnDTO>> CreateColumn(int boardId, [FromBody] CreateEnhancedBoardColumnDTO columnDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // For development, use a default user ID if no user is authenticated
            int userId;
#if DEBUG
            if (User.Identity?.IsAuthenticated == true)
            {
                userId = int.Parse(_userAccessor.GetCurrentUserId());
            }
            else
            {
                userId = 1; // Default development user
            }
#else
            userId = int.Parse(_userAccessor.GetCurrentUserId());
#endif
            
            EnhancedBoardColumnDTO createdColumn = await _boardColumnService.CreateColumnAsync(boardId, columnDto, userId);
            
            return CreatedAtAction(
                nameof(GetColumn), 
                new { boardId = boardId, columnId = createdColumn.Id }, 
                createdColumn);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to create column in board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation creating column in board {BoardId}", boardId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating column in board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the column");
        }
    }

    /// <summary>
    /// Update an existing board column
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID</param>
    /// <param name="updateDto">Column update data</param>
    /// <returns>Updated column</returns>
    [HttpPut("{columnId:int}")]
    [ProducesResponseType(typeof(EnhancedBoardColumnDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnhancedBoardColumnDTO>> UpdateColumn(
        int boardId, 
        int columnId, 
        [FromBody] UpdateEnhancedBoardColumnDTO updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            EnhancedBoardColumnDTO updatedColumn = await _boardColumnService.UpdateColumnAsync(columnId, updateDto, userId);
            
            return Ok(updatedColumn);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to update column {ColumnId}", columnId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Column {ColumnId} not found", columnId);
            return NotFound($"Column {columnId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation updating column {ColumnId}", columnId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the column");
        }
    }

    /// <summary>
    /// Delete a board column
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{columnId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteColumn(int boardId, int columnId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            bool success = await _boardColumnService.DeleteColumnAsync(columnId, userId);
            if (!success)
            {
                return NotFound($"Column {columnId} not found");
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to delete column {ColumnId}", columnId);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation deleting column {ColumnId}", columnId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the column");
        }
    }

    /// <summary>
    /// Reorder board columns
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnOrders">List of column order mappings</param>
    /// <returns>Success status</returns>
    [HttpPut("reorder")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ReorderColumns(
        int boardId, 
        [FromBody] List<ColumnOrderDTO> columnOrders)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            bool success = await _boardColumnService.ReorderColumnsAsync(boardId, columnOrders, userId);
            if (!success)
            {
                return BadRequest("Failed to reorder columns");
            }

            return Ok(new { message = "Columns reordered successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to reorder columns in board {BoardId}", boardId);
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation reordering columns in board {BoardId}", boardId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering columns in board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while reordering columns");
        }
    }

    /// <summary>
    /// Duplicate a column
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID to duplicate</param>
    /// <param name="newName">Name for the duplicate column</param>
    /// <returns>Duplicated column</returns>
    [HttpPost("{columnId:int}/duplicate")]
    [ProducesResponseType(typeof(EnhancedBoardColumnDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnhancedBoardColumnDTO>> DuplicateColumn(
        int boardId, 
        int columnId, 
        [FromBody] string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
        {
            return BadRequest("Column name is required");
        }

        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            EnhancedBoardColumnDTO duplicatedColumn = await _boardColumnService.DuplicateColumnAsync(columnId, newName, userId);
            
            return CreatedAtAction(
                nameof(GetColumn), 
                new { boardId = boardId, columnId = duplicatedColumn.Id }, 
                duplicatedColumn);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to duplicate column {ColumnId}", columnId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Column {ColumnId} not found", columnId);
            return NotFound($"Column {columnId} not found");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation duplicating column {ColumnId}", columnId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error duplicating column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while duplicating the column");
        }
    }

    /// <summary>
    /// Toggle column visibility
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID</param>
    /// <returns>Updated column</returns>
    [HttpPatch("{columnId:int}/toggle-visibility")]
    [ProducesResponseType(typeof(EnhancedBoardColumnDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EnhancedBoardColumnDTO>> ToggleColumnVisibility(
        int boardId, 
        int columnId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            EnhancedBoardColumnDTO updatedColumn = await _boardColumnService.ToggleColumnVisibilityAsync(columnId, userId);
            
            return Ok(updatedColumn);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to toggle visibility for column {ColumnId}", columnId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Column {ColumnId} not found", columnId);
            return NotFound($"Column {columnId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error toggling visibility for column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while toggling column visibility");
        }
    }

    /// <summary>
    /// Get WIP limit status for a column
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID</param>
    /// <returns>WIP limit status</returns>
    [HttpGet("{columnId:int}/wip-status")]
    [ProducesResponseType(typeof(WipLimitStatusDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WipLimitStatusDTO>> GetWipLimitStatus(
        int boardId, 
        int columnId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            WipLimitStatusDTO wipStatus = await _boardColumnService.GetWipLimitStatusAsync(columnId, userId);
            
            return Ok(wipStatus);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to WIP status for column {ColumnId}", columnId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Column {ColumnId} not found", columnId);
            return NotFound($"Column {columnId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting WIP status for column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving WIP status");
        }
    }

    /// <summary>
    /// Get column statistics
    /// </summary>
    /// <param name="boardId">Board ID</param>
    /// <param name="columnId">Column ID</param>
    /// <returns>Column statistics</returns>
    [HttpGet("{columnId:int}/statistics")]
    [ProducesResponseType(typeof(ColumnStatisticsDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ColumnStatisticsDTO>> GetColumnStatistics(
        int boardId, 
        int columnId)
    {
        try
        {
            int userId = int.Parse(_userAccessor.GetCurrentUserId());
            
            ColumnStatisticsDTO statistics = await _boardColumnService.GetColumnStatisticsAsync(columnId, userId);
            
            return Ok(statistics);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to statistics for column {ColumnId}", columnId);
            return Forbid();
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning(ex, "Column {ColumnId} not found", columnId);
            return NotFound($"Column {columnId} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting statistics for column {ColumnId}", columnId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving column statistics");
        }
    }

    /// <summary>
    /// Create default columns for a board
    /// </summary>
    [HttpPost("default")]
#if DEBUG
    [AllowAnonymous] // Allow anonymous default column creation in development
#endif
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<EnhancedBoardColumnDTO>>> CreateDefaultColumns(int boardId)
    {
        try
        {
            // For development, use a default user ID if no user is authenticated
            int userId;
#if DEBUG
            if (User.Identity?.IsAuthenticated == true)
            {
                userId = int.Parse(_userAccessor.GetCurrentUserId());
            }
            else
            {
                userId = 1; // Default development user
            }
#else
            userId = int.Parse(_userAccessor.GetCurrentUserId());
#endif
            
            IEnumerable<EnhancedBoardColumnDTO> defaultColumns = await _boardColumnService.CreateDefaultColumnsAsync(boardId, null, userId);
            
            return CreatedAtAction(
                nameof(GetBoardColumns), 
                new { boardId = boardId }, 
                defaultColumns);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to create default columns for board {BoardId}", boardId);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating default columns for board {BoardId}", boardId);
            return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating default columns");
        }
    }
} 