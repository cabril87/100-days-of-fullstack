using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Achievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TargetValue = table.Column<int>(type: "int", nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Difficulty = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achievements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    Details = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Badges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    IconPath = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    RequiredAchievementId = table.Column<int>(type: "int", nullable: true),
                    IsSpecial = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Challenges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PointReward = table.Column<int>(type: "int", nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TargetCount = table.Column<int>(type: "int", nullable: false),
                    TargetEntityId = table.Column<int>(type: "int", nullable: true),
                    RewardBadgeId = table.Column<int>(type: "int", nullable: true),
                    AdditionalCriteria = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Difficulty = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FamilyRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GamificationAchievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Criteria = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Difficulty = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamificationAchievements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PriorityMultipliers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Multiplier = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PriorityMultipliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rewards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PointCost = table.Column<int>(type: "int", nullable: false),
                    MinimumLevel = table.Column<int>(type: "int", nullable: false),
                    IconPath = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rewards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SubscriptionTiers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DefaultRateLimit = table.Column<int>(type: "int", nullable: false),
                    DefaultTimeWindowSeconds = table.Column<int>(type: "int", nullable: false),
                    DailyApiQuota = table.Column<int>(type: "int", nullable: false),
                    MaxConcurrentConnections = table.Column<int>(type: "int", nullable: false),
                    BypassStandardRateLimits = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    IsSystemTier = table.Column<bool>(type: "bit", nullable: false),
                    MonthlyCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionTiers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChallengeProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ChallengeId = table.Column<int>(type: "int", nullable: false),
                    CurrentProgress = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TasksCompleted = table.Column<int>(type: "int", nullable: false),
                    PointsEarned = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengeProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengeProgresses_Challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "Challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FamilyRolePermissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyRolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyRolePermissions_FamilyRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "FamilyRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamificationUserAchievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AchievementId = table.Column<int>(type: "int", nullable: false),
                    Progress = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamificationUserAchievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GamificationUserAchievements_GamificationAchievements_AchievementId",
                        column: x => x.AchievementId,
                        principalTable: "GamificationAchievements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RateLimitTierConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionTierId = table.Column<int>(type: "int", nullable: false),
                    EndpointPattern = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    HttpMethod = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    RateLimit = table.Column<int>(type: "int", nullable: false),
                    TimeWindowSeconds = table.Column<int>(type: "int", nullable: false),
                    IsCriticalEndpoint = table.Column<bool>(type: "bit", nullable: false),
                    ExemptSystemAccounts = table.Column<bool>(type: "bit", nullable: false),
                    MatchPriority = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsAdaptive = table.Column<bool>(type: "bit", nullable: false),
                    HighLoadReductionPercent = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RateLimitTierConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RateLimitTierConfigs_SubscriptionTiers_SubscriptionTierId",
                        column: x => x.SubscriptionTierId,
                        principalTable: "SubscriptionTiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Boards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Template = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomLayout = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChecklistItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChecklistTemplateItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    TaskTemplateId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistTemplateItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Distractions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FocusSessionId = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Distractions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Families",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    CreatedById = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Families", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FamilyAchievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FamilyId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    ProgressCurrent = table.Column<int>(type: "int", nullable: false),
                    ProgressTarget = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyAchievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyAchievements_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false, comment: "Encrypted field - PII"),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Salt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true, comment: "Encrypted field - PII"),
                    LastName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true, comment: "Encrypted field - PII"),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    PrimaryFamilyId = table.Column<int>(type: "int", nullable: true),
                    AgeGroup = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Families_PrimaryFamilyId",
                        column: x => x.PrimaryFamilyId,
                        principalTable: "Families",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FamilyCalendarEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsAllDay = table.Column<bool>(type: "bit", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    FamilyId = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyCalendarEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyCalendarEvents_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyCalendarEvents_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FamilyMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Relationship = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FamilyId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsPending = table.Column<bool>(type: "bit", nullable: false),
                    ProfileCompleted = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyMembers_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyMembers_FamilyRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "FamilyRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FamilyMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Invitations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FamilyId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    CreatedById = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsAccepted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invitations_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Invitations_FamilyRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "FamilyRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Invitations_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsImportant = table.Column<bool>(type: "bit", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: true),
                    RelatedEntityId = table.Column<int>(type: "int", nullable: true),
                    RelatedEntityType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Token = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    CreatedByIp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RevokedByIp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RevokedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReplacedByToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TokenFamily = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReasonRevoked = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tags_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TaskTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    TemplateData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsSystemTemplate = table.Column<bool>(type: "bit", nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskTemplates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserAchievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    AchievementId = table.Column<int>(type: "int", nullable: false),
                    UnlockedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAchievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAchievements_Achievements_AchievementId",
                        column: x => x.AchievementId,
                        principalTable: "Achievements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserAchievements_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserApiQuotas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ApiCallsUsedToday = table.Column<int>(type: "int", nullable: false),
                    MaxDailyApiCalls = table.Column<int>(type: "int", nullable: false),
                    LastResetTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    LastUpdatedTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    SubscriptionTierId = table.Column<int>(type: "int", nullable: false),
                    IsExemptFromQuota = table.Column<bool>(type: "bit", nullable: false),
                    HasReceivedQuotaWarning = table.Column<bool>(type: "bit", nullable: false),
                    QuotaWarningThresholdPercent = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserApiQuotas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserApiQuotas_SubscriptionTiers_SubscriptionTierId",
                        column: x => x.SubscriptionTierId,
                        principalTable: "SubscriptionTiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserApiQuotas_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserBadges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    BadgeId = table.Column<int>(type: "int", nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDisplayed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBadges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserBadges_Badges_BadgeId",
                        column: x => x.BadgeId,
                        principalTable: "Badges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserBadges_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserChallenges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ChallengeId = table.Column<int>(type: "int", nullable: false),
                    EnrolledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentProgress = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsRewardClaimed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserChallenges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserChallenges_Challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "Challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserChallenges_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserDevices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceToken = table.Column<string>(type: "nvarchar(1024)", nullable: false, comment: "Encrypted field (highly sensitive) - DeviceToken"),
                    DeviceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerificationCode = table.Column<string>(type: "nvarchar(1024)", nullable: true, comment: "Encrypted field - Security"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    LastActiveAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDevices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserDevices_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProgresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    CurrentPoints = table.Column<int>(type: "int", nullable: false),
                    TotalPointsEarned = table.Column<int>(type: "int", nullable: false),
                    NextLevelThreshold = table.Column<int>(type: "int", nullable: false),
                    CurrentStreak = table.Column<int>(type: "int", nullable: false),
                    LongestStreak = table.Column<int>(type: "int", nullable: false),
                    LastActivityDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRewards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RewardId = table.Column<int>(type: "int", nullable: false),
                    RedeemedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRewards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRewards_Rewards_RewardId",
                        column: x => x.RewardId,
                        principalTable: "Rewards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRewards_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FamilyEventReminders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    TimeBeforeInMinutes = table.Column<int>(type: "int", nullable: false),
                    ReminderMethod = table.Column<int>(type: "int", nullable: false),
                    Sent = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyEventReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyEventReminders_FamilyCalendarEvents_EventId",
                        column: x => x.EventId,
                        principalTable: "FamilyCalendarEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FamilyAchievementMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AchievementId = table.Column<int>(type: "int", nullable: false),
                    FamilyMemberId = table.Column<int>(type: "int", nullable: false),
                    ContributionPoints = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyAchievementMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyAchievementMembers_FamilyAchievements_AchievementId",
                        column: x => x.AchievementId,
                        principalTable: "FamilyAchievements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyAchievementMembers_FamilyMembers_FamilyMemberId",
                        column: x => x.FamilyMemberId,
                        principalTable: "FamilyMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FamilyEventAttendees",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    FamilyMemberId = table.Column<int>(type: "int", nullable: false),
                    Response = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyEventAttendees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyEventAttendees_FamilyCalendarEvents_EventId",
                        column: x => x.EventId,
                        principalTable: "FamilyCalendarEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyEventAttendees_FamilyMembers_FamilyMemberId",
                        column: x => x.FamilyMemberId,
                        principalTable: "FamilyMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FamilyMemberAvailabilities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FamilyMemberId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false),
                    RecurrencePattern = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DayOfWeek = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyMemberAvailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyMemberAvailabilities_FamilyMembers_FamilyMemberId",
                        column: x => x.FamilyMemberId,
                        principalTable: "FamilyMembers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: true),
                    EstimatedTimeMinutes = table.Column<int>(type: "int", nullable: true),
                    BoardId = table.Column<int>(type: "int", nullable: true),
                    BoardColumn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BoardOrder = table.Column<int>(type: "int", nullable: true),
                    PositionX = table.Column<double>(type: "float", nullable: true),
                    PositionY = table.Column<double>(type: "float", nullable: true),
                    AssignedToId = table.Column<int>(type: "int", nullable: true),
                    AssignedToFamilyMemberId = table.Column<int>(type: "int", nullable: true),
                    IsRecurring = table.Column<bool>(type: "bit", nullable: false),
                    RecurringPattern = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastRecurrence = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextRecurrence = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AssignedByUserId = table.Column<int>(type: "int", nullable: true),
                    FamilyId = table.Column<int>(type: "int", nullable: true),
                    RequiresApproval = table.Column<bool>(type: "bit", nullable: false),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tasks_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Tasks_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tasks_FamilyMembers_AssignedToFamilyMemberId",
                        column: x => x.AssignedToFamilyMemberId,
                        principalTable: "FamilyMembers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tasks_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tasks_Users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tasks_Users_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Tasks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FocusSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FocusSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FocusSessions_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FocusSessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Format = table.Column<int>(type: "int", nullable: false),
                    IsPinned = table.Column<bool>(type: "bit", nullable: false),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TaskItemId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notes_Tasks_TaskItemId",
                        column: x => x.TaskItemId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PointTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    TransactionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaskId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PointTransactions_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PointTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reminders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ReminderTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsRepeating = table.Column<bool>(type: "bit", nullable: false),
                    RepeatFrequency = table.Column<int>(type: "int", nullable: true),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    TaskItemId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reminders_Tasks_TaskItemId",
                        column: x => x.TaskItemId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Reminders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskTags",
                columns: table => new
                {
                    TaskId = table.Column<int>(type: "int", nullable: false),
                    TagId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskTags", x => new { x.TaskId, x.TagId });
                    table.ForeignKey(
                        name: "FK_TaskTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskTags_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "PriorityMultipliers",
                columns: new[] { "Id", "Multiplier", "Priority" },
                values: new object[,]
                {
                    { 1, 0.5, "Low" },
                    { 2, 1.0, "Medium" },
                    { 3, 1.5, "High" },
                    { 4, 2.0, "Critical" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AgeGroup", "CreatedAt", "Email", "FirstName", "IsActive", "LastName", "PasswordHash", "PrimaryFamilyId", "Role", "Salt", "Username" },
                values: new object[] { 1, 2, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "CfDJ8HeiyxunoJNOiKpgMimE46evAvlHA5jcC3pv2K_tsclAEEi-SWWYk0PCKzAKT7nOUsByjVQQ1WKxBo7E7J1rtSoIgE_vMRwQWNQ0uJty8alU9VduXcwpq1TGVMptf5xfVw15AakhY-fbdMBHJoP5zfc", "CfDJ8HeiyxunoJNOiKpgMimE46decVNUfAYSxtf5CXd44aIgXEO3R3QwV3kqhDbQDle_lO5Y3Cm0q2Y32nReqJZQI1TZUUYDARI994c17COtm1pLDwQsKk24deSICPn2BKVwPg", true, "CfDJ8HeiyxunoJNOiKpgMimE46fwhF8fJ7CMNTxmJrXurVURVmtJi7AfxPnuipfxJN1OUHprpEXcQj9KwaDaIJBp7bSFpo53U9v_NPel4Bk_spr7bn4AQ2uSIHoT8eUJ4Cwdow", "L6Y+Dh8V3HZ1U3A12NPP8jfGaxL1cOFUeo84mMjO1vQ=", null, "Admin", "AAECAwQFBgcICQoLDA0ODw==", "admin" });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Description", "Name", "UserId" },
                values: new object[,]
                {
                    { 1, "Work-related tasks", "Work", 1 },
                    { 2, "Personal tasks", "Personal", 1 }
                });

            migrationBuilder.InsertData(
                table: "Tasks",
                columns: new[] { "Id", "ApprovedAt", "ApprovedByUserId", "AssignedByUserId", "AssignedToFamilyMemberId", "AssignedToId", "BoardColumn", "BoardId", "BoardOrder", "CategoryId", "CompletedAt", "CreatedAt", "Description", "DueDate", "EstimatedTimeMinutes", "FamilyId", "IsCompleted", "IsRecurring", "LastRecurrence", "NextRecurrence", "PositionX", "PositionY", "Priority", "RecurringPattern", "RequiresApproval", "Status", "Title", "UpdatedAt", "UserId", "Version" },
                values: new object[,]
                {
                    { 1, null, null, null, null, null, null, null, null, 1, null, new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Set up the initial project structure", new DateTime(2025, 4, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, false, false, null, null, null, null, "High", null, false, 4, "Complete project setup", new DateTime(2025, 5, 18, 1, 35, 19, 428, DateTimeKind.Utc).AddTicks(3117), 1, 1L },
                    { 2, null, null, null, null, null, null, null, null, 1, null, new DateTime(2025, 4, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), "Set up the database connection and models", new DateTime(2025, 4, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null, false, false, null, null, null, null, "Medium", null, false, 4, "Database integration", new DateTime(2025, 5, 18, 1, 35, 19, 428, DateTimeKind.Utc).AddTicks(4752), 1, 1L }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Boards_UserId",
                table: "Boards",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeProgresses_ChallengeId",
                table: "ChallengeProgresses",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistItems_TaskId",
                table: "ChecklistItems",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistTemplateItems_TaskTemplateId",
                table: "ChecklistTemplateItems",
                column: "TaskTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_Distractions_FocusSessionId",
                table: "Distractions",
                column: "FocusSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Families_CreatedById",
                table: "Families",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAchievementMembers_AchievementId",
                table: "FamilyAchievementMembers",
                column: "AchievementId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAchievementMembers_FamilyMemberId",
                table: "FamilyAchievementMembers",
                column: "FamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyAchievements_FamilyId",
                table: "FamilyAchievements",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyCalendarEvents_CreatedById",
                table: "FamilyCalendarEvents",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyCalendarEvents_FamilyId",
                table: "FamilyCalendarEvents",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyEventAttendees_EventId",
                table: "FamilyEventAttendees",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyEventAttendees_FamilyMemberId",
                table: "FamilyEventAttendees",
                column: "FamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyEventReminders_EventId",
                table: "FamilyEventReminders",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMemberAvailabilities_FamilyMemberId",
                table: "FamilyMemberAvailabilities",
                column: "FamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_FamilyId",
                table: "FamilyMembers",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_RoleId",
                table: "FamilyMembers",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_UserId",
                table: "FamilyMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyRolePermissions_RoleId",
                table: "FamilyRolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_FocusSessions_TaskId",
                table: "FocusSessions",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_FocusSessions_UserId",
                table: "FocusSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GamificationUserAchievements_AchievementId",
                table: "GamificationUserAchievements",
                column: "AchievementId");

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_CreatedById",
                table: "Invitations",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_FamilyId",
                table: "Invitations",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_RoleId",
                table: "Invitations",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_TaskItemId",
                table: "Notes",
                column: "TaskItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId",
                table: "Notes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedByUserId",
                table: "Notifications",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_TaskId",
                table: "PointTransactions",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_UserId",
                table: "PointTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RateLimitTierConfigs_SubscriptionTierId",
                table: "RateLimitTierConfigs",
                column: "SubscriptionTierId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_TaskItemId",
                table: "Reminders",
                column: "TaskItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Reminders_UserId",
                table: "Reminders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_UserId",
                table: "Tags",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ApprovedByUserId",
                table: "Tasks",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedByUserId",
                table: "Tasks",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedToFamilyMemberId",
                table: "Tasks",
                column: "AssignedToFamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedToId",
                table: "Tasks",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_BoardId",
                table: "Tasks",
                column: "BoardId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_CategoryId",
                table: "Tasks",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_FamilyId",
                table: "Tasks",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskTags_TagId",
                table: "TaskTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskTemplates_UserId",
                table: "TaskTemplates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievements_AchievementId",
                table: "UserAchievements",
                column: "AchievementId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAchievements_UserId",
                table: "UserAchievements",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserApiQuotas_SubscriptionTierId",
                table: "UserApiQuotas",
                column: "SubscriptionTierId");

            migrationBuilder.CreateIndex(
                name: "IX_UserApiQuotas_UserId",
                table: "UserApiQuotas",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_BadgeId",
                table: "UserBadges",
                column: "BadgeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_UserId",
                table: "UserBadges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_ChallengeId",
                table: "UserChallenges",
                column: "ChallengeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserChallenges_UserId",
                table: "UserChallenges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserDevices_UserId",
                table: "UserDevices",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserProgresses_UserId",
                table: "UserProgresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRewards_RewardId",
                table: "UserRewards",
                column: "RewardId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRewards_UserId",
                table: "UserRewards",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PrimaryFamilyId",
                table: "Users",
                column: "PrimaryFamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Boards_Users_UserId",
                table: "Boards",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Users_UserId",
                table: "Categories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistItems_Tasks_TaskId",
                table: "ChecklistItems",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistTemplateItems_TaskTemplates_TaskTemplateId",
                table: "ChecklistTemplateItems",
                column: "TaskTemplateId",
                principalTable: "TaskTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Distractions_FocusSessions_FocusSessionId",
                table: "Distractions",
                column: "FocusSessionId",
                principalTable: "FocusSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Families_Users_CreatedById",
                table: "Families",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Families_Users_CreatedById",
                table: "Families");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ChallengeProgresses");

            migrationBuilder.DropTable(
                name: "ChecklistItems");

            migrationBuilder.DropTable(
                name: "ChecklistTemplateItems");

            migrationBuilder.DropTable(
                name: "Distractions");

            migrationBuilder.DropTable(
                name: "FamilyAchievementMembers");

            migrationBuilder.DropTable(
                name: "FamilyEventAttendees");

            migrationBuilder.DropTable(
                name: "FamilyEventReminders");

            migrationBuilder.DropTable(
                name: "FamilyMemberAvailabilities");

            migrationBuilder.DropTable(
                name: "FamilyRolePermissions");

            migrationBuilder.DropTable(
                name: "GamificationUserAchievements");

            migrationBuilder.DropTable(
                name: "Invitations");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PointTransactions");

            migrationBuilder.DropTable(
                name: "PriorityMultipliers");

            migrationBuilder.DropTable(
                name: "RateLimitTierConfigs");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Reminders");

            migrationBuilder.DropTable(
                name: "TaskTags");

            migrationBuilder.DropTable(
                name: "UserAchievements");

            migrationBuilder.DropTable(
                name: "UserApiQuotas");

            migrationBuilder.DropTable(
                name: "UserBadges");

            migrationBuilder.DropTable(
                name: "UserChallenges");

            migrationBuilder.DropTable(
                name: "UserDevices");

            migrationBuilder.DropTable(
                name: "UserProgresses");

            migrationBuilder.DropTable(
                name: "UserRewards");

            migrationBuilder.DropTable(
                name: "TaskTemplates");

            migrationBuilder.DropTable(
                name: "FocusSessions");

            migrationBuilder.DropTable(
                name: "FamilyAchievements");

            migrationBuilder.DropTable(
                name: "FamilyCalendarEvents");

            migrationBuilder.DropTable(
                name: "GamificationAchievements");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Achievements");

            migrationBuilder.DropTable(
                name: "SubscriptionTiers");

            migrationBuilder.DropTable(
                name: "Badges");

            migrationBuilder.DropTable(
                name: "Challenges");

            migrationBuilder.DropTable(
                name: "Rewards");

            migrationBuilder.DropTable(
                name: "Tasks");

            migrationBuilder.DropTable(
                name: "Boards");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "FamilyMembers");

            migrationBuilder.DropTable(
                name: "FamilyRoles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Families");
        }
    }
}
