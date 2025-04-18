// Services/CategoryService.cs
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;
using AutoMapper;

namespace TaskTrackerAPI.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<CategoryService> _logger;
    private readonly IMapper _mapper;
    
    public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService> logger, IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _logger = logger;
        _mapper = mapper;
    }
    
    public async Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync(int userId)
    {
        IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
        return _mapper.Map<IEnumerable<CategoryDTO>>(categories);
    }
    
    public async Task<PagedResult<CategoryDTO>> GetPagedCategoriesAsync(int userId, PaginationParams paginationParams)
    {
        PagedResult<Category> pagedCategories = await _categoryRepository.GetPagedCategoriesForUserAsync(userId, paginationParams);
        
        List<CategoryDTO> mappedCategories = _mapper.Map<List<CategoryDTO>>(pagedCategories.Items);
        
        PagedResult<CategoryDTO> result = new PagedResult<CategoryDTO>(
            mappedCategories,
            pagedCategories.TotalCount,
            pagedCategories.PageNumber,
            pagedCategories.PageSize
        );
        
        return result;
    }
    
    public async Task<CategoryDTO?> GetCategoryByIdAsync(int categoryId, int userId)
    {
        Category? category = await _categoryRepository.GetCategoryByIdAsync(categoryId, userId);
        
        if (category == null)
        {
            return null;
        }
        
        return MapToCategoryDto(category);
    }
    
    public async Task<CategoryDTO> CreateCategoryAsync(int userId, CategoryCreateDTO categoryDto)
    {
        // Check if a category with the same name already exists for this user
        IEnumerable<Category> existingCategories = await _categoryRepository.GetCategoriesForUserAsync(userId);
        
        if (existingCategories.Any(c => c.Name.Equals(categoryDto.Name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new InvalidOperationException($"A category with the name '{categoryDto.Name}' already exists");
        }
        
        Category category = new Category
        {
            Name = categoryDto.Name,
            Description = categoryDto.Description,
            UserId = userId
        };
        
        await _categoryRepository.CreateCategoryAsync(category);
        
        return MapToCategoryDto(category);
    }
    
    public async Task<CategoryDTO?> UpdateCategoryAsync(int categoryId, int userId, CategoryUpdateDTO categoryDto)
    {
        Category? category = await _categoryRepository.GetCategoryByIdAsync(categoryId, userId);
        
        if (category == null)
        {
            return null;
        }
        
        // Check if the new name would conflict with an existing category
        if (!string.IsNullOrEmpty(categoryDto.Name) && 
            !categoryDto.Name.Equals(category.Name, StringComparison.OrdinalIgnoreCase))
        {
            IEnumerable<Category> existingCategories = await _categoryRepository.GetCategoriesForUserAsync(userId);
            
            if (existingCategories.Any(c => c.Id != categoryId && 
                                       c.Name.Equals(categoryDto.Name, StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"A category with the name '{categoryDto.Name}' already exists");
            }
            
            category.Name = categoryDto.Name;
        }
        
        if (categoryDto.Description != null)
        {
            category.Description = categoryDto.Description;
        }
        
        await _categoryRepository.UpdateCategoryAsync(category);
        
        return MapToCategoryDto(category);
    }
    
    public async Task<bool> DeleteCategoryAsync(int categoryId, int userId)
    {
        // Check if the category exists and belongs to the user
        if (!await _categoryRepository.IsCategoryOwnedByUserAsync(categoryId, userId))
        {
            return false;
        }
        
        // Check if there are tasks using this category
        if (await _categoryRepository.HasTasksAsync(categoryId))
        {
            throw new InvalidOperationException(
                "Cannot delete category that has associated tasks. Update or remove those tasks first.");
        }
        
        await _categoryRepository.DeleteCategoryAsync(categoryId, userId);
        return true;
    }
    
    public async Task<bool> IsCategoryOwnedByUserAsync(int categoryId, int userId)
    {
        return await _categoryRepository.IsCategoryOwnedByUserAsync(categoryId, userId);
    }
    
    public async Task<int> GetTaskCountInCategoryAsync(int categoryId, int userId)
    {
        // Verify ownership first
        if (!await _categoryRepository.IsCategoryOwnedByUserAsync(categoryId, userId))
        {
            throw new UnauthorizedAccessException("You do not have access to this category");
        }
        
        return await _categoryRepository.GetCategoryTaskCountAsync(categoryId);
    }
    
    public async Task<IEnumerable<CategoryDTO>> SearchCategoriesAsync(int userId, string searchTerm)
    {
        IEnumerable<Category> categories = await _categoryRepository.SearchCategoriesAsync(userId, searchTerm);
        
        return categories.Select(MapToCategoryDto);
    }
    
    public async Task<Dictionary<string, int>> GetCategoryStatisticsAsync(int userId)
    {
        Dictionary<string, int> statistics = new Dictionary<string, int>();
        
        IEnumerable<Category> categories = await _categoryRepository.GetCategoriesForUserAsync(userId);
        
        foreach (Category category in categories)
        {
            int taskCount = await _categoryRepository.GetCategoryTaskCountAsync(category.Id);
            statistics[category.Name] = taskCount;
        }
        
        return statistics;
    }
    
    // Helper method to map Category to CategoryDTO
    private static CategoryDTO MapToCategoryDto(Category category)
    {
        return new CategoryDTO
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            UserId = category.UserId
        };
    }
}