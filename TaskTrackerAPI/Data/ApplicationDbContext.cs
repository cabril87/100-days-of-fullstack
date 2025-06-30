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
using TaskTrackerAPI.Models.Security;
using GamificationModels = TaskTrackerAPI.Models.Gamification;
using System;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore.Metadata;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Extensions;
using TaskTrackerAPI.Models.Analytics;
using TaskTrackerAPI.Models.ML;
using TaskTrackerAPI.Models.BackgroundServices;
using System.Text;
using TaskTrackerAPI.Helpers;

namespace TaskTrackerAPI.Data;

public class ApplicationDbContext : DbContext
{
    private readonly IConfiguration? _configuration;
    private readonly IDataProtectionService? _dataProtectionService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options, 
        IConfiguration? configuration = null,
        IDataProtectionService? dataProtectionService = null)
        : base(options)
    {
        _configuration = configuration;
        _dataProtectionService = dataProtectionService;
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<TaskItem> TaskItems { get; set; } = null!; 
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<TaskTag> TaskTags { get; set; } = null!;

    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; } = null!;

    public DbSet<SecurityQuestion> SecurityQuestions { get; set; } = null!;

    public DbSet<Reminder> Reminders { get; set; } = null!;

    public DbSet<Note> Notes { get; set; } = null!;
    
    public DbSet<Board> Boards { get; set; } = null!;
    
    // Enhanced board entities (Custom Kanban Implementation)
    public DbSet<BoardColumn> BoardColumns { get; set; } = null!;
    public DbSet<BoardTemplate> BoardTemplates { get; set; } = null!;
    public DbSet<BoardTemplateColumn> BoardTemplateColumns { get; set; } = null!;
    public DbSet<BoardSettings> BoardSettings { get; set; } = null!;
    
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
    
    // Marketplace entities
    public DbSet<TemplatePurchase> TemplatePurchases { get; set; } = null!;
    
    // Using consistent Gamification namespace models
    public DbSet<GamificationModels.Achievement> Achievements { get; set; } = null!;
    public DbSet<GamificationModels.UserAchievement> UserAchievements { get; set; } = null!;
    public DbSet<GamificationModels.Badge> Badges { get; set; } = null!;
    public DbSet<GamificationModels.UserBadge> UserBadges { get; set; } = null!;
    public DbSet<Reward> Rewards { get; set; } = null!;
    public DbSet<UserReward> UserRewards { get; set; } = null!;
    public DbSet<PriorityMultiplier> PriorityMultipliers { get; set; } = null!;
    
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

    public DbSet<FamilyActivity> FamilyActivities { get; set; } = null!;
    
    public DbSet<ChecklistItem> ChecklistItems { get; set; } = null!;
    public DbSet<ChecklistTemplateItem> ChecklistTemplateItems { get; set; } = null!;

    // Day 60 Template Enhancement DbSets
    public DbSet<TaskAutomationRule> TaskAutomationRules { get; set; } = null!;
    public DbSet<TemplateCategory> TemplateCategories { get; set; } = null!;
    public DbSet<TemplateMarketplace> TemplateMarketplace { get; set; } = null!;
    public DbSet<TemplateUsageAnalytics> TemplateUsageAnalytics { get; set; } = null!;
    public DbSet<WorkflowStep> WorkflowSteps { get; set; } = null!;

    // Add these DbSet properties after the existing ones
    public DbSet<SubscriptionTier> SubscriptionTiers { get; set; } = null!;
    public DbSet<UserApiQuota> UserApiQuotas { get; set; } = null!;
    public DbSet<UserSubscription> UserSubscriptions { get; set; } = null!;
    public DbSet<RateLimitTierConfig> RateLimitTierConfigs { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    
    // Add notification preferences
    public DbSet<NotificationPreference> NotificationPreferences { get; set; } = null!;
    
    // Security monitoring entities
    public DbSet<SecurityMetrics> SecurityMetrics { get; set; } = null!;
    public DbSet<SecurityAuditLog> SecurityAuditLogs { get; set; } = null!;
    public DbSet<SystemHealthMetrics> SystemHealthMetrics { get; set; } = null!;
    
    // Enhanced security entities
    public DbSet<FailedLoginAttempt> FailedLoginAttempts { get; set; } = null!;
    public DbSet<UserSession> UserSessions { get; set; } = null!;
    public DbSet<UserSecuritySettings> UserSecuritySettings { get; set; } = null!;
    
    // Advanced security entities
    public DbSet<ThreatIntelligence> ThreatIntelligence { get; set; } = null!;
    public DbSet<BehavioralAnalytics> BehavioralAnalytics { get; set; } = null!;

    // Parental Control entities (Family Safety)
    public DbSet<ParentalControl> ParentalControls { get; set; } = null!;
    public DbSet<PermissionRequest> PermissionRequests { get; set; } = null!;
    public DbSet<TimeRange> TimeRanges { get; set; } = null!;

    // Analytics entities (Day 59)
    public DbSet<SavedFilter> SavedFilters { get; set; } = null!;
    public DbSet<AnalyticsQuery> AnalyticsQueries { get; set; } = null!;
    public DbSet<DataExportRequest> DataExportRequests { get; set; } = null!;
    public DbSet<DashboardWidget> DashboardWidgets { get; set; } = null!;

    // ML and Learning entities (Adaptation Learning System)
    public DbSet<UserLearningProfile> UserLearningProfiles { get; set; } = null!;
    public DbSet<RecommendationScore> RecommendationScores { get; set; } = null!;
    public DbSet<AdaptationEvent> AdaptationEvents { get; set; } = null!;

    // Background service entities (Day 61)
    public DbSet<BackgroundServiceStatus> BackgroundServiceStatuses { get; set; } = null!;
    public DbSet<BackgroundServiceExecution> BackgroundServiceExecutions { get; set; } = null!;
    public DbSet<SystemMaintenanceNotification> SystemMaintenanceNotifications { get; set; } = null!;
    public DbSet<SystemOptimizationRecommendation> SystemOptimizationRecommendations { get; set; } = null!;

    // Search entities
    public DbSet<SavedSearch> SavedSearches { get; set; } = null!;

    // Photo attachment entities (Task Evidence System)
    public DbSet<PhotoAttachment> PhotoAttachments { get; set; } = null!;
    public DbSet<PhotoValidation> PhotoValidations { get; set; } = null!;
    public DbSet<PhotoShare> PhotoShares { get; set; } = null!;
    public DbSet<PhotoReaction> PhotoReactions { get; set; } = null!;
    public DbSet<PhotoComment> PhotoComments { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured && _configuration != null)
        {
            optionsBuilder.UseSqlServer(_configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure());
        }
        
        // Suppress all warnings about pending model changes
        optionsBuilder.ConfigureWarnings(warnings =>
        {
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning);
            warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.CoreEventId.ManyServiceProvidersCreatedWarning);
        });
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure decimal precision for SubscriptionTier.MonthlyCost
        modelBuilder.Entity<SubscriptionTier>()
            .Property(s => s.MonthlyCost)
            .HasColumnType("decimal(18,2)");

        // Apply encryption to properties marked with [Encrypt] attribute
        if (_dataProtectionService != null)
        {
            modelBuilder.ApplyEncryption(_dataProtectionService);
        }
        
        // Configure User model encryption comments
        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasComment("Encrypted field - PII");

        modelBuilder.Entity<User>()
            .Property(u => u.FirstName)
            .HasComment("Encrypted field - PII");

        modelBuilder.Entity<User>()
            .Property(u => u.LastName)
            .HasComment("Encrypted field - PII");
        
        // Configure unique constraints for User entity
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("IX_Users_Email_Unique");

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique()
            .HasDatabaseName("IX_Users_Username_Unique");
        
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
            .OnDelete(DeleteBehavior.NoAction);

        // Configure Tag-User relationship
        modelBuilder.Entity<Tag>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Configure TaskTag relationships
        modelBuilder.Entity<TaskTag>()
            .HasOne(tt => tt.Task)
            .WithMany(t => t.TaskTags)
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

        // Configure SecurityQuestion-User relationship
        modelBuilder.Entity<SecurityQuestion>()
            .HasOne(sq => sq.User)
            .WithMany()
            .HasForeignKey(sq => sq.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure SecurityQuestion unique index (one set per user per order)
        modelBuilder.Entity<SecurityQuestion>()
            .HasIndex(sq => new { sq.UserId, sq.QuestionOrder })
            .IsUnique()
            .HasDatabaseName("IX_SecurityQuestions_UserId_QuestionOrder");

        // Configure SecurityQuestion encryption comment
        modelBuilder.Entity<SecurityQuestion>()
            .Property(sq => sq.EncryptedAnswer)
            .HasComment("Encrypted field - SecurityQuestions");

        // Fix the shadow property warnings by explicitly ignoring navigation properties
        // and setting up relationships with specific names
        modelBuilder.Entity<Board>(entity =>
        {
            // Explicitly ignore the navigation property
            entity.Ignore(b => b.User);
            
            // Manual mapping of the foreign key
            entity.Property(b => b.UserId).IsRequired();
        });

        // Configure FamilyMember-User relationship properly
        modelBuilder.Entity<FamilyMember>()
            .HasOne(fm => fm.User)
            .WithMany(u => u.FamilyMembers)
            .HasForeignKey(fm => fm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ensure FamilyMember properties are configured correctly
        modelBuilder.Entity<FamilyMember>(entity =>
        {
            entity.Property(f => f.UserId).IsRequired();
            entity.Property(f => f.FamilyId).IsRequired();
            entity.Property(f => f.RoleId).IsRequired();
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
        modelBuilder.Entity<GamificationModels.UserAchievement>()
            .HasOne(ua => ua.User)
            .WithMany(u => u.UserAchievements)
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GamificationModels.UserAchievement>()
            .HasOne(ua => ua.Achievement)
            .WithMany(a => a.UserAchievements)
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure UserBadge relationships
        modelBuilder.Entity<GamificationModels.UserBadge>()
            .HasOne(ub => ub.User)
            .WithMany()
            .HasForeignKey(ub => ub.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<GamificationModels.UserBadge>()
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

        // Seed all gamification data (achievements, badges, rewards, challenges)
        SeedGamificationData(modelBuilder);
        
        // Seed Kanban board templates and columns
        SeedKanbanBoardData(modelBuilder);
        
        // Seed default users (admin and customer support)
        SeedUsers(modelBuilder);
        
        // If this fails to compile, ensure GamificationSeedData.cs is included in the project

        // Configure Reminder relationships
        modelBuilder.Entity<Reminder>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Family relationships
        modelBuilder.Entity<Family>()
            .HasOne(f => f.CreatedByUser)
            .WithMany()
            .HasForeignKey(f => f.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.PrimaryFamily)
            .WithMany(f => f.PrimaryFamilyUsers)
            .HasForeignKey(u => u.PrimaryFamilyId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure FamilyMember relationships
        modelBuilder.Entity<FamilyMember>()
            .HasOne(fm => fm.Family)
            .WithMany(f => f.Members)
            .HasForeignKey(fm => fm.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyMember>()
            .HasOne(fm => fm.Role)
            .WithMany(r => r.Members)
            .HasForeignKey(fm => fm.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure FamilyAchievementMembers relationships to avoid cascade cycles
        modelBuilder.Entity<FamilyAchievementMember>()
            .HasOne(fam => fam.Achievement)
            .WithMany(fa => fa.MemberContributions)
            .HasForeignKey(fam => fam.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyAchievementMember>()
            .HasOne(fam => fam.Member)
            .WithMany()
            .HasForeignKey(fam => fam.FamilyMemberId)
            .OnDelete(DeleteBehavior.NoAction); // Use NoAction to avoid cascade cycle

        // Configure additional Family-related relationships to avoid cascade cycles
        modelBuilder.Entity<FamilyEventAttendee>()
            .HasOne(fea => fea.Event)
            .WithMany(fce => fce.Attendees)
            .HasForeignKey(fea => fea.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FamilyEventAttendee>()
            .HasOne(fea => fea.FamilyMember)
            .WithMany()
            .HasForeignKey(fea => fea.FamilyMemberId)
            .OnDelete(DeleteBehavior.NoAction); // Use NoAction to avoid cascade cycle

        modelBuilder.Entity<FamilyMemberAvailability>()
            .HasOne(fma => fma.FamilyMember)
            .WithMany()
            .HasForeignKey(fma => fma.FamilyMemberId)
            .OnDelete(DeleteBehavior.NoAction); // Use NoAction to avoid cascade cycle

        // Configure ParentalControl and related entities
        modelBuilder.Entity<ParentalControl>()
            .HasOne(pc => pc.Parent)
            .WithMany()
            .HasForeignKey(pc => pc.ParentUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ParentalControl>()
            .HasOne(pc => pc.Child)
            .WithMany()
            .HasForeignKey(pc => pc.ChildUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TimeRange>()
            .HasOne(tr => tr.ParentalControl)
            .WithMany(pc => pc.AllowedHours)
            .HasForeignKey(tr => tr.ParentalControlId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PermissionRequest>()
            .HasOne(pr => pr.Parent)
            .WithMany()
            .HasForeignKey(pr => pr.ParentUserId)
            .OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<PermissionRequest>()
            .HasOne(pr => pr.Child)
            .WithMany()
            .HasForeignKey(pr => pr.ChildUserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    private void SeedGamificationData(ModelBuilder modelBuilder)
    {
        GamificationSeedData.SeedGamificationData(modelBuilder);
    }

    private void SeedKanbanBoardData(ModelBuilder modelBuilder)
    {
        KanbanBoardSeedData.SeedKanbanBoardData(modelBuilder);
    }

    private void SeedUsers(ModelBuilder modelBuilder)
    {
        // For seeding, we need to use the actual password hashing logic
        string? defaultPassword = _configuration?.GetSection("SeedData:DefaultPassword").Value;
        
        // Only seed users if default password is configured (for security)
        if (string.IsNullOrEmpty(defaultPassword))
        {
            // Don't seed users if no default password is configured
            return;
        }

        // Create AuthHelper instance to generate proper password hashes
        if (_configuration == null)
        {
            // Skip seeding if configuration is not available
            return;
        }

        var authHelper = new AuthHelper(_configuration);
        
        // Generate proper password hash and salt for the default password
        authHelper.CreatePasswordHash(defaultPassword, out string passwordHash, out string salt);

        // Seed admin user with proper Argon2id hash
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@tasktracker.com",
                FirstName = "Admin",
                LastName = "User",
                PasswordHash = passwordHash,
                Salt = salt,
                Role = "GlobalAdmin",
                UserRole = Models.UserRole.GlobalAdmin,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1),
                AgeGroup = Models.FamilyMemberAgeGroup.Adult,
                MFAEnabled = false
            },
            new User
            {
                Id = 2,
                Username = "customersupport",
                Email = "customersupport@tasktracker.com",
                FirstName = "Customer",
                LastName = "Support",
                PasswordHash = passwordHash,
                Salt = salt,
                Role = "CustomerSupport",
                UserRole = Models.UserRole.CustomerSupport,
                IsActive = true,
                CreatedAt = new DateTime(2025, 1, 1),
                UpdatedAt = new DateTime(2025, 1, 1),
                AgeGroup = Models.FamilyMemberAgeGroup.Adult,
                MFAEnabled = false
            }
        );
    }
}