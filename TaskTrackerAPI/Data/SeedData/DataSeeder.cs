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
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Utils;
using TaskTrackerAPI.Helpers;

namespace TaskTrackerAPI.Data.SeedData;

/// <summary>
/// Seeds initial data into the database
/// </summary>
public class DataSeeder
{
    /// <summary>
    /// Seeds the database with initial data
    /// </summary>
    public async Task SeedAsync(ApplicationDbContext context, ILogger logger, AuthHelper? authHelper = null)
    {
        try
        {
            // Seed subscription tiers
            await SubscriptionTierSeed.SeedSubscriptionTiersAsync(context, logger as Microsoft.Extensions.Logging.ILogger);

            // Check specifically for admin user
            bool adminExists = await context.Users.AnyAsync(u => u.Email == "admin@tasktracker.com");
            
            // Seed admin user if not found
            if (!adminExists && authHelper != null)
            {
                logger.LogInformation("Admin user not found, creating admin user...");
                await SeedAdminUserAsync(context, logger, authHelper);
            }
            
            // Seed regular users if needed (excluding admin)
            if (!await context.Users.AnyAsync(u => u.Role == "User"))
            {
                await SeedRegularUsersAsync(context, logger, authHelper);
            }
            
            // Seed family roles
            if (!await context.FamilyRoles.AnyAsync())
            {
                await SeedFamilyRolesAsync(context, logger);
            }
            
            // Seed additional family roles if needed
            if (!await context.FamilyRoles.AnyAsync(r => r.Name == "Child" || r.Name == "Adult"))
            {
                await SeedAdditionalFamilyRolesAsync(context, logger);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }
    
    private async Task SeedAdminUserAsync(ApplicationDbContext context, ILogger logger, AuthHelper authHelper)
    {
        try
        {
            // Check if admin exists
            var adminUser = await context.Users
                .FirstOrDefaultAsync(u => u.Email == "admin@tasktracker.com" && u.Username == "admin");

            if (adminUser == null)
            {
                logger.LogInformation("Admin user not found, creating admin user...");
                
                // Generate a simple password hash directly that will match our test controller
                // NOTE: This is ONLY for development/testing purposes
                
                // Use the exact same hash generation method as in debug controller
                // so we're guaranteed they match for testing
                var passwordDebugHelper = new PasswordDebugHelper(authHelper._configuration);
                var (passwordHash, salt) = passwordDebugHelper.GeneratePasswordHashForSeed("password");
                
                logger.LogInformation("Seeding admin user...");
                
                // Create admin user
                User admin = new User
                {
                    Username = "admin",
                    Email = "admin@tasktracker.com",
                    FirstName = "Admin",
                    LastName = "User",
                    PasswordHash = passwordHash,
                    Salt = salt,
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.Now
                };
                
                await context.Users.AddAsync(admin);
                await context.SaveChangesAsync();
                logger.LogInformation("Admin user created with ID: {AdminId}", admin.Id);
            }
            else
            {
                logger.LogInformation("Admin user already exists with ID: {AdminId}", adminUser.Id);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding admin user");
        }
    }
    
    private async Task SeedRegularUsersAsync(ApplicationDbContext context, ILogger logger, AuthHelper? authHelper)
    {
        if (authHelper == null)
        {
            logger.LogWarning("AuthHelper not provided - cannot seed users");
            return;
        }
        
        logger.LogInformation("Seeding regular users...");
        
        // Create a proper password hash for a very simple password
        authHelper.CreatePasswordHash("password", out string passwordHash, out string salt);

        // Add default regular user for testing
        User user = new User
        {
            Username = "user",
            Email = "user@tasktracker.com",
            PasswordHash = passwordHash,
            Salt = salt,
            Role = "User",
            FirstName = "Regular",
            LastName = "User",
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            AgeGroup = FamilyMemberAgeGroup.Adult
        };
        
        context.Users.Add(user);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Regular user created with email: user@tasktracker.com and password: password");
    }
    
    private async Task SeedFamilyRolesAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Creating family roles...");

        // Create Admin role
        FamilyRole adminRole = new FamilyRole
        {
            Name = "Admin",
            Description = "Full control over the family",
            IsDefault = false,
            CreatedAt = DateTime.UtcNow
        };
        context.FamilyRoles.Add(adminRole);

        // Create Member role
        FamilyRole memberRole = new FamilyRole
        {
            Name = "Member",
            Description = "Regular family member",
            IsDefault = true,
            CreatedAt = DateTime.UtcNow
        };
        context.FamilyRoles.Add(memberRole);
        await context.SaveChangesAsync();

        // Add permissions for Admin role
        context.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
        {
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "manage_family", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "manage_members", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "invite_members", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "assign_tasks", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "manage_tasks", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "view_tasks", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adminRole.Id, Name = "create_tasks", CreatedAt = DateTime.UtcNow }
        });

        // Add permissions for Member role
        context.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
        {
            new FamilyRolePermission { RoleId = memberRole.Id, Name = "view_members", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = memberRole.Id, Name = "manage_own_tasks", CreatedAt = DateTime.UtcNow }
        });

        await context.SaveChangesAsync();
        logger.LogInformation("Family roles created successfully!");
    }
    
    private async Task SeedAdditionalFamilyRolesAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Creating Child and Adult family roles...");

        // Create Adult role
        FamilyRole adultRole = new FamilyRole
        {
            Name = "Adult",
            Description = "Adult family member with task management permissions",
            IsDefault = false,
            CreatedAt = DateTime.UtcNow
        };
        context.FamilyRoles.Add(adultRole);

        // Create Child role
        FamilyRole childRole = new FamilyRole
        {
            Name = "Child",
            Description = "Child family member with limited permissions",
            IsDefault = false,
            CreatedAt = DateTime.UtcNow
        };
        context.FamilyRoles.Add(childRole);
        await context.SaveChangesAsync();

        // Add permissions for Adult role
        context.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
        {
            new FamilyRolePermission { RoleId = adultRole.Id, Name = "assign_tasks", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adultRole.Id, Name = "view_tasks", CreatedAt = DateTime.UtcNow },
            new FamilyRolePermission { RoleId = adultRole.Id, Name = "create_tasks", CreatedAt = DateTime.UtcNow }
        });

        // Add permissions for Child role (limited)
        context.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
        {
            new FamilyRolePermission { RoleId = childRole.Id, Name = "view_tasks", CreatedAt = DateTime.UtcNow }
        });

        await context.SaveChangesAsync();
        logger.LogInformation("Child and Adult family roles created successfully!");
    }
} 