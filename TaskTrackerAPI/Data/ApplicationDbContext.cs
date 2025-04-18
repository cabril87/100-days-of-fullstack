// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;
using System;
using Microsoft.Extensions.Configuration;

namespace TaskTrackerAPI.Data;

public class ApplicationDbContext : DbContext
{
    private readonly IConfiguration? _configuration = null;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<TaskItem> Tasks { get; set; } = null!; // Changed from Task to TaskItem
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<TaskTag> TaskTags { get; set; } = null!;

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured && _configuration != null)
        {
            optionsBuilder.UseSqlServer(_configuration.GetConnectionString("DefaultConnection"),
                options => options.EnableRetryOnFailure());
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure TaskTag as a join table
        modelBuilder.Entity<TaskTag>()
            .HasKey(tt => new { tt.TaskId, tt.TagId });

        // Configure TaskItem-User relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction); // Changed from CASCADE to NO ACTION

        // Configure TaskItem-Category relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure Category-User relationship
        modelBuilder.Entity<Category>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction); // Changed from CASCADE to NO ACTION

        // Configure Tag-User relationship
        modelBuilder.Entity<Tag>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction); // Changed from CASCADE to NO ACTION

        // Configure TaskTag relationships
        modelBuilder.Entity<TaskTag>()
            .HasOne(tt => tt.Task)
            .WithMany()
            .HasForeignKey(tt => tt.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskTag>()
            .HasOne(tt => tt.Tag)
            .WithMany(t => t.TaskTags)
            .HasForeignKey(tt => tt.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed default admin user
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@tasktracker.com",
                PasswordHash = "AQAAAAIAAYagAAAAEM+YP5xvgRYmWKYLHcpbxBpGmGRG84u+ejHNiGVmAJkGpzVPWCcxLnvKVwRH89Vf/Q==", // This is a placeholder - use proper password hashing in real code
                Salt = "RVENTsNrIeUkGxDiQQcAKQ==",
                FirstName = "Admin",
                LastName = "User",
                Role = "Admin",
                CreatedAt = new DateTime(2025, 4, 1)
            }
        );

        // Seed some default categories
        modelBuilder.Entity<Category>().HasData(
            new Category
            {
                Id = 1,
                Name = "Work",
                Description = "Work-related tasks",
                UserId = 1
            },
            new Category
            {
                Id = 2,
                Name = "Personal",
                Description = "Personal tasks",
                UserId = 1
            }
        );

        // Seed some default tasks
        modelBuilder.Entity<TaskItem>().HasData(
                new TaskItem
                {
                    Id = 1,
                    Title = "Complete project setup",
                    Description = "Set up the initial project structure",
                    Status = TaskItemStatus.Completed,
                    DueDate = new DateTime(2025, 4, 5),
                    CreatedAt = new DateTime(2025, 4, 1),
                    UserId = 1,
                    CategoryId = 1,
                    Priority = 2
                },
               new TaskItem
               {
                   Id = 2,
                   Title = "Database integration",
                   Description = "Set up the database connection and models",
                   Status = TaskItemStatus.Completed,
                   DueDate = new DateTime(2025, 4, 6),
                   CreatedAt = new DateTime(2025, 4, 2),
                   UserId = 1,
                   CategoryId = 1,
                   Priority = 1
               }
           );
    }
}