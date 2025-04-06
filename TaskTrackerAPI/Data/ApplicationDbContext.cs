// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Models.Task> Tasks { get; set; }

         protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Seed data for testing with hardcoded dates
            modelBuilder.Entity<Models.Task>().HasData(
                new Models.Task
                {
                    Id = 1,
                    Title = "Test Task 1",
                    Description = "This is a test task",
                    DueDate = new DateTime(2025, 4, 8), // Hardcoded date (3 days from now)
                    IsCompleted = false,
                    CreatedAt = new DateTime(2025, 4, 5) // Today's date hardcoded
                },
                new Models.Task
                {
                    Id = 2,
                    Title = "Test Task 2",
                    Description = "This is another test task",
                    DueDate = new DateTime(2025, 4, 10), // Hardcoded date (5 days from now)
                    IsCompleted = true,
                    CreatedAt = new DateTime(2025, 4, 5) // Today's date hardcoded
                }
            );
        }
    }
}