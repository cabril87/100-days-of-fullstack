using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using Xunit;

namespace TaskTrackerAPI.ServiceTests.Services
{
    public class CategoryServiceTests
    {
        private readonly Mock<ICategoryRepository> _mockCategoryRepository;
        private readonly Mock<ILogger<CategoryService>> _mockLogger;
        private readonly Mock<IMapper> _mockMapper;
        private readonly CategoryService _categoryService;
        
        public CategoryServiceTests()
        {
            _mockCategoryRepository = new Mock<ICategoryRepository>();
            _mockLogger = new Mock<ILogger<CategoryService>>();
            _mockMapper = new Mock<IMapper>();
            
            // Set up the mapper mock
            _mockMapper.Setup(m => m.Map<IEnumerable<CategoryDTO>>(It.IsAny<IEnumerable<Category>>()))
                .Returns((IEnumerable<Category> src) => src.Select(c => new CategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    UserId = c.UserId
                }));
                
            _mockMapper.Setup(m => m.Map<CategoryDTO>(It.IsAny<Category>()))
                .Returns((Category src) => new CategoryDTO
                {
                    Id = src.Id,
                    Name = src.Name,
                    Description = src.Description,
                    UserId = src.UserId
                });
            
            _categoryService = new CategoryService(
                _mockCategoryRepository.Object,
                _mockLogger.Object,
                _mockMapper.Object
            );
        }
        
        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsCategoryDTOs()
        {
            // Arrange
            int userId = 1;
            List<Category> categories = new List<Category>
            {
                new Category { Id = 1, Name = "Work", UserId = userId },
                new Category { Id = 2, Name = "Personal", UserId = userId }
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoriesForUserAsync(userId))
                .ReturnsAsync(categories);
            
            // Act
            IEnumerable<CategoryDTO> result = await _categoryService.GetAllCategoriesAsync(userId);
            
            // Assert
            List<CategoryDTO> resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal(1, resultList[0].Id);
            Assert.Equal("Work", resultList[0].Name);
        }
        
        [Fact]
        public async Task GetCategoryByIdAsync_WithValidId_ReturnsCategoryDTO()
        {
            // Arrange
            int categoryId = 1;
            int userId = 1;
            Category category = new Category 
            { 
                Id = categoryId, 
                Name = "Work", 
                UserId = userId 
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(categoryId, userId))
                .ReturnsAsync(category);
            
            // Act
            CategoryDTO? result = await _categoryService.GetCategoryByIdAsync(categoryId, userId);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(categoryId, result!.Id);
            Assert.Equal("Work", result.Name);
        }
        
        [Fact]
        public async Task GetCategoryByIdAsync_WithInvalidId_ReturnsNull()
        {
            // Arrange
            int categoryId = 999;
            int userId = 1;
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(categoryId, userId))
                .ReturnsAsync((Category?)null);
            
            // Act
            CategoryDTO? result = await _categoryService.GetCategoryByIdAsync(categoryId, userId);
            
            // Assert
            Assert.Null(result);
        }
        
        [Fact]
        public async Task CreateCategoryAsync_WithValidData_ReturnsCreatedCategoryDTO()
        {
            // Arrange
            int userId = 1;
            CategoryCreateDTO createCategoryDto = new CategoryCreateDTO 
            { 
                Name = "New Category",
                Description = "Category Description"
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoriesForUserAsync(userId))
                .ReturnsAsync(new List<Category>());
                
            _mockCategoryRepository.Setup(repo => repo.CreateCategoryAsync(It.IsAny<Category>()))
                .ReturnsAsync((Category category) => category);
            
            // Act
            CategoryDTO result = await _categoryService.CreateCategoryAsync(userId, createCategoryDto);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Category", result.Name);
            Assert.Equal("Category Description", result.Description);
        }
        
        [Fact]
        public async Task CreateCategoryAsync_WithDuplicateName_ThrowsException()
        {
            // Arrange
            int userId = 1;
            string categoryName = "Existing Category";
            
            CategoryCreateDTO createCategoryDto = new CategoryCreateDTO 
            { 
                Name = categoryName,
                Description = "Category Description"
            };
            
            List<Category> existingCategories = new List<Category>
            {
                new Category { Id = 1, Name = categoryName, UserId = userId }
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoriesForUserAsync(userId))
                .ReturnsAsync(existingCategories);
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _categoryService.CreateCategoryAsync(userId, createCategoryDto));
        }
        
        [Fact]
        public async Task DeleteCategoryAsync_WithValidId_ReturnsTrue()
        {
            // Arrange
            int categoryId = 1;
            int userId = 1;
            
            _mockCategoryRepository.Setup(repo => repo.IsCategoryOwnedByUserAsync(categoryId, userId))
                .ReturnsAsync(true);
                
            _mockCategoryRepository.Setup(repo => repo.HasTasksAsync(categoryId))
                .ReturnsAsync(false);
                
            _mockCategoryRepository.Setup(repo => repo.DeleteCategoryAsync(categoryId, userId))
                .Returns(Task.CompletedTask);
            
            // Act
            bool result = await _categoryService.DeleteCategoryAsync(categoryId, userId);
            
            // Assert
            Assert.True(result);
            _mockCategoryRepository.Verify(repo => repo.DeleteCategoryAsync(categoryId, userId), Times.Once);
        }
        
        [Fact]
        public async Task UpdateCategoryAsync_WithValidData_ReturnsUpdatedCategoryDTO()
        {
            // Arrange
            int categoryId = 1;
            int userId = 1;
            
            CategoryUpdateDTO updateCategoryDto = new CategoryUpdateDTO
            {
                Name = "Updated Category",
                Description = "Updated Description"
            };
            
            Category existingCategory = new Category
            {
                Id = categoryId,
                Name = "Old Name",
                Description = "Old Description",
                UserId = userId
            };
            
            Category updatedCategory = new Category
            {
                Id = categoryId,
                Name = updateCategoryDto.Name,
                Description = updateCategoryDto.Description,
                UserId = userId
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(categoryId, userId))
                .ReturnsAsync(existingCategory);
                
            _mockCategoryRepository.Setup(repo => repo.GetCategoriesForUserAsync(userId))
                .ReturnsAsync(new List<Category> { existingCategory });
                
            _mockCategoryRepository.Setup(repo => repo.UpdateCategoryAsync(It.IsAny<Category>()))
                .Returns(Task.CompletedTask);
            
            // Act
            CategoryDTO result = await _categoryService.UpdateCategoryAsync(categoryId, userId, updateCategoryDto);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(categoryId, result.Id);
            Assert.Equal("Updated Category", result.Name);
            Assert.Equal("Updated Description", result.Description);
        }
        
        [Fact]
        public async Task UpdateCategoryAsync_WithDuplicateName_ThrowsException()
        {
            // Arrange
            int categoryId = 1;
            int userId = 1;
            string duplicateName = "Duplicate Name";
            
            CategoryUpdateDTO updateCategoryDto = new CategoryUpdateDTO
            {
                Name = duplicateName,
                Description = "Updated Description"
            };
            
            Category existingCategory = new Category
            {
                Id = categoryId,
                Name = "Old Name",
                Description = "Old Description",
                UserId = userId
            };
            
            List<Category> userCategories = new List<Category>
            {
                existingCategory,
                new Category { Id = 2, Name = duplicateName, UserId = userId }
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(categoryId, userId))
                .ReturnsAsync(existingCategory);
                
            _mockCategoryRepository.Setup(repo => repo.GetCategoriesForUserAsync(userId))
                .ReturnsAsync(userCategories);
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _categoryService.UpdateCategoryAsync(categoryId, userId, updateCategoryDto));
        }
        
        [Fact]
        public async Task UpdateCategoryAsync_WithNonExistingCategory_ReturnsNull()
        {
            // Arrange
            int categoryId = 999;
            int userId = 1;
            
            CategoryUpdateDTO updateCategoryDto = new CategoryUpdateDTO
            {
                Name = "Updated Category",
                Description = "Updated Description"
            };
            
            _mockCategoryRepository.Setup(repo => repo.GetCategoryByIdAsync(categoryId, userId))
                .ReturnsAsync((Category?)null);
            
            // Act
            CategoryDTO? result = await _categoryService.UpdateCategoryAsync(categoryId, userId, updateCategoryDto);
            
            // Assert
            Assert.Null(result);
        }
    }
} 