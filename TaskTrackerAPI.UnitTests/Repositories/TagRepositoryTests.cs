using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories;
using Xunit;

namespace TaskTrackerAPI.UnitTests.Repositories
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
            using (ApplicationDbContext context = new ApplicationDbContext(_options))
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            TagRepository repository = new TagRepository(context);
            int userId = 1;
            
            // Act
            IEnumerable<Tag> tags = await repository.GetTagsForUserAsync(userId);
            
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
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            TagRepository repository = new TagRepository(context);
            int tagId = 1;
            int userId = 1;
            
            // Act
            Tag? tag = await repository.GetTagByIdAsync(tagId, userId);
            
            // Assert
            Assert.NotNull(tag);
            Assert.Equal(tagId, tag!.Id);
            Assert.Equal("Important", tag.Name);
        }
        
        [Fact]
        public async Task GetTagByIdAsync_WithWrongUser_ReturnsNull()
        {
            // Arrange
            using ApplicationDbContext context = new ApplicationDbContext(_options);
            TagRepository repository = new TagRepository(context);
            int tagId = 1;
            int wrongUserId = 2;
            
            // Act
            Tag? tag = await repository.GetTagByIdAsync(tagId, wrongUserId);
            
            // Assert
            Assert.Null(tag);
        }
    }
} 