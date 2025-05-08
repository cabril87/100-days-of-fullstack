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
            await SubscriptionTierSeed.SeedSubscriptionTiersAsync(context, logger);

            // Seed user if needed
            if (!await context.Users.AnyAsync())
            {
                await SeedUsersAsync(context, logger, authHelper);
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
    
    private async Task SeedUsersAsync(ApplicationDbContext context, ILogger logger, AuthHelper? authHelper)
    {
        if (authHelper == null)
        {
            logger.LogWarning("AuthHelper not provided - cannot seed users");
            return;
        }
        
        logger.LogInformation("Seeding users...");
        
        // Create a proper password hash for a very simple password
        authHelper.CreatePasswordHash("password", out string passwordHash, out string salt);

        // Add default admin user for testing
        User user = new User
        {
            Username = "admin",
            Email = "admin@tasktracker.com",
            PasswordHash = passwordHash,
            Salt = salt,
            Role = "Admin",
            FirstName = "Admin",
            LastName = "User",
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            AgeGroup = FamilyMemberAgeGroup.Adult
        };
        
        context.Users.Add(user);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Admin user created with email: admin@tasktracker.com and password: password");
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