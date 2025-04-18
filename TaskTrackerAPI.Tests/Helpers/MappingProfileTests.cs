using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Profiles;
using Xunit;

namespace TaskTrackerAPI.Tests.Helpers
{
    public class MappingProfileTests
    {
        private readonly IMapper _mapper;
        
        public MappingProfileTests()
        {
            var config = new MapperConfiguration(cfg => 
            {
                cfg.AddProfile<MappingProfile>();
                
                // We don't need to add an extra mapping here, as it causes a duplicate mapping error
                // Just let the MappingProfile handle the mapping
            });
            
            _mapper = config.CreateMapper();
        }
        
        [Fact]
        public void ConfigurationIsValid()
        {
            // Assert
            _mapper.ConfigurationProvider.AssertConfigurationIsValid();
        }
        
        [Fact]
        public void Map_TaskItem_To_TaskItemDTO_IsValid()
        {
            // Arrange
            var category = new Category 
            { 
                Id = 1, 
                Name = "Test Category",
                UserId = 1
            };
            
            var taskItem = new TaskItem 
            { 
                Id = 1, 
                Title = "Test Task",
                Description = "Task Description",
                Status = TaskItemStatus.InProgress,
                Priority = 2, // High priority
                CategoryId = 1,
                Category = category,
                UserId = 1
            };
            
            // Act
            var taskItemDto = _mapper.Map<TaskItemDTO>(taskItem);
            
            // Assert
            Assert.Equal(taskItem.Id, taskItemDto.Id);
            Assert.Equal(taskItem.Title, taskItemDto.Title);
            Assert.Equal(taskItem.Description, taskItemDto.Description);
            Assert.Equal(taskItem.Status, taskItemDto.Status);
            Assert.Equal(taskItem.Priority, taskItemDto.Priority);
            Assert.Equal(taskItem.CategoryId, taskItemDto.CategoryId);
            Assert.Equal(category.Name, taskItemDto.CategoryName);
        }
        
        [Fact]
        public void Map_Tag_To_TagDTO_IsValid()
        {
            // Arrange
            var tag = new Tag 
            { 
                Id = 1, 
                Name = "Test Tag",
                UserId = 1
            };
            
            // Act
            var tagDto = _mapper.Map<TagDTO>(tag);
            
            // Assert
            Assert.Equal(tag.Id, tagDto.Id);
            Assert.Equal(tag.Name, tagDto.Name);
        }
        
        [Fact]
        public void Map_NullCategory_To_EmptyCategoryName()
        {
            // Arrange
            var taskItem = new TaskItem 
            { 
                Id = 1, 
                Title = "Test Task",
                Description = "Task Description",
                Status = TaskItemStatus.InProgress,
                Priority = 2, // High priority
                Category = null,
                UserId = 1
            };
            
            // Act
            var taskItemDto = _mapper.Map<TaskItemDTO>(taskItem);
            
            // Assert
            Assert.Equal(string.Empty, taskItemDto.CategoryName);
        }
    }
} 