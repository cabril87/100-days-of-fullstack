/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Data;

public static class DatabaseSeeder
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using IServiceScope scope = serviceProvider.CreateScope();
        IServiceProvider services = scope.ServiceProvider;
        ILogger<ApplicationDbContext> logger = services.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            ApplicationDbContext context = services.GetRequiredService<ApplicationDbContext>();

            // Apply any pending migrations
            await context.Database.MigrateAsync();

            // Seed data
            await SeedRolesAsync(context);
            await SeedDefaultUserAsync(context);
            await SeedFamilyRolesAsync(context);
            await SeedDefaultCategoriesAsync(context);
            await SeedDefaultTagsAsync(context);
            await SeedDefaultTasksAsync(context);
            await SeedTaskTagsAsync(context);
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
            return; // Admin user already exists, no need to seed
        }

        // We'll let the DatabaseSeeder or ApplicationDbContext handle admin user creation
        // to avoid duplicates
    }

    private static async Task SeedDefaultUserAsync(ApplicationDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Role == "User"))
        {
            return; // Default user already exists
        }

        User defaultUser = new User
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

        List<FamilyRole> familyRoles = new List<FamilyRole>
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

        User? adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        if (adminUser == null) return;

        List<Category> categories = new List<Category>
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
        if (await context.TaskItems.AnyAsync())
        {
            return; // Tasks already seeded
        }

        User? adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        Category? workCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Work");
        if (adminUser == null || workCategory == null) return;

        List<TaskItem> tasks = new List<TaskItem>
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

        await context.TaskItems.AddRangeAsync(tasks);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDefaultPriorityMultipliersAsync(ApplicationDbContext context)
    {
        if (await context.PriorityMultipliers.AnyAsync())
        {
            return; // Priority multipliers already seeded
        }

        List<PriorityMultiplier> multipliers = new List<PriorityMultiplier>
        {
            new PriorityMultiplier { Priority = "Low", Multiplier = 0.5 },
            new PriorityMultiplier { Priority = "Medium", Multiplier = 1.0 },
            new PriorityMultiplier { Priority = "High", Multiplier = 1.5 },
            new PriorityMultiplier { Priority = "Critical", Multiplier = 2.0 }
        };

        await context.PriorityMultipliers.AddRangeAsync(multipliers);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDefaultTagsAsync(ApplicationDbContext context)
    {
        if (await context.Tags.AnyAsync())
        {
            return; // Tags already seeded
        }

        User? adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
        if (adminUser == null) return;

        List<Tag> tags = new List<Tag>
        {
            new Tag { Name = "Important", UserId = adminUser.Id },
            new Tag { Name = "Urgent", UserId = adminUser.Id },
            new Tag { Name = "Quick", UserId = adminUser.Id },
            new Tag { Name = "Review", UserId = adminUser.Id },
            new Tag { Name = "Meeting", UserId = adminUser.Id },
            new Tag { Name = "Bug", UserId = adminUser.Id },
            new Tag { Name = "Feature", UserId = adminUser.Id },
            new Tag { Name = "Learning", UserId = adminUser.Id }
        };

        await context.Tags.AddRangeAsync(tags);
        await context.SaveChangesAsync();
    }

    private static async Task SeedTaskTagsAsync(ApplicationDbContext context)
    {
        if (await context.TaskTags.AnyAsync())
        {
            return; // Task tags already seeded
        }

        // Get the first few tasks and tags to associate them
        List<TaskItem> tasks = await context.TaskItems.Take(2).ToListAsync();
        List<Tag> tags = await context.Tags.Take(4).ToListAsync();

        if (!tasks.Any() || !tags.Any()) return;

        List<TaskTag> taskTags = new List<TaskTag>();

        // Associate first task with "Important" and "Urgent" tags
        if (tasks.Count > 0)
        {
            Tag? importantTag = tags.FirstOrDefault(t => t.Name == "Important");
            Tag? urgentTag = tags.FirstOrDefault(t => t.Name == "Urgent");

            if (importantTag != null)
                taskTags.Add(new TaskTag { TaskId = tasks[0].Id, TagId = importantTag.Id });
            if (urgentTag != null)
                taskTags.Add(new TaskTag { TaskId = tasks[0].Id, TagId = urgentTag.Id });
        }

        // Associate second task with "Quick" and "Review" tags  
        if (tasks.Count > 1)
        {
            Tag? quickTag = tags.FirstOrDefault(t => t.Name == "Quick");
            Tag? reviewTag = tags.FirstOrDefault(t => t.Name == "Review");

            if (quickTag != null)
                taskTags.Add(new TaskTag { TaskId = tasks[1].Id, TagId = quickTag.Id });
            if (reviewTag != null)
                taskTags.Add(new TaskTag { TaskId = tasks[1].Id, TagId = reviewTag.Id });
        }

        if (taskTags.Any())
        {
            await context.TaskTags.AddRangeAsync(taskTags);
            await context.SaveChangesAsync();
        }
    }
} 
