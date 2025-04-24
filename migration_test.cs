using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;

namespace MigrationTest
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            // Create DbContext options
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlServer("YOUR_CONNECTION_STRING_HERE")
                .Options;
                
            // Create logger
            var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            var logger = loggerFactory.CreateLogger<Program>();
                
            using (var context = new ApplicationDbContext(options))
            {
                try
                {
                    // Try to access the Difficulty property of a Challenge
                    var challenge = await context.Challenges.FirstOrDefaultAsync();
                    if (challenge != null)
                    {
                        logger.LogInformation($"Challenge: {challenge.Name}, Difficulty: {challenge.Difficulty}");
                    }
                    else
                    {
                        logger.LogInformation("No challenges found in database. Creating a test challenge.");
                        
                        // Create a new challenge with a specified difficulty
                        var testChallenge = new Challenge
                        {
                            Name = "Test Challenge",
                            Description = "A test challenge created after adding the Difficulty property",
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddDays(7),
                            PointReward = 100,
                            ActivityType = "test",
                            TargetCount = 5,
                            IsActive = true,
                            Difficulty = 3 // Test the new property
                        };
                        
                        context.Challenges.Add(testChallenge);
                        await context.SaveChangesAsync();
                        
                        logger.LogInformation($"Created test challenge with Difficulty: {testChallenge.Difficulty}");
                    }
                    
                    logger.LogInformation("Migration test completed successfully!");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred during the migration test");
                }
            }
        }
    }
} 