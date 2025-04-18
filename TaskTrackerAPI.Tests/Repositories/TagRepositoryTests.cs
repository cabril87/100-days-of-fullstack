using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using Xunit;

namespace TaskTrackerAPI.Tests.Repositories
{
    public class TagRepositoryTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;
        
        public TagRepositoryTests()
        {
            // Use a unique DB name for each test run to avoid conflicts
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
                
            // Seed the database
            SeedDatabase();
        }
        
        private void SeedDatabase()
        {
            using (var context = new ApplicationDbContext(_options))
            {
                // Clear existing data
                context.Tags.RemoveRange(context.Tags);
                context.SaveChanges();
                
                // Add test tags
                context.Tags.AddRange(
                    new Tag 
                    { 
                        Id = 1, 
                        Name = "Important", 
                        UserId = 1 
                    },
                    new Tag 
                    { 
                        Id = 2, 
                        Name = "Urgent", 
                        UserId = 1 
                    },
                    new Tag 
                    { 
                        Id = 3, 
                        Name = "Study", 
                        UserId = 2 
                    }
                );
                
                context.SaveChanges();
            }
        }
        
        [Fact]
        public async Task GetTagsForUserAsync_ReturnsCorrectTags()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int userId = 1;
            
            // Act
            var tags = await repository.GetTagsForUserAsync(userId);
            
            // Assert
            Assert.Equal(2, tags.Count());
            Assert.All(tags, t => Assert.Equal(userId, t.UserId));
            Assert.Contains("Important", tags.Select(t => t.Name));
            Assert.Contains("Urgent", tags.Select(t => t.Name));
        }
        
        [Fact]
        public async Task GetTagByIdAsync_WithValidIdAndUser_ReturnsTag()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int tagId = 1;
            int userId = 1;
            
            // Act
            var tag = await repository.GetTagByIdAsync(tagId, userId);
            
            // Assert
            Assert.NotNull(tag);
            Assert.Equal(tagId, tag!.Id);
            Assert.Equal("Important", tag.Name);
        }
        
        [Fact]
        public async Task GetTagByIdAsync_WithWrongUser_ReturnsNull()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int tagId = 1;
            int wrongUserId = 2;
            
            // Act
            var tag = await repository.GetTagByIdAsync(tagId, wrongUserId);
            
            // Assert
            Assert.Null(tag);
        }
        
        [Fact]
        public async Task CreateTagAsync_ShouldAddNewTag()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            var newTag = new Tag
            {
                Name = "New Test Tag",
                UserId = 1
            };
            
            // Act
            var result = await repository.CreateTagAsync(newTag);
            
            // Assert
            Assert.True(result.Id > 0);
            Assert.Contains(context.Tags, t => t.Name == "New Test Tag");
        }
        
        [Fact]
        public async Task UpdateTagAsync_ShouldModifyExistingTag()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            var tag = await context.Tags.FindAsync(1);
            tag!.Name = "Updated Tag Name";
            
            // Act
            await repository.UpdateTagAsync(tag);
            
            // Assert
            var updatedTag = await context.Tags.FindAsync(1);
            Assert.Equal("Updated Tag Name", updatedTag!.Name);
        }
        
        [Fact]
        public async Task DeleteTagAsync_ShouldRemoveTag()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int tagId = 1;
            int userId = 1;
            
            // Act
            await repository.DeleteTagAsync(tagId, userId);
            
            // Assert
            var tag = await context.Tags.FindAsync(tagId);
            Assert.Null(tag);
        }
        
        [Fact]
        public async Task IsTagOwnedByUserAsync_WithCorrectOwner_ReturnsTrue()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int tagId = 1;
            int userId = 1;
            
            // Act
            var result = await repository.IsTagOwnedByUserAsync(tagId, userId);
            
            // Assert
            Assert.True(result);
        }
        
        [Fact]
        public async Task IsTagOwnedByUserAsync_WithWrongOwner_ReturnsFalse()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int tagId = 1;
            int wrongUserId = 3;
            
            // Act
            var result = await repository.IsTagOwnedByUserAsync(tagId, wrongUserId);
            
            // Assert
            Assert.False(result);
        }
        
        [Fact]
        public async Task SearchTagsAsync_ReturnsMatchingTags()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int userId = 1;
            string searchTerm = "urg";
            
            // Act
            var tags = await repository.SearchTagsAsync(userId, searchTerm);
            
            // Assert
            Assert.Single(tags);
            Assert.Equal("Urgent", tags.First().Name);
        }
        
        [Fact]
        public async Task SearchTagsAsync_WithEmptySearch_ReturnsAllUserTags()
        {
            // Arrange
            using var context = new ApplicationDbContext(_options);
            var repository = new TagRepository(context);
            int userId = 1;
            string searchTerm = "";
            
            // Act
            var tags = await repository.SearchTagsAsync(userId, searchTerm);
            
            // Assert
            Assert.Equal(2, tags.Count());
            Assert.All(tags, t => Assert.Equal(userId, t.UserId));
        }
    }
} 