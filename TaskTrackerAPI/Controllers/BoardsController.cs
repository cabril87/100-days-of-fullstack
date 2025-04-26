using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Utils;

namespace TaskTrackerAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BoardsController : ControllerBase
    {
        private readonly ILogger<BoardsController> _logger;
        private readonly IBoardService _boardService;

        public BoardsController(ILogger<BoardsController> logger, IBoardService boardService)
        {
            _logger = logger;
            _boardService = boardService;
        }

        // GET: api/Boards
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BoardDTO>>> GetAllBoards()
        {
            try
            {
                int userId = User.GetUserId();
                
                IEnumerable<BoardDTO> boards = await _boardService.GetAllBoardsAsync(userId);
                
                return Ok(ApiResponse<IEnumerable<BoardDTO>>.SuccessResponse(boards));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving boards");
                return StatusCode(500, ApiResponse<IEnumerable<BoardDTO>>.ServerErrorResponse());
            }
        }

        // GET: api/Boards/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BoardDTO>> GetBoardById(int id)
        {
            try
            {
                int userId = User.GetUserId();
                
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
                return StatusCode(500, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }

        // GET: api/Boards/{id}/tasks
        [HttpGet("{id}/tasks")]
        public async Task<ActionResult<BoardDetailDTO>> GetBoardWithTasks(int id)
        {
            try
            {
                int userId = User.GetUserId();
                
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
                return StatusCode(500, ApiResponse<BoardDetailDTO>.ServerErrorResponse());
            }
        }

        // POST: api/Boards
        [HttpPost]
        public async Task<ActionResult<BoardDTO>> CreateBoard(CreateBoardDTO boardDTO)
        {
            try
            {
                int userId = User.GetUserId();
                
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
                return StatusCode(500, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }

        // PUT: api/Boards/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<BoardDTO>> UpdateBoard(int id, UpdateBoardDTO boardDTO)
        {
            try
            {
                int userId = User.GetUserId();
                
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
                return StatusCode(500, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }

        // DELETE: api/Boards/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteBoard(int id)
        {
            try
            {
                int userId = User.GetUserId();
                
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
                return StatusCode(500, ApiResponse<object>.ServerErrorResponse());
            }
        }

        // PUT: api/Boards/{id}/reorder
        [HttpPut("{id}/reorder")]
        public async Task<ActionResult<BoardDTO>> ReorderTaskInBoard(int id, TaskReorderDTO reorderDTO)
        {
            try
            {
                int userId = User.GetUserId();
                
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
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reordering task in board with ID {BoardId}", id);
                return StatusCode(500, ApiResponse<BoardDTO>.ServerErrorResponse());
            }
        }
    }
} 