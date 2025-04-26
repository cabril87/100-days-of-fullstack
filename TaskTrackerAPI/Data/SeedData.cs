using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();

            // Apply any pending migrations
            await context.Database.MigrateAsync();

            // Seed data
            await SeedRolesAsync(context);
            await SeedDefaultUserAsync(context);
            await SeedFamilyRolesAsync(context);
            await SeedDefaultCategoriesAsync(context);
            await SeedDefaultTasksAsync(context);
            await SeedDefaultPriorityMultipliersAsync(context);

            logger.LogInformation("Seed data operation completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during database seeding");
            throw;
        }
    }

    private static async Task SeedRolesAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Role == "Admin"))
        {
            return; // Roles already seeded
        }

        // Create default admin user
        var adminUser = new User
        {
            Username = "admin",
            Email = "admin@tasktracker.com",
            PasswordHash = "AQAAAAIAAYagAAAAEM+YP5xvgRYmWKYLHcpbxBpGmGRG84u+ejHNiGVmAJkGpzVPWCcxLnvKVwRH89Vf/Q==",
            Salt = "RVENTsNrIeUkGxDiQQcAKQ==",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDefaultUserAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Role == "User"))
        {
            return; // Default user already exists
        }

        var defaultUser = new User
        {
            Username = "user",
            Email = "user@tasktracker.com",
            PasswordHash = "AQAAAAIAAYagAAAAEM+YP5xvgRYmWKYLHcpbxBpGmGRG84u+ejHNiGVmAJkGpzVPWCcxLnvKVwRH89Vf/Q==",
            Salt = "RVENTsNrIeUkGxDiQQcAKQ==",
            FirstName = "Default",
            LastName = "User",
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await context.Users.AddAsync(defaultUser);
        await context.SaveChangesAsync();
    }

    private static async Task SeedFamilyRolesAsync(ApplicationDbContext context)
    {
        if (await context.FamilyRoles.AnyAsync())
        {
            return; // Family roles already seeded
        }

        var familyRoles = new List<FamilyRole>
        {
            new FamilyRole
            {
                Name = "Admin",
                Description = "Full access to manage family settings and members",
                IsDefault = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<FamilyRolePermission>
                {
                    new FamilyRolePermission { Name = "manage_family", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "manage_members", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "invite_members", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "manage_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "assign_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "verify_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "manage_rewards", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "view_statistics", CreatedAt = DateTime.UtcNow }
                }
            },
            new FamilyRole
            {
                Name = "Parent",
                Description = "Can manage tasks and members, but not family settings",
                IsDefault = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<FamilyRolePermission>
                {
                    new FamilyRolePermission { Name = "invite_members", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "manage_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "assign_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "verify_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "manage_rewards", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "view_statistics", CreatedAt = DateTime.UtcNow }
                }
            },
            new FamilyRole
            {
                Name = "Child",
                Description = "Can view and complete assigned tasks",
                IsDefault = true,
                CreatedAt = DateTime.UtcNow,
                Permissions = new List<FamilyRolePermission>
                {
                    new FamilyRolePermission { Name = "view_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "complete_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { Name = "view_rewards", CreatedAt = DateTime.UtcNow }
                }
            }
        };

        await context.FamilyRoles.AddRangeAsync(familyRoles);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDefaultCategoriesAsync(ApplicationDbContext context)
    {
        if (await context.Categories.AnyAsync())
        {
            return; // Categories already seeded
        }

        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        if (adminUser == null) return;

        var categories = new List<Category>
        {
            new Category
            {
                Name = "Work",
                Description = "Work-related tasks",
                UserId = adminUser.Id
            },
            new Category
            {
                Name = "Personal",
                Description = "Personal tasks",
                UserId = adminUser.Id
            },
            new Category
            {
                Name = "Family",
                Description = "Family-related tasks",
                UserId = adminUser.Id
            },
            new Category
            {
                Name = "Health",
                Description = "Health and fitness tasks",
                UserId = adminUser.Id
            }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDefaultTasksAsync(ApplicationDbContext context)
    {
        if (await context.Tasks.AnyAsync())
        {
            return; // Tasks already seeded
        }

        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        var workCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Work");
        if (adminUser == null || workCategory == null) return;

        var tasks = new List<TaskItem>
        {
            new TaskItem
            {
                Title = "Complete project setup",
                Description = "Set up the initial project structure",
                Status = TaskItemStatus.Completed,
                DueDate = DateTime.UtcNow.AddDays(5),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = adminUser.Id,
                CategoryId = workCategory.Id,
                Priority = "High"
            },
            new TaskItem
            {
                Title = "Database integration",
                Description = "Set up the database connection and models",
                Status = TaskItemStatus.InProgress,
                DueDate = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                UserId = adminUser.Id,
                CategoryId = workCategory.Id,
                Priority = "Medium"
            }
        };

        await context.Tasks.AddRangeAsync(tasks);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDefaultPriorityMultipliersAsync(ApplicationDbContext context)
    {
        if (await context.PriorityMultipliers.AnyAsync())
        {
            return; // Priority multipliers already seeded
        }

        var multipliers = new List<PriorityMultiplier>
        {
            new PriorityMultiplier { Priority = "Low", Multiplier = 0.5 },
            new PriorityMultiplier { Priority = "Medium", Multiplier = 1.0 },
            new PriorityMultiplier { Priority = "High", Multiplier = 1.5 },
            new PriorityMultiplier { Priority = "Critical", Multiplier = 2.0 }
        };

        await context.PriorityMultipliers.AddRangeAsync(multipliers);
        await context.SaveChangesAsync();
    }
} 