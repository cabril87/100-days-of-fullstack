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
        int userId = User.GetUserId();
        return Ok(await _categoryService.GetAllCategoriesAsync(userId));
    }

    // GET: api/Categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDTO>> GetCategory(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            CategoryDTO? category = await _categoryService.GetCategoryByIdAsync(id, userId);
            
            if (category == null)
            {
                return NotFound($"Category with ID {id} not found");
            }
            
            return Ok(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while retrieving the category.");
        }
    }
    
    // GET: api/Categories/{id}/tasks
    [HttpGet("{id}/tasks")]
    public async Task<ActionResult<IEnumerable<TaskItemDTO>>> GetTasksByCategory(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            // First check if the category exists
            bool isCategoryOwned = await _categoryService.IsCategoryOwnedByUserAsync(id, userId);
            
            if (!isCategoryOwned)
            {
                return NotFound($"Category with ID {id} not found");
            }
            
            IEnumerable<TaskItemDTO> tasks = await _taskService.GetTasksByCategoryAsync(userId, id);
            
            return Ok(tasks);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while retrieving the tasks.");
        }
    }

    // POST: api/Categories
    [HttpPost]
    public async Task<ActionResult<CategoryDTO>> CreateCategory(CategoryCreateDTO categoryDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            CategoryDTO? newCategory = await _categoryService.CreateCategoryAsync(userId, categoryDto);
            
            if (newCategory == null)
            {
                return BadRequest("Failed to create category");
            }
            
            return CreatedAtAction(nameof(GetCategory), new { id = newCategory.Id }, newCategory);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category");
            return StatusCode(500, "An error occurred while creating the category.");
        }
    }

    // PUT: api/Categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDTO categoryDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            CategoryDTO? updatedCategory = await _categoryService.UpdateCategoryAsync(id, userId, categoryDto);
            
            if (updatedCategory == null)
            {
                return NotFound($"Category with ID {id} not found");
            }
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while updating the category.");
        }
    }

    // DELETE: api/Categories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            bool success = await _categoryService.DeleteCategoryAsync(id, userId);
            
            if (!success)
            {
                return NotFound($"Category with ID {id} not found");
            }
            
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while deleting the category.");
        }
    }
    
    // GET: api/Categories/search
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<CategoryDTO>>> SearchCategories([FromQuery] string term)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<CategoryDTO> categories = await _categoryService.SearchCategoriesAsync(userId, term);
            
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching categories");
            return StatusCode(500, "An error occurred while searching categories.");
        }
    }
    
    // GET: api/Categories/5/tasks-count
    [HttpGet("{id}/tasks-count")]
    public async Task<ActionResult<int>> GetCategoryTaskCount(int id)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            int count = await _categoryService.GetTaskCountInCategoryAsync(id, userId);
            
            return Ok(count);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting task count for category with ID {CategoryId}", id);
            return StatusCode(500, "An error occurred while getting the task count.");
        }
    }
    
    // GET: api/Categories/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<Dictionary<string, int>>> GetCategoryStatistics()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            Dictionary<string, int> statistics = await _categoryService.GetCategoryStatisticsAsync(userId);
            
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category statistics");
            return StatusCode(500, "An error occurred while retrieving category statistics.");
        }
    }

    [HttpGet("paged")]
    public async Task<ActionResult<PagedResult<CategoryDTO>>> GetPagedCategories([FromQuery] PaginationParams paginationParams)
    {
        int userId = User.GetUserId();
        PagedResult<CategoryDTO> pagedCategories = await _categoryService.GetPagedCategoriesAsync(userId, paginationParams);
        return Ok(pagedCategories);
    }
}