// Controllers/CategoriesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ICategoryService categoryService, ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    // GET: api/Categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetCategories()
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            IEnumerable<CategoryDTO> categories = await _categoryService.GetAllCategoriesAsync(userId);
            
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, "An error occurred while retrieving categories.");
        }
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

    // POST: api/Categories
    [HttpPost]
    public async Task<ActionResult<CategoryDTO>> CreateCategory(CategoryCreateDTO createDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            CategoryDTO category = await _categoryService.CreateCategoryAsync(userId, createDto);
            
            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
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
    public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDTO updateDto)
    {
        try
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            
            CategoryDTO? category = await _categoryService.UpdateCategoryAsync(id, userId, updateDto);
            
            if (category == null)
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
}