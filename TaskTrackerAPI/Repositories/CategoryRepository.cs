// Repositories/CategoryRepository.cs
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ApplicationDbContext _context;
    
    public CategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<Category>> GetCategoriesForUserAsync(int userId)
    {
        return await _context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Name)
            .ToListAsync();
    }
    
    public async Task<Category?> GetCategoryByIdAsync(int categoryId, int userId)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);
    }
    
    public async Task<Category> CreateCategoryAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();
        return category;
    }
    
    public async Task UpdateCategoryAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }
    
    public async Task DeleteCategoryAsync(int categoryId, int userId)
    {
        Category? category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.UserId == userId);
            
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<bool> IsCategoryOwnedByUserAsync(int categoryId, int userId)
    {
        return await _context.Categories
            .AnyAsync(c => c.Id == categoryId && c.UserId == userId);
    }
    
    public async Task<bool> HasTasksAsync(int categoryId)
    {
        return await _context.Tasks
            .AnyAsync(t => t.CategoryId == categoryId);
    }
    
    public async Task<int> GetCategoryTaskCountAsync(int categoryId)
    {
        return await _context.Tasks
            .CountAsync(t => t.CategoryId == categoryId);
    }
    
    public async Task<IEnumerable<Category>> SearchCategoriesAsync(int userId, string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return await GetCategoriesForUserAsync(userId);
        }
        
        searchTerm = searchTerm.ToLower();
        
        return await _context.Categories
            .Where(c => c.UserId == userId && 
                (c.Name.ToLower().Contains(searchTerm) || 
                 (c.Description != null && c.Description.ToLower().Contains(searchTerm))))
            .OrderBy(c => c.Name)
            .ToListAsync();
    }
}