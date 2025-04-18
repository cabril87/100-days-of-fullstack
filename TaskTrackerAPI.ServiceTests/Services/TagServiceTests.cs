using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using Xunit;

namespace TaskTrackerAPI.ServiceTests.Services
{
    public class TagServiceTests
    {
        private readonly Mock<ITagRepository> _mockTagRepository;
        private readonly Mock<ILogger<TagService>> _mockLogger;
        private readonly TagService _tagService;
        
        public TagServiceTests()
        {
            _mockTagRepository = new Mock<ITagRepository>();
            _mockLogger = new Mock<ILogger<TagService>>();
            
            _tagService = new TagService(
                _mockTagRepository.Object,
                _mockLogger.Object
            );
        }
        
        [Fact]
        public async Task GetAllTagsAsync_ReturnsTagDTOs()
        {
            // Arrange
            int userId = 1;
            List<Tag> tags = new List<Tag>
            {
                new Tag { Id = 1, Name = "Important", UserId = userId },
                new Tag { Id = 2, Name = "Urgent", UserId = userId }
            };
            
            _mockTagRepository.Setup(repo => repo.GetTagsForUserAsync(userId))
                .ReturnsAsync(tags);
            
            // Act
            IEnumerable<TagDTO> result = await _tagService.GetAllTagsAsync(userId);
            
            // Assert
            List<TagDTO> resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            Assert.Equal(1, resultList[0].Id);
            Assert.Equal("Important", resultList[0].Name);
            Assert.Equal(2, resultList[1].Id);
            Assert.Equal("Urgent", resultList[1].Name);
        }
        
        [Fact]
        public async Task CreateTagAsync_WithValidData_ReturnsCreatedTagDTO()
        {
            // Arrange
            int userId = 1;
            TagCreateDTO createTagDto = new TagCreateDTO 
            { 
                Name = "New Tag"
            };
            
            _mockTagRepository.Setup(repo => repo.GetTagsForUserAsync(userId))
                .ReturnsAsync(new List<Tag>());
                
            _mockTagRepository.Setup(repo => repo.CreateTagAsync(It.IsAny<Tag>()))
                .ReturnsAsync((Tag tag) => { tag.Id = 1; return tag; });
            
            // Act
            TagDTO result = await _tagService.CreateTagAsync(userId, createTagDto);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("New Tag", result.Name);
            Assert.Equal(userId, result.UserId);
        }
        
        [Fact]
        public async Task CreateTagAsync_WithDuplicateName_ThrowsException()
        {
            // Arrange
            int userId = 1;
            string tagName = "Existing Tag";
            
            TagCreateDTO createTagDto = new TagCreateDTO 
            { 
                Name = tagName
            };
            
            List<Tag> existingTags = new List<Tag>
            {
                new Tag { Id = 1, Name = tagName, UserId = userId }
            };
            
            _mockTagRepository.Setup(repo => repo.GetTagsForUserAsync(userId))
                .ReturnsAsync(existingTags);
            
            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _tagService.CreateTagAsync(userId, createTagDto));
        }
        
        [Fact]
        public async Task DeleteTagAsync_WithValidId_ReturnsTrue()
        {
            // Arrange
            int tagId = 1;
            int userId = 1;
            
            _mockTagRepository.Setup(repo => repo.IsTagOwnedByUserAsync(tagId, userId))
                .ReturnsAsync(true);
                
            _mockTagRepository.Setup(repo => repo.IsTagUsedInTasksAsync(tagId))
                .ReturnsAsync(false);
                
            _mockTagRepository.Setup(repo => repo.DeleteTagAsync(tagId, userId))
                .Returns(Task.CompletedTask);
            
            // Act
            bool result = await _tagService.DeleteTagAsync(tagId, userId);
            
            // Assert
            Assert.True(result);
            _mockTagRepository.Verify(repo => repo.DeleteTagAsync(tagId, userId), Times.Once);
        }
    }
} 