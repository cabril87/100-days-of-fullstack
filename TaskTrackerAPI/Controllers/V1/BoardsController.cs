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
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Boards;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Extensions;
using Microsoft.AspNetCore.Http;
using TaskTrackerAPI.Controllers.V2;

namespace TaskTrackerAPI.Controllers.V1
{
    /// <summary>
    /// API controller for managing boards
    /// </summary>
    [ApiVersion("1.0")]
    [Authorize]
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class BoardsController : BaseApiController
    {
        private readonly ILogger<BoardsController> _logger;
        private readonly IBoardService _boardService;

        /// <summary>
        /// Constructor for BoardsController
        /// </summary>
        /// <param name="logger">Logger instance</param>
        /// <param name="boardService">Board service instance</param>
        public BoardsController(ILogger<BoardsController> logger, IBoardService boardService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _boardService = boardService ?? throw new ArgumentNullException(nameof(boardService));
        }

        /// <summary>
        /// Get all boards for the current user
        /// </summary>
        /// <returns>List of boards</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<BoardDTO>>> GetAllBoards()
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                IEnumerable<BoardDTO> boards = await _boardService.GetAllBoardsAsync(userId);
                
                return Ok(ApiResponse<IEnumerable<BoardDTO>>.SuccessResponse(boards));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving boards");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<IEnumerable<BoardDTO>>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Get a board by ID
        /// </summary>
        /// <param name="id">Board ID</param>
        /// <returns>Board details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BoardDTO>> GetBoardById(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                BoardDTO? board = await _boardService.GetBoardByIdAsync(userId, id);
                
                if (board == null)
                {
                    return NotFound(ApiResponse<BoardDTO>.NotFoundResponse($"Board with ID {id} not found"));
                }

                return Ok(ApiResponse<BoardDTO>.SuccessResponse(board));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving board with ID {BoardId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Get a board with its tasks
        /// </summary>
        /// <param name="id">Board ID</param>
        /// <returns>Board with tasks</returns>
        [HttpGet("{id}/tasks")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BoardDetailDTO>> GetBoardWithTasks(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                BoardDetailDTO? boardDetail = await _boardService.GetBoardWithTasksAsync(userId, id);
                
                if (boardDetail == null)
                {
                    return NotFound(ApiResponse<BoardDetailDTO>.NotFoundResponse($"Board with ID {id} not found"));
                }

                return Ok(ApiResponse<BoardDetailDTO>.SuccessResponse(boardDetail));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving board with tasks for ID {BoardId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<BoardDetailDTO>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Create a new board
        /// </summary>
        /// <param name="boardDTO">Board creation data</param>
        /// <returns>Created board</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BoardDTO>> CreateBoard(CreateBoardDTO boardDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<BoardDTO>.BadRequestResponse("Invalid board data"));
            }
            
            try
            {
                int userId = User.GetUserIdAsInt();
                
                BoardDTO? createdBoard = await _boardService.CreateBoardAsync(userId, boardDTO);
                
                if (createdBoard == null)
                {
                    return BadRequest(ApiResponse<BoardDTO>.BadRequestResponse("Failed to create board"));
                }

                return CreatedAtAction(nameof(GetBoardById), new { id = createdBoard.Id }, ApiResponse<BoardDTO>.SuccessResponse(createdBoard));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating board");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Update an existing board
        /// </summary>
        /// <param name="id">Board ID</param>
        /// <param name="boardDTO">Updated board data</param>
        /// <returns>Updated board</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BoardDTO>> UpdateBoard(int id, UpdateBoardDTO boardDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<BoardDTO>.BadRequestResponse("Invalid board data"));
            }
            
            try
            {
                int userId = User.GetUserIdAsInt();
                
                BoardDTO? updatedBoard = await _boardService.UpdateBoardAsync(userId, id, boardDTO);
                
                if (updatedBoard == null)
                {
                    return NotFound(ApiResponse<BoardDTO>.NotFoundResponse($"Board with ID {id} not found"));
                }

                return Ok(ApiResponse<BoardDTO>.SuccessResponse(updatedBoard));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating board with ID {BoardId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Delete a board
        /// </summary>
        /// <param name="id">Board ID</param>
        /// <returns>No content if successful</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> DeleteBoard(int id)
        {
            try
            {
                int userId = User.GetUserIdAsInt();
                
                await _boardService.DeleteBoardAsync(userId, id);
                
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Board not found or access denied for ID {BoardId}", id);
                return NotFound(ApiResponse<object>.NotFoundResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting board with ID {BoardId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ServerErrorResponse());
            }
        }

        /// <summary>
        /// Reorder a task within a board
        /// </summary>
        /// <param name="id">Board ID</param>
        /// <param name="reorderDTO">Task reordering data</param>
        /// <returns>Updated board</returns>
        [HttpPut("{id}/reorder")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<BoardDTO>> ReorderTaskInBoard(int id, TaskReorderDTO reorderDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<BoardDTO>.BadRequestResponse("Invalid reordering data"));
            }
            
            try
            {
                int userId = User.GetUserIdAsInt();
                
                BoardDTO? updatedBoard = await _boardService.ReorderTaskInBoardAsync(userId, id, reorderDTO);
                
                if (updatedBoard == null)
                {
                    return NotFound(ApiResponse<BoardDTO>.NotFoundResponse($"Board with ID {id} or task not found"));
                }

                return Ok(ApiResponse<BoardDTO>.SuccessResponse(updatedBoard));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "User tried to reorder a task they don't own");
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<BoardDTO>.ForbiddenResponse("You don't have permission to reorder this task"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering task in board with ID {BoardId}", id);
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }
    }
} 