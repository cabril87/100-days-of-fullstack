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
            
            // Seed comprehensive template marketplace
            await TemplateSeedData.SeedTemplatesAsync(context, logger as Microsoft.Extensions.Logging.ILogger);
            
            // Check if admin user exists
            bool adminExists = await context.Users.AnyAsync(u => u.Username == "admin");
            
            // Seed admin user if not found
            if (!adminExists && authHelper != null)
            {
                logger.LogInformation("Admin user not found, creating admin user...");
                await SeedAdminUserAsync(context, logger, authHelper);
            }
            else if (adminExists)
            {
                logger.LogInformation("Admin user already exists, skipping admin user creation.");
            }

            // Check if customer support user exists
            bool customerSupportExists = await context.Users.AnyAsync(u => u.Username == "customersupport");
            
            // Seed customer support user if not found
            if (!customerSupportExists && authHelper != null)
            {
                logger.LogInformation("Customer support user not found, creating customer support user...");
                await SeedCustomerSupportUserAsync(context, logger, authHelper);
            }
            else if (customerSupportExists)
            {
                logger.LogInformation("Customer support user already exists, skipping customer support user creation.");
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
            // Double-check if admin exists (only check username since email is encrypted)
            User? adminByUsername = await context.Users
                .FirstOrDefaultAsync(u => u.Username == "admin");

            if (adminByUsername != null)
            {
                logger.LogInformation("User with username 'admin' already exists with ID: {AdminId}", adminByUsername.Id);
                return;
            }

            logger.LogInformation("Admin user not found, creating admin user...");
            
            // Generate a simple password hash directly that will match our test controller
            // NOTE: This is ONLY for development/testing purposes
            
            // Use the exact same hash generation method as in debug controller
            // so we're guaranteed they match for testing
            PasswordDebugHelper passwordDebugHelper = new PasswordDebugHelper(authHelper._configuration);
            string seedPassword = authHelper._configuration["SeedData:DefaultPassword"] ?? "DefaultSeedPassword123!";
            (string passwordHash, string salt) = passwordDebugHelper.GeneratePasswordHashForSeed(seedPassword);   
            
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
                CreatedAt = DateTime.Now,
                AgeGroup = Models.FamilyMemberAgeGroup.Adult
            };
            
            await context.Users.AddAsync(admin);
            await context.SaveChangesAsync();
            logger.LogInformation("Admin user created with ID: {AdminId}", admin.Id);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message?.Contains("duplicate key") == true)
        {
            logger.LogWarning("Admin user already exists (duplicate key constraint), skipping creation.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding admin user");
            throw; // Re-throw non-duplicate key errors
        }
    }

    private async Task SeedCustomerSupportUserAsync(ApplicationDbContext context, ILogger logger, AuthHelper authHelper)
    {
        try
        {
            // Double-check if customer support user exists
            User? customerSupportByUsername = await context.Users
                .FirstOrDefaultAsync(u => u.Username == "customersupport");

            if (customerSupportByUsername != null)
            {
                logger.LogInformation("User with username 'customersupport' already exists with ID: {CustomerSupportId}", customerSupportByUsername.Id);
                return;
            }

            logger.LogInformation("Customer support user not found, creating customer support user...");
            
            // Use the same password hash generation as admin user
            PasswordDebugHelper passwordDebugHelper = new PasswordDebugHelper(authHelper._configuration);
            string seedPassword = authHelper._configuration["SeedData:DefaultPassword"] ?? "DefaultSeedPassword123!";
            (string passwordHash, string salt) = passwordDebugHelper.GeneratePasswordHashForSeed(seedPassword);
            
            logger.LogInformation("Seeding customer support user...");
            
            // Create customer support user
            User customerSupport = new User
            {
                Username = "customersupport",
                Email = "customersupport@tasktracker.com",
                FirstName = "Customer",
                LastName = "Support",
                PasswordHash = passwordHash,
                Salt = salt,
                Role = "CustomerSupport",
                IsActive = true,
                CreatedAt = DateTime.Now,
                AgeGroup = Models.FamilyMemberAgeGroup.Adult
            };
            
            await context.Users.AddAsync(customerSupport);
            await context.SaveChangesAsync();
            logger.LogInformation("Customer support user created with ID: {CustomerSupportId}", customerSupport.Id);
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message?.Contains("duplicate key") == true)
        {
            logger.LogWarning("Customer support user already exists (duplicate key constraint), skipping creation.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding customer support user");
            throw; // Re-throw non-duplicate key errors
        }
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