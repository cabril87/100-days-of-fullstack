// Controllers/CategoriesController.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ITaskService _taskService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ITaskService taskService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _taskService = taskService;
        _logger = logger;
    }

    // GET: api/Categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetCategories()
    {
        try
        {
            int userId = User.GetUserId();
            IEnumerable<CategoryDTO> categories = await _categoryService.GetAllCategoriesAsync(userId);
            return Ok(categories);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt in GetCategories");
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, "An error occurred while retrieving categories");
        }
    }

    // GET: api/Categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDTO>> GetCategory(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { error = "Invalid category ID. ID must be greater than zero." });
            }
            
            int userId = User.GetUserId();
            
            // First check if the category exists and belongs to the user
            bool isCategoryOwned = await _categoryService.IsCategoryOwnedByUserAsync(id, userId);
            
            if (!isCategoryOwned)
            {
                return NotFound(new { error = $"Category with ID {id} not found" });
            }
            
            CategoryDTO? category = await _categoryService.GetCategoryByIdAsync(id, userId);
            
            if (category == null)
            {
                return NotFound(new { error = $"Category with ID {id} not found" });
            }
            
            return Ok(category);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for category {CategoryId}", id);
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category with ID {CategoryId}", id);
            return StatusCode(500, new { error = "An unexpected error occurred while retrieving the category." });
        }
    }
    
    // GET: api/Categories/{id}/tasks
    [HttpGet("{id}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByCategory(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { error = "Invalid category ID. ID must be greater than zero." });
            }
            
            int userId = User.GetUserId();
            
            // First check if the category exists
            bool isCategoryOwned = await _categoryService.IsCategoryOwnedByUserAsync(id, userId);
            
            if (!isCategoryOwned)
            {
                return NotFound(new { error = $"Category with ID {id} not found" });
            }
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByCategoryAsync(userId, id);
            
            return Ok(tasks);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for tasks in category {CategoryId}", id);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for category with ID {CategoryId}", id);
            return StatusCode(500, new { error = "An unexpected error occurred while retrieving the tasks." });
        }
    }

    // POST: api/Categories
    [HttpPost]
    public async Task<ActionResult<CategoryDTO>> CreateCategory(CategoryCreateDTO categoryDto)
    {
        try
        {
            // Validate the input
            if (categoryDto == null)
            {
                return BadRequest(new { error = "Category data is required" });
            }

            if (string.IsNullOrWhiteSpace(categoryDto.Name))
            {
                return BadRequest(new { error = "Category name is required" });
            }

            if (categoryDto.Name.Length > 100)
            {
                return BadRequest(new { error = "Category name cannot exceed 100 characters" });
            }
            
            int userId = User.GetUserId();
            
            CategoryDTO? newCategory = await _categoryService.CreateCategoryAsync(userId, categoryDto);
            
            return CreatedAtAction(nameof(GetCategory), new { id = newCategory.Id }, newCategory);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validation error during category creation: {Message}", ex.Message);
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt in CreateCategory");
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, new { error = "An unexpected error occurred while creating the category." });
        }
    }

    // PUT: api/Categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDTO categoryDto)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { error = "Invalid category ID. ID must be greater than zero." });
            }
            
            if (categoryDto == null)
            {
                return BadRequest(new { error = "Category data is required" });
            }

            if (categoryDto.Name != null && categoryDto.Name.Length > 100)
            {
                return BadRequest(new { error = "Category name cannot exceed 100 characters" });
            }
            
            int userId = User.GetUserId();
            
            CategoryDTO? updatedCategory = await _categoryService.UpdateCategoryAsync(id, userId, categoryDto);
            
            if (updatedCategory == null)
            {
                return NotFound(new { error = $"Category with ID {id} not found" });
            }
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validation error during category update: {Message}", ex.Message);
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt updating category {CategoryId}", id);
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category with ID {CategoryId}", id);
            return StatusCode(500, new { error = "An unexpected error occurred while updating the category." });
        }
    }

    // DELETE: api/Categories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { error = "Invalid category ID. ID must be greater than zero." });
            }
            
            int userId = User.GetUserId();
            
            bool success = await _categoryService.DeleteCategoryAsync(id, userId);
            
            if (!success)
            {
                return NotFound(new { error = $"Category with ID {id} not found" });
            }
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Operation not allowed: {Message}", ex.Message);
            return BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt deleting category {CategoryId}", id);
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category with ID {CategoryId}", id);
            return StatusCode(500, new { error = "An unexpected error occurred while deleting the category." });
        }
    }
    
    // GET: api/Categories/search
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<CategoryDTO>>> SearchCategories([FromQuery] string term)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return BadRequest(new { error = "Search term is required" });
            }
            
            int userId = User.GetUserId();
            
            IEnumerable<CategoryDTO> categories = await _categoryService.SearchCategoriesAsync(userId, term);
            
            return Ok(categories);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt in SearchCategories");
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching categories with term {Term}", term);
            return StatusCode(500, new { error = "An unexpected error occurred while searching categories." });
        }
    }
    
    // GET: api/Categories/5/tasks-count
    [HttpGet("{id}/tasks-count")]
    public async Task<ActionResult<int>> GetCategoryTaskCount(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { error = "Invalid category ID. ID must be greater than zero." });
            }
            
            int userId = User.GetUserId();
            
            int count = await _categoryService.GetTaskCountInCategoryAsync(id, userId);
            
            return Ok(count);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt for task count in category {CategoryId}", id);
            return Forbid();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting task count for category with ID {CategoryId}", id);
            return StatusCode(500, new { error = "An unexpected error occurred while getting the task count." });
        }
    }
    
    // GET: api/Categories/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<Dictionary<string, int>>> GetCategoryStatistics()
    {
        try
        {
            int userId = User.GetUserId();
            
            Dictionary<string, int> statistics = await _categoryService.GetCategoryStatisticsAsync(userId);
            
            return Ok(statistics);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt in GetCategoryStatistics");
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category statistics");
            return StatusCode(500, new { error = "An unexpected error occurred while retrieving category statistics." });
        }
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<CategoryDTO>>> GetPagedCategories([FromQuery] PaginationParams paginationParams)
    {
        try
        {
            if (paginationParams == null)
            {
                paginationParams = new PaginationParams();
            }
            
            int userId = User.GetUserId();
            PagedResult<CategoryDTO> pagedCategories = await _categoryService.GetPagedCategoriesAsync(userId, paginationParams);
            return Ok(pagedCategories);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt in GetPagedCategories");
            return StatusCode(403, new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving paged categories");
            return StatusCode(500, new { error = "An unexpected error occurred while retrieving categories." });
        }
    }
}