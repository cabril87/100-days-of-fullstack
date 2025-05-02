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
// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Models.Gamification;
using System;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore.Metadata;

namespace TaskTrackerAPI.Data;

public class ApplicationDbContext : DbContext
{
    private readonly IConfiguration? _configuration;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IConfiguration configuration)
        : base(options)
    {
        _configuration = configuration;
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<TaskItem> Tasks { get; set; } = null!; // Changed from Task to TaskItem
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<TaskTag> TaskTags { get; set; } = null!;

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    public DbSet<Reminder> Reminders { get; set; } = null!;

    public DbSet<Note> Notes { get; set; } = null!;
    
    public DbSet<Board> Boards { get; set; } = null!;
    
    public DbSet<FamilyMember> FamilyMembers { get; set; } = null!;
    
    public DbSet<TaskTemplate> TaskTemplates { get; set; } = null!;
    
    public DbSet<Notification> Notifications { get; set; } = null!;

    public DbSet<Challenge> Challenges { get; set; } = null!;
    
    public DbSet<UserChallenge> UserChallenges { get; set; } = null!;

    public DbSet<ChallengeProgress> ChallengeProgresses { get; set; } = null!;

    // Focus feature related entities
    public DbSet<FocusSession> FocusSessions { get; set; } = null!;
    public DbSet<Distraction> Distractions { get; set; } = null!;

    // Gamification related entities
    public DbSet<UserProgress> UserProgresses { get; set; } = null!;
    public DbSet<PointTransaction> PointTransactions { get; set; } = null!;
    public DbSet<TaskTrackerAPI.Models.Achievement> Achievements { get; set; } = null!;
    public DbSet<TaskTrackerAPI.Models.UserAchievement> UserAchievements { get; set; } = null!;
    public DbSet<TaskTrackerAPI.Models.Badge> Badges { get; set; } = null!;
    public DbSet<TaskTrackerAPI.Models.UserBadge> UserBadges { get; set; } = null!;
    public DbSet<Reward> Rewards { get; set; } = null!;
    public DbSet<UserReward> UserRewards { get; set; } = null!;
    public DbSet<PriorityMultiplier> PriorityMultipliers { get; set; } = null!;
    
    // New gamification models
    public DbSet<Models.Gamification.Achievement> GamificationAchievements { get; set; } = null!;
    public DbSet<Models.Gamification.UserAchievement> GamificationUserAchievements { get; set; } = null!;

    // Family management entities
    public DbSet<Family> Families { get; set; } = null!;
    public DbSet<FamilyRole> FamilyRoles { get; set; } = null!;
    public DbSet<FamilyRolePermission> FamilyRolePermissions { get; set; } = null!;
    public DbSet<Invitation> Invitations { get; set; } = null!;
    public DbSet<UserDevice> UserDevices { get; set; } = null!;

    // Family achievement related entities
    public DbSet<FamilyAchievement> FamilyAchievements { get; set; } = null!;
    public DbSet<FamilyAchievementMember> FamilyAchievementMembers { get; set; } = null!;

    // Family calendar related entities
    public DbSet<FamilyCalendarEvent> FamilyCalendarEvents { get; set; } = null!;
    public DbSet<FamilyEventAttendee> FamilyEventAttendees { get; set; } = null!;
    public DbSet<FamilyEventReminder> FamilyEventReminders { get; set; } = null!;
    public DbSet<FamilyMemberAvailability> FamilyMemberAvailabilities { get; set; } = null!;

    public DbSet<ChecklistItem> ChecklistItems { get; set; } = null!;
    public DbSet<ChecklistTemplateItem> ChecklistTemplateItems { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured && _configuration != null)
        {
            optionsBuilder.UseSqlServer(_configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure());
        }
        
        // Suppress all warnings about pending model changes
        optionsBuilder.ConfigureWarnings(warnings => {
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning);
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.ManyServiceProvidersCreatedWarning);
        });
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure entity properties with value generators to use hardcoded values for snapshot generation
        foreach (IMutableEntityType entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (IMutableProperty property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    // Set fixed DateTime values for all DateTime properties to ensure snapshot consistency
                    if (property.Name == "CreatedAt")
                    {
                        property.SetDefaultValue(new DateTime(2025, 1, 1));
                    }
                    else if (property.Name == "UpdatedAt")
                    {
                        property.SetDefaultValue(new DateTime(2025, 1, 1));
                    }
                    else if (property.Name.Contains("Date") || property.Name.Contains("Time"))
                    {
                        // For other date/time properties, use null for nullable ones or a fixed value for non-nullable
                        if (property.IsNullable)
                        {
                            property.SetDefaultValue(null);
                        }
                        else
                        {
                            property.SetDefaultValue(new DateTime(2025, 1, 1));
                        }
                    }
                }
                else if (property.ClrType == typeof(Guid) || property.ClrType == typeof(Guid?))
                {
                    // Set fixed Guid values for all Guid properties
                    if (property.IsNullable)
                    {
                        property.SetDefaultValue(null);
                    }
                    else
                    {
                        property.SetDefaultValue(Guid.Parse("00000000-0000-0000-0000-000000000000"));
                    }
                }
            }
        }

        // Configure TaskTag as a join table
        modelBuilder.Entity<TaskTag>()
            .HasKey(tt => new { tt.TaskId, tt.TagId });

        // Configure TaskItem-User relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskItem-AssignedTo relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedTo)
            .WithMany()
            .HasForeignKey(t => t.AssignedToId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskItem-AssignedByUser relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedByUser)
            .WithMany()
            .HasForeignKey(t => t.AssignedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskItem-ApprovedByUser relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.ApprovedByUser)
            .WithMany()
            .HasForeignKey(t => t.ApprovedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskItem-Family relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Family)
            .WithMany()
            .HasForeignKey(t => t.FamilyId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskItem-AssignedToFamilyMember relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.AssignedToFamilyMember)
            .WithMany(f => f.AssignedTasks)
            .HasForeignKey(t => t.AssignedToFamilyMemberId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskItem-ChecklistItem relationship
        modelBuilder.Entity<ChecklistItem>()
            .HasOne(c => c.Task)
            .WithMany(t => t.ChecklistItems)
            .HasForeignKey(c => c.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure TaskItem-Category relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Tasks)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure TaskItem-Board relationship
        modelBuilder.Entity<TaskItem>()
            .HasOne(t => t.Board)
            .WithMany(b => b.Tasks)
            .HasForeignKey(t => t.BoardId)
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

        // Fix the shadow property warnings by explicitly ignoring navigation properties
        // and setting up relationships with specific names
        modelBuilder.Entity<Board>(entity =>
        {
            // Explicitly ignore the navigation property
            entity.Ignore(b => b.User);
            
            // Manual mapping of the foreign key
            entity.Property(b => b.UserId).IsRequired();
        });

        // Fix FamilyMember relationship
        modelBuilder.Entity<FamilyMember>(entity =>
        {
            // Explicitly ignore the navigation property
            entity.Ignore(f => f.User);
            
            // Manual mapping of the foreign key
            entity.Property(f => f.UserId).IsRequired();
        });

        // Configure TaskTemplate-User relationship
        modelBuilder.Entity<TaskTemplate>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.SetNull);
            
        // Configure Notification-User relationship
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Gamification relationships
        // Configure UserProgress-User relationship
        modelBuilder.Entity<UserProgress>()
            .HasOne(up => up.User)
            .WithMany()
            .HasForeignKey(up => up.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure PointTransaction-User relationship
        modelBuilder.Entity<PointTransaction>()
            .HasOne(pt => pt.User)
            .WithMany()
            .HasForeignKey(pt => pt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure PointTransaction-Task relationship
        modelBuilder.Entity<PointTransaction>()
            .HasOne(pt => pt.Task)
            .WithMany()
            .HasForeignKey(pt => pt.TaskId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure UserAchievement relationships
        modelBuilder.Entity<TaskTrackerAPI.Models.UserAchievement>()
            .HasOne(ua => ua.User)
            .WithMany()
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskTrackerAPI.Models.UserAchievement>()
            .HasOne(ua => ua.Achievement)
            .WithMany(a => a.UserAchievements)
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure UserBadge relationships
        modelBuilder.Entity<TaskTrackerAPI.Models.UserBadge>()
            .HasOne(ub => ub.User)
            .WithMany()
            .HasForeignKey(ub => ub.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskTrackerAPI.Models.UserBadge>()
            .HasOne(ub => ub.Badge)
            .WithMany(b => b.UserBadges)
            .HasForeignKey(ub => ub.BadgeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure UserReward relationships
        modelBuilder.Entity<UserReward>()
            .HasOne(ur => ur.User)
            .WithMany()
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserReward>()
            .HasOne(ur => ur.Reward)
            .WithMany(r => r.UserRewards)
            .HasForeignKey(ur => ur.RewardId)
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
                    Priority = "High"
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
                   Priority = "Medium"
               }
           );

        // Seed default priority multipliers
        modelBuilder.Entity<PriorityMultiplier>().HasData(
            new PriorityMultiplier { Id = 1, Priority = "Low", Multiplier = 0.5 },
            new PriorityMultiplier { Id = 2, Priority = "Medium", Multiplier = 1.0 },
            new PriorityMultiplier { Id = 3, Priority = "High", Multiplier = 1.5 },
            new PriorityMultiplier { Id = 4, Priority = "Critical", Multiplier = 2.0 }
        );

        // Configure Reminder relationships
        modelBuilder.Entity<Reminder>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reminder>()
            .HasOne(r => r.TaskItem)
            .WithMany()
            .HasForeignKey(r => r.TaskItemId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure Note relationships
        modelBuilder.Entity<Note>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Note>()
            .HasOne(n => n.TaskItem)
            .WithMany()
            .HasForeignKey(n => n.TaskItemId)
            .OnDelete(DeleteBehavior.SetNull);

        // Fix ChallengeProgress relationship
        modelBuilder.Entity<ChallengeProgress>(entity =>
        {
            // Explicitly ignore the navigation properties
            entity.Ignore(cp => cp.User);
            entity.Ignore(cp => cp.Challenge);
            
            // Manual mapping of the foreign keys
            entity.Property(cp => cp.UserId).IsRequired();
            entity.Property(cp => cp.ChallengeId).IsRequired();
        });

        // Configure Family entity relationships
        modelBuilder.Entity<Family>()
            .HasOne(f => f.CreatedByUser)
            .WithMany()
            .HasForeignKey(f => f.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure FamilyMember entity relationships
        modelBuilder.Entity<FamilyMember>()
            .HasOne(fm => fm.Family)
            .WithMany(f => f.Members)
            .HasForeignKey(fm => fm.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyMember>()
            .HasOne(fm => fm.User)
            .WithMany(u => u.FamilyMembers)
            .HasForeignKey(fm => fm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyMember>()
            .HasOne(fm => fm.Role)
            .WithMany(r => r.Members)
            .HasForeignKey(fm => fm.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure FamilyRolePermission entity relationships
        modelBuilder.Entity<FamilyRolePermission>()
            .HasOne(p => p.Role)
            .WithMany(r => r.Permissions)
            .HasForeignKey(p => p.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Invitation entity relationships
        modelBuilder.Entity<Invitation>()
            .HasOne(i => i.Family)
            .WithMany()
            .HasForeignKey(i => i.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Invitation>()
            .HasOne(i => i.Role)
            .WithMany()
            .HasForeignKey(i => i.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Invitation>()
            .HasOne(i => i.CreatedBy)
            .WithMany()
            .HasForeignKey(i => i.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure UserDevice entity relationships
        modelBuilder.Entity<UserDevice>()
            .HasOne(ud => ud.User)
            .WithMany(u => u.Devices)
            .HasForeignKey(ud => ud.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Configure FamilyAchievement relationships
        modelBuilder.Entity<FamilyAchievement>()
            .HasOne(fa => fa.Family)
            .WithMany()
            .HasForeignKey(fa => fa.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);
            
        // Configure FamilyAchievementMember relationships
        modelBuilder.Entity<FamilyAchievementMember>()
            .HasOne(fam => fam.Achievement)
            .WithMany(fa => fa.MemberContributions)
            .HasForeignKey(fam => fam.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<FamilyAchievementMember>()
            .HasOne(fam => fam.Member)
            .WithMany()
            .HasForeignKey(fam => fam.FamilyMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure new gamification models
        modelBuilder.Entity<Models.Gamification.Achievement>()
            .ToTable("GamificationAchievements");

        modelBuilder.Entity<Models.Gamification.UserAchievement>()
            .ToTable("GamificationUserAchievements")
            .HasOne(ua => ua.Achievement)
            .WithMany(a => a.UserAchievements)
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure FamilyCalendarEvent relationships
        modelBuilder.Entity<FamilyCalendarEvent>()
            .HasOne(e => e.Family)
            .WithMany()
            .HasForeignKey(e => e.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyCalendarEvent>()
            .HasOne(e => e.CreatedByUser)
            .WithMany()
            .HasForeignKey(e => e.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure FamilyEventAttendee relationships
        modelBuilder.Entity<FamilyEventAttendee>()
            .HasOne(a => a.Event)
            .WithMany(e => e.Attendees)
            .HasForeignKey(a => a.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyEventAttendee>()
            .HasOne(a => a.FamilyMember)
            .WithMany()
            .HasForeignKey(a => a.FamilyMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure FamilyEventReminder relationships
        modelBuilder.Entity<FamilyEventReminder>()
            .HasOne(r => r.Event)
            .WithMany(e => e.Reminders)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure FamilyMemberAvailability relationships
        modelBuilder.Entity<FamilyMemberAvailability>()
            .HasOne(a => a.FamilyMember)
            .WithMany()
            .HasForeignKey(a => a.FamilyMemberId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure TaskTemplate-ChecklistTemplateItem relationship
        modelBuilder.Entity<ChecklistTemplateItem>()
            .HasOne(c => c.TaskTemplate)
            .WithMany(t => t.ChecklistItems)
            .HasForeignKey(c => c.TaskTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}