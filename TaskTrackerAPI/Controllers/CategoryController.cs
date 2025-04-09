// Controllers/CategoriesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetCategories()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var categories = await _context.Categories
            .Where(c => c.UserId == userId)
            .ToListAsync();

        var categoryDtos = categories.Select(c => new CategoryDTO
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            UserId = c.UserId
        }).ToList();

        return Ok(categoryDtos);
    }

    // GET: api/Categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDTO>> GetCategory(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        var categoryDto = new CategoryDTO
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            UserId = category.UserId
        };

        return categoryDto;
    }

    // POST: api/Categories
    [HttpPost]
    public async Task<ActionResult<CategoryDTO>> CreateCategory(CategoryCreateDTO createDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var category = new Category
        {
            Name = createDto.Name,
            Description = createDto.Description,
            UserId = userId
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var categoryDto = new CategoryDTO
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            UserId = category.UserId
        };

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
    }

    // PUT: api/Categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDTO updateDto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        category.Name = updateDto.Name;
        category.Description = updateDto.Description;

        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoryExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE: api/Categories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        // Check if there are any tasks using this category
        var hasAssociatedTasks = await _context.Tasks
            .AnyAsync(t => t.CategoryId == id);

        if (hasAssociatedTasks)
        {
            return BadRequest("Cannot delete category that has associated tasks. Update or delete those tasks first.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoryExists(int id)
    {
        return _context.Categories.Any(e => e.Id == id);
    }
}