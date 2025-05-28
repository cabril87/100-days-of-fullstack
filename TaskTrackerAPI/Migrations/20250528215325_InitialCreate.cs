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
                name: "Badges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IconUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Criteria = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Rarity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Tier = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PointsRequired = table.Column<int>(type: "int", nullable: false),
                    PointValue = table.Column<int>(type: "int", nullable: false),
                    ColorScheme = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsSpecial = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BehavioralAnalytics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ActionType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ResourceAccessed = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    SessionDuration = table.Column<TimeSpan>(type: "time", nullable: false),
                    ActionsPerMinute = table.Column<int>(type: "int", nullable: false),
                    DataVolumeAccessed = table.Column<int>(type: "int", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DeviceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Browser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OperatingSystem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsAnomalous = table.Column<bool>(type: "bit", nullable: false),
                    AnomalyScore = table.Column<double>(type: "float", nullable: false),
                    RiskLevel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AnomalyReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsNewLocation = table.Column<bool>(type: "bit", nullable: false),
                    IsNewDevice = table.Column<bool>(type: "bit", nullable: false),
                    IsOffHours = table.Column<bool>(type: "bit", nullable: false),
                    IsHighVelocity = table.Column<bool>(type: "bit", nullable: false),
                    DeviationFromBaseline = table.Column<double>(type: "float", nullable: false),
                    IsOutsideNormalPattern = table.Column<bool>(type: "bit", nullable: false),
                    BehaviorMetadata = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BehavioralAnalytics", x => x.Id);
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
                    PointsRequired = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FailedLoginAttempts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmailOrUsername = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AttemptTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    FailureReason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CountryCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    IsSuspicious = table.Column<bool>(type: "bit", nullable: false),
                    RiskFactors = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FailedLoginAttempts", x => x.Id);
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
                name: "GeneralAuditLogs",
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
                    table.PrimaryKey("PK_GeneralAuditLogs", x => x.Id);
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
                name: "SecurityMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    MetricType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MetricName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<double>(type: "float", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityMetrics", x => x.Id);
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
                name: "SystemHealthMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    MetricName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Value = table.Column<double>(type: "float", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsHealthy = table.Column<bool>(type: "bit", nullable: false),
                    ThresholdWarning = table.Column<double>(type: "float", nullable: true),
                    ThresholdCritical = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemHealthMetrics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ThreatIntelligence",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IPAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    ThreatType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ThreatSource = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ConfidenceScore = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    FirstSeen = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastSeen = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ISP = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReportCount = table.Column<int>(type: "int", nullable: false),
                    IsWhitelisted = table.Column<bool>(type: "bit", nullable: false),
                    IsBlacklisted = table.Column<bool>(type: "bit", nullable: false),
                    AdditionalMetadata = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThreatIntelligence", x => x.Id);
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
                name: "Achievements",
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
                    Difficulty = table.Column<int>(type: "int", nullable: false),
                    Scope = table.Column<int>(type: "int", nullable: false),
                    FamilyId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Achievements", x => x.Id);
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
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "FamilyActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FamilyId = table.Column<int>(type: "int", nullable: false),
                    ActorId = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<int>(type: "int", nullable: true),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyActivities_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyActivities_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyActivities_Users_TargetId",
                        column: x => x.TargetId,
                        principalTable: "Users",
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
                        onDelete: ReferentialAction.Cascade);
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
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Invitations_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotificationPreferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    NotificationType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    FamilyId = table.Column<int>(type: "int", nullable: true),
                    EnableEmailNotifications = table.Column<bool>(type: "bit", nullable: false),
                    EnablePushNotifications = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationPreferences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationPreferences_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotificationPreferences_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "SecurityAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    EventType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Resource = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Details = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsSuccessful = table.Column<bool>(type: "bit", nullable: false),
                    IsSuspicious = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityAuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SecurityAuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
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
                    Progress = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    AwardNote = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsDisplayed = table.Column<bool>(type: "bit", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false)
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
                    DeviceToken = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerificationCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    CurrentCharacterClass = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CharacterXP = table.Column<int>(type: "int", nullable: false),
                    CharacterLevel = table.Column<int>(type: "int", nullable: false),
                    UnlockedCharacters = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserTier = table.Column<string>(type: "nvarchar(max)", nullable: false)
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
                name: "UserSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SessionToken = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    LastActivity = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CountryCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    DeviceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Browser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    OperatingSystem = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsSuspicious = table.Column<bool>(type: "bit", nullable: false),
                    SecurityNotes = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    TerminatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TerminationReason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSessions_Users_UserId",
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
                        principalColumn: "Id");
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
                        principalColumn: "Id");
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
                        principalColumn: "Id");
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
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false),
                    ActualTimeSpentMinutes = table.Column<int>(type: "int", nullable: false),
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
                    SessionQualityRating = table.Column<int>(type: "int", nullable: true),
                    CompletionNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TaskProgressBefore = table.Column<int>(type: "int", nullable: false),
                    TaskProgressAfter = table.Column<int>(type: "int", nullable: false),
                    TaskCompletedDuringSession = table.Column<bool>(type: "bit", nullable: false),
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
                        principalColumn: "Id");
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
                        principalColumn: "Id");
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
                table: "Achievements",
                columns: new[] { "Id", "Category", "CreatedAt", "Criteria", "Description", "Difficulty", "FamilyId", "IconUrl", "IsDeleted", "Name", "PointValue", "Scope" },
                values: new object[,]
                {
                    { 1, "First Steps", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete your very first task", 0, null, "/icons/achievements/bronze-first-task.svg", false, "First Steps", 10, 0 },
                    { 2, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks", 0, null, "/icons/achievements/bronze-task-starter.svg", false, "Task Starter", 25, 0 },
                    { 3, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 10 tasks", 0, null, "/icons/achievements/bronze-getting-started.svg", false, "Getting Started", 50, 0 },
                    { 4, "Creation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create your first task", 0, null, "/icons/achievements/bronze-creator.svg", false, "Creator", 15, 0 },
                    { 5, "Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create your first category", 0, null, "/icons/achievements/bronze-organizer.svg", false, "Organizer", 10, 0 },
                    { 6, "Time Management", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete a task before 8 AM", 1, null, "/icons/achievements/bronze-early-bird.svg", false, "Early Bird", 20, 0 },
                    { 7, "Time Management", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete a task after 10 PM", 1, null, "/icons/achievements/bronze-night-owl.svg", false, "Night Owl", 15, 0 },
                    { 8, "Dedication", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks on weekends", 1, null, "/icons/achievements/bronze-weekend-warrior.svg", false, "Weekend Warrior", 30, 0 },
                    { 9, "Time Management", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 3 tasks during lunch break", 1, null, "/icons/achievements/bronze-lunch-hero.svg", false, "Lunch Break Hero", 25, 0 },
                    { 10, "Punctuality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks before their due date", 1, null, "/icons/achievements/bronze-on-time.svg", false, "On Time", 40, 0 },
                    { 11, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete a task in under 5 minutes", 1, null, "/icons/achievements/bronze-speed-runner.svg", false, "Speed Runner", 15, 0 },
                    { 12, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 3 tasks in under 10 minutes each", 1, null, "/icons/achievements/bronze-quick-draw.svg", false, "Quick Draw", 35, 0 },
                    { 13, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks in under 15 minutes total", 2, null, "/icons/achievements/bronze-flash.svg", false, "Flash", 50, 0 },
                    { 14, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete tasks for 3 consecutive days", 1, null, "/icons/achievements/bronze-streak-start.svg", false, "Streak Starter", 30, 0 },
                    { 15, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete at least 1 task every day for 5 days", 1, null, "/icons/achievements/bronze-daily-dose.svg", false, "Daily Dose", 50, 0 },
                    { 16, "Habits", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete morning tasks 5 days in a row", 1, null, "/icons/achievements/bronze-morning-routine.svg", false, "Morning Routine", 45, 0 },
                    { 17, "Social", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Join your first family", 0, null, "/icons/achievements/bronze-team-player.svg", false, "Team Player", 25, 0 },
                    { 18, "Collaboration", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 3 family tasks", 1, null, "/icons/achievements/bronze-helpful.svg", false, "Helpful", 35, 0 },
                    { 19, "Social", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create your first family event", 1, null, "/icons/achievements/bronze-event-organizer.svg", false, "Event Organizer", 30, 0 },
                    { 20, "Learning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Try 3 different task priorities", 1, null, "/icons/achievements/bronze-experimenter.svg", false, "Experimenter", 20, 0 },
                    { 21, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete your first focus session", 0, null, "/icons/achievements/bronze-focused.svg", false, "Focused", 25, 0 },
                    { 22, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 focus sessions", 1, null, "/icons/achievements/bronze-zen-master.svg", false, "Zen Master", 75, 0 },
                    { 23, "Resilience", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Return after 7 days of inactivity", 1, null, "/icons/achievements/bronze-comeback-kid.svg", false, "Comeback Kid", 50, 0 },
                    { 24, "Quality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks with perfect quality", 2, null, "/icons/achievements/bronze-perfectionist.svg", false, "Perfectionist", 60, 0 },
                    { 25, "Versatility", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Work on 3 different categories in one day", 1, null, "/icons/achievements/bronze-multi-tasker.svg", false, "Multi-tasker", 30, 0 },
                    { 26, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 10 tasks in January", 2, null, "/icons/achievements/bronze-new-year.svg", false, "New Year Resolution", 100, 0 },
                    { 27, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 15 organization tasks in March", 2, null, "/icons/achievements/bronze-spring-cleaning.svg", false, "Spring Cleaning", 75, 0 },
                    { 28, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 20 tasks in summer months", 2, null, "/icons/achievements/bronze-summer-vibes.svg", false, "Summer Vibes", 80, 0 },
                    { 29, "Efficiency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use task templates 10 times", 1, null, "/icons/achievements/bronze-template-master.svg", false, "Template Master", 50, 0 },
                    { 30, "Automation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 3 recurring tasks", 1, null, "/icons/achievements/bronze-automation.svg", false, "Automation Lover", 45, 0 },
                    { 31, "Milestones", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use the app for 7 consecutive days", 1, null, "/icons/achievements/bronze-first-week.svg", false, "First Week", 70, 0 },
                    { 32, "Milestones", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use the app for 30 days total", 2, null, "/icons/achievements/bronze-loyal-user.svg", false, "Loyal User", 150, 0 },
                    { 33, "Productivity", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks in one hour", 2, null, "/icons/achievements/bronze-power-hour.svg", false, "Power Hour", 80, 0 },
                    { 34, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 20 tasks total", 2, null, "/icons/achievements/bronze-task-destroyer.svg", false, "Task Destroyer", 100, 0 },
                    { 35, "Priority", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 10 high-priority tasks", 2, null, "/icons/achievements/bronze-priority-pro.svg", false, "Priority Pro", 75, 0 },
                    { 36, "Priority", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 critical priority tasks", 3, null, "/icons/achievements/bronze-critical-thinker.svg", false, "Critical Thinker", 100, 0 },
                    { 37, "Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 5 different categories", 1, null, "/icons/achievements/bronze-category-creator.svg", false, "Category Creator", 50, 0 },
                    { 38, "Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use 10 different tags", 1, null, "/icons/achievements/bronze-tag-master.svg", false, "Tag Master", 40, 0 },
                    { 39, "Planning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Set your first reminder", 0, null, "/icons/achievements/bronze-reminder-rookie.svg", false, "Reminder Rookie", 15, 0 },
                    { 40, "Planning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Set 10 reminders", 1, null, "/icons/achievements/bronze-planner.svg", false, "Planner", 50, 0 },
                    { 41, "Documentation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Add notes to 5 tasks", 1, null, "/icons/achievements/bronze-note-taker.svg", false, "Note Taker", 30, 0 },
                    { 42, "Documentation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Write notes longer than 100 characters", 1, null, "/icons/achievements/bronze-detailed.svg", false, "Detailed", 25, 0 },
                    { 43, "Visualization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create your first board", 0, null, "/icons/achievements/bronze-board-creator.svg", false, "Board Creator", 30, 0 },
                    { 44, "Visualization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Move 10 tasks between board columns", 1, null, "/icons/achievements/bronze-visual-organizer.svg", false, "Visual Organizer", 40, 0 },
                    { 45, "Challenges", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Join your first challenge", 0, null, "/icons/achievements/bronze-challenge-accepted.svg", false, "Challenge Accepted", 25, 0 },
                    { 46, "Gamification", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Earn your first 100 points", 1, null, "/icons/achievements/bronze-point-collector.svg", false, "Point Collector", 0, 0 },
                    { 47, "Exploration", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Try every main feature once", 2, null, "/icons/achievements/bronze-explorer.svg", false, "Explorer", 100, 0 },
                    { 48, "Exploration", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use 5 different app features", 1, null, "/icons/achievements/bronze-feature-hunter.svg", false, "Feature Hunter", 50, 0 },
                    { 49, "Development", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 10 personal development tasks", 2, null, "/icons/achievements/bronze-self-improver.svg", false, "Self Improver", 75, 0 },
                    { 50, "Habits", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete the same type of task 7 days in a row", 2, null, "/icons/achievements/bronze-habit-builder.svg", false, "Habit Builder", 80, 0 },
                    { 51, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 tasks", 2, null, "/icons/achievements/silver-task-warrior.svg", false, "Task Warrior", 150, 0 },
                    { 52, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 100 tasks", 3, null, "/icons/achievements/silver-productive.svg", false, "Productive", 250, 0 },
                    { 53, "Intensity", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 25 tasks in one week", 3, null, "/icons/achievements/silver-task-machine.svg", false, "Task Machine", 200, 0 },
                    { 54, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 10 tasks in under 5 minutes each", 2, null, "/icons/achievements/silver-lightning-fast.svg", false, "Lightning Fast", 150, 0 },
                    { 55, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 tasks within 30 minutes", 3, null, "/icons/achievements/silver-speed-demon.svg", false, "Speed Demon", 120, 0 },
                    { 56, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 15 tasks in 2 hours", 3, null, "/icons/achievements/silver-rapid-fire.svg", false, "Rapid Fire", 180, 0 },
                    { 57, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain a 14-day streak", 2, null, "/icons/achievements/silver-flame-keeper.svg", false, "Flame Keeper", 200, 0 },
                    { 58, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete tasks every day for 21 days", 3, null, "/icons/achievements/silver-dedicated.svg", false, "Dedicated", 300, 0 },
                    { 59, "Habits", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete morning tasks for 14 days straight", 3, null, "/icons/achievements/silver-morning-champion.svg", false, "Morning Champion", 250, 0 },
                    { 60, "Time Management", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete tasks on time for 10 consecutive days", 2, null, "/icons/achievements/silver-time-master.svg", false, "Time Master", 200, 0 },
                    { 61, "Punctuality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 tasks before their due date", 3, null, "/icons/achievements/silver-punctuality-expert.svg", false, "Punctuality Expert", 300, 0 },
                    { 62, "Time Management", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 25 tasks before 8 AM", 3, null, "/icons/achievements/silver-early-bird-master.svg", false, "Early Bird Master", 250, 0 },
                    { 63, "Collaboration", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 25 family tasks", 2, null, "/icons/achievements/silver-team-player.svg", false, "Team Player", 200, 0 },
                    { 64, "Collaboration", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Help family members complete 15 tasks", 2, null, "/icons/achievements/silver-family-hero.svg", false, "Family Hero", 180, 0 },
                    { 65, "Social", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Organize 10 family events", 3, null, "/icons/achievements/silver-event-master.svg", false, "Event Master", 300, 0 },
                    { 66, "Social", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Invite 5 people to join families", 3, null, "/icons/achievements/silver-community-builder.svg", false, "Community Builder", 250, 0 },
                    { 67, "Quality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 25 tasks with perfect quality", 3, null, "/icons/achievements/silver-quality-control.svg", false, "Quality Control", 300, 0 },
                    { 68, "Documentation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Add detailed notes to 25 tasks", 2, null, "/icons/achievements/silver-attention-detail.svg", false, "Attention to Detail", 200, 0 },
                    { 69, "Quality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Review and update 20 completed tasks", 2, null, "/icons/achievements/silver-reviewer.svg", false, "Reviewer", 150, 0 },
                    { 70, "Innovation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 25 unique tasks", 2, null, "/icons/achievements/silver-innovator.svg", false, "Innovator", 200, 0 },
                    { 71, "Efficiency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 10 task templates", 2, null, "/icons/achievements/silver-template-creator.svg", false, "Template Creator", 180, 0 },
                    { 72, "Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 15 categories and organize tasks", 2, null, "/icons/achievements/silver-system-builder.svg", false, "System Builder", 220, 0 },
                    { 73, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 25 focus sessions", 2, null, "/icons/achievements/silver-focus-master.svg", false, "Focus Master", 250, 0 },
                    { 74, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 5 focus sessions over 2 hours each", 3, null, "/icons/achievements/silver-deep-work.svg", false, "Deep Work", 300, 0 },
                    { 75, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 100 tasks during focus sessions", 3, null, "/icons/achievements/silver-concentration-champion.svg", false, "Concentration Champion", 400, 0 },
                    { 76, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 75 tasks in spring", 3, null, "/icons/achievements/silver-spring-productivity.svg", false, "Spring Productivity", 300, 0 },
                    { 77, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain streaks throughout summer", 3, null, "/icons/achievements/silver-summer-consistency.svg", false, "Summer Consistency", 350, 0 },
                    { 78, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Reorganize and complete 50 tasks in fall", 2, null, "/icons/achievements/silver-autumn-organizer.svg", false, "Autumn Organizer", 275, 0 },
                    { 79, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Stay productive throughout winter", 4, null, "/icons/achievements/silver-winter-warrior.svg", false, "Winter Warrior", 400, 0 },
                    { 80, "Priority", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 high-priority tasks", 2, null, "/icons/achievements/silver-priority-master.svg", false, "Priority Master", 300, 0 },
                    { 81, "Strategy", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Balance tasks across all priority levels", 2, null, "/icons/achievements/silver-strategic-thinker.svg", false, "Strategic Thinker", 250, 0 },
                    { 82, "Priority", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 20 critical priority tasks", 3, null, "/icons/achievements/silver-crisis-manager.svg", false, "Crisis Manager", 400, 0 },
                    { 83, "Automation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Set up 20 recurring tasks", 2, null, "/icons/achievements/silver-automation-expert.svg", false, "Automation Expert", 300, 0 },
                    { 84, "Efficiency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use templates for 50 task creations", 2, null, "/icons/achievements/silver-efficiency-master.svg", false, "Efficiency Master", 250, 0 },
                    { 85, "Efficiency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Save 10 hours using automation features", 4, null, "/icons/achievements/silver-time-saver.svg", false, "Time Saver", 500, 0 },
                    { 86, "Milestones", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use the app for 90 consecutive days", 3, null, "/icons/achievements/silver-regular-user.svg", false, "Regular User", 450, 0 },
                    { 87, "Milestones", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Use the app for 6 months total", 4, null, "/icons/achievements/silver-dedicated-user.svg", false, "Dedicated User", 600, 0 },
                    { 88, "Gamification", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Earn 1000 total points", 2, null, "/icons/achievements/silver-point-accumulator.svg", false, "Point Accumulator", 0, 0 },
                    { 89, "Challenges", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 10 different challenges", 2, null, "/icons/achievements/silver-challenge-warrior.svg", false, "Challenge Warrior", 300, 0 },
                    { 90, "Competition", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Finish in top 3 of family leaderboard 5 times", 3, null, "/icons/achievements/silver-competitor.svg", false, "Competitor", 350, 0 },
                    { 91, "Competition", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Improve leaderboard position 10 times", 2, null, "/icons/achievements/silver-leaderboard-climber.svg", false, "Leaderboard Climber", 250, 0 },
                    { 92, "Development", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 learning/development tasks", 2, null, "/icons/achievements/silver-growth-mindset.svg", false, "Growth Mindset", 300, 0 },
                    { 93, "Versatility", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete tasks in 10 different categories", 2, null, "/icons/achievements/silver-skill-builder.svg", false, "Skill Builder", 250, 0 },
                    { 94, "Habits", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain 5 different habit streaks simultaneously", 4, null, "/icons/achievements/silver-habit-master.svg", false, "Habit Master", 400, 0 },
                    { 95, "Communication", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Add comments to 50 family tasks", 2, null, "/icons/achievements/silver-communicator.svg", false, "Communicator", 200, 0 },
                    { 96, "Planning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create tasks with comprehensive descriptions", 2, null, "/icons/achievements/silver-detailed-planner.svg", false, "Detailed Planner", 150, 0 },
                    { 97, "Documentation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain detailed notes for 3 months", 3, null, "/icons/achievements/silver-knowledge-keeper.svg", false, "Knowledge Keeper", 300, 0 },
                    { 98, "Visualization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create and maintain 10 active boards", 2, null, "/icons/achievements/silver-board-master.svg", false, "Board Master", 250, 0 },
                    { 99, "Visualization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Organize 500 tasks using boards", 3, null, "/icons/achievements/silver-visual-thinker.svg", false, "Visual Thinker", 300, 0 },
                    { 100, "Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Design the perfect productivity workspace", 3, null, "/icons/achievements/silver-workspace-architect.svg", false, "Workspace Architect", 350, 0 },
                    { 101, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 200 tasks", 3, null, "/icons/achievements/gold-champion.svg", false, "Champion", 400, 0 },
                    { 102, "Progress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 300 tasks", 4, null, "/icons/achievements/gold-task-master.svg", false, "Task Master", 600, 0 },
                    { 103, "Intensity", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 tasks in one week", 4, null, "/icons/achievements/gold-productivity-beast.svg", false, "Productivity Beast", 500, 0 },
                    { 104, "Endurance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 100 tasks in one month", 4, null, "/icons/achievements/gold-marathon-runner.svg", false, "Marathon Runner", 750, 0 },
                    { 105, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete tasks every day for 50 days", 4, null, "/icons/achievements/gold-unstoppable.svg", false, "Unstoppable", 800, 0 },
                    { 106, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 20 tasks in under 5 minutes each", 3, null, "/icons/achievements/gold-rocket-speed.svg", false, "Rocket Speed", 400, 0 },
                    { 107, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 30 tasks in 1 hour", 4, null, "/icons/achievements/gold-speed-light.svg", false, "Speed of Light", 600, 0 },
                    { 108, "Speed", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 100 tasks in 4 hours", 4, null, "/icons/achievements/gold-time-warp.svg", false, "Time Warp", 800, 0 },
                    { 109, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain a 30-day streak", 3, null, "/icons/achievements/gold-campfire.svg", false, "Campfire", 600, 0 },
                    { 110, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain a 60-day streak", 4, null, "/icons/achievements/gold-bonfire.svg", false, "Bonfire", 900, 0 },
                    { 111, "Consistency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain a 90-day streak", 4, null, "/icons/achievements/gold-wildfire.svg", false, "Wildfire", 1200, 0 },
                    { 112, "Quality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 tasks with perfect quality", 3, null, "/icons/achievements/gold-perfectionist.svg", false, "Perfectionist", 500, 0 },
                    { 113, "Quality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain perfect quality for 30 days", 4, null, "/icons/achievements/gold-quality-assurance.svg", false, "Quality Assurance", 700, 0 },
                    { 114, "Quality", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Perfect 100 tasks with detailed notes", 4, null, "/icons/achievements/gold-craftsman.svg", false, "Craftsman", 800, 0 },
                    { 115, "Leadership", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Lead family productivity for 14 days", 3, null, "/icons/achievements/gold-leader.svg", false, "Leader", 600, 0 },
                    { 116, "Leadership", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Help 10 family members achieve streaks", 4, null, "/icons/achievements/gold-mentor.svg", false, "Mentor", 700, 0 },
                    { 117, "Community", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Build a family of 20+ active members", 4, null, "/icons/achievements/gold-community-champion.svg", false, "Community Champion", 1000, 0 },
                    { 118, "Creation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 100 unique tasks", 3, null, "/icons/achievements/gold-master-creator.svg", false, "Master Creator", 500, 0 },
                    { 119, "Organization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Design comprehensive productivity systems", 4, null, "/icons/achievements/gold-system-architect.svg", false, "System Architect", 800, 0 },
                    { 120, "Efficiency", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create 50 helpful templates", 3, null, "/icons/achievements/gold-template-wizard.svg", false, "Template Wizard", 600, 0 },
                    { 121, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 100 focus sessions", 3, null, "/icons/achievements/gold-deep-focus.svg", false, "Deep Focus", 700, 0 },
                    { 122, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 hours of focus time", 4, null, "/icons/achievements/gold-meditation-master.svg", false, "Meditation Master", 900, 0 },
                    { 123, "Focus", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain focus sessions for 60 days", 4, null, "/icons/achievements/gold-zen-garden.svg", false, "Zen Garden", 1000, 0 },
                    { 124, "Time Mastery", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Master time across all dimensions", 4, null, "/icons/achievements/gold-time-lord.svg", false, "Time Lord", 3000, 0 },
                    { 125, "Time Mastery", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Control time itself", 4, null, "/icons/achievements/gold-chronos.svg", false, "Chronos", 5000, 0 },
                    { 126, "Time Mastery", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Rule over all time and space", 4, null, "/icons/achievements/gold-temporal-sovereign.svg", false, "Temporal Sovereign", 8000, 0 },
                    { 127, "Competition", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Win 50 competitions", 4, null, "/icons/achievements/gold-champion-champions.svg", false, "Champion of Champions", 2500, 0 },
                    { 128, "Dominance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Never lose a competition for a year", 4, null, "/icons/achievements/gold-undefeated.svg", false, "Undefeated", 4000, 0 },
                    { 129, "Dominance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Achieve impossible victory records", 4, null, "/icons/achievements/gold-god-mode.svg", false, "God Mode", 7500, 0 },
                    { 130, "Teaching", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Teach 100 people productivity", 4, null, "/icons/achievements/gold-productivity-sensei.svg", false, "Productivity Sensei", 3000, 0 },
                    { 131, "Wisdom", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Preserve and share ancient wisdom", 4, null, "/icons/achievements/gold-wisdom-keeper.svg", false, "Wisdom Keeper", 4500, 0 },
                    { 132, "Enlightenment", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Achieve productivity enlightenment", 4, null, "/icons/achievements/gold-enlightened-one.svg", false, "Enlightened One", 7500, 0 },
                    { 133, "Legend", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 500 tasks", 4, null, "/icons/achievements/platinum-legend.svg", false, "Legend", 1500, 0 },
                    { 134, "Legend", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 750 tasks", 4, null, "/icons/achievements/platinum-myth.svg", false, "Myth", 2000, 0 },
                    { 135, "Legend", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 1000 tasks", 4, null, "/icons/achievements/platinum-epic.svg", false, "Epic", 3000, 0 },
                    { 136, "Speed Mastery", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Complete 50 tasks in a single day", 4, null, "/icons/achievements/platinum-speed-demon.svg", false, "Speed Demon", 2000, 0 },
                    { 137, "Speed Mastery", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain extreme speed for 30 days", 4, null, "/icons/achievements/platinum-velocity.svg", false, "Velocity", 2500, 0 },
                    { 138, "Speed Mastery", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Achieve impossible speed records", 4, null, "/icons/achievements/platinum-hypersonic.svg", false, "Hypersonic", 3000, 0 },
                    { 139, "Endurance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain a 180-day streak", 4, null, "/icons/achievements/platinum-eternal-flame.svg", false, "Eternal Flame", 3000, 0 },
                    { 140, "Endurance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Maintain a 365-day streak", 4, null, "/icons/achievements/platinum-immortal.svg", false, "Immortal", 5000, 0 },
                    { 141, "Endurance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Never miss a day for 2 years", 4, null, "/icons/achievements/platinum-unbreakable.svg", false, "Unbreakable", 10000, 0 },
                    { 142, "Excellence", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Perfect quality in 200 tasks", 4, null, "/icons/achievements/platinum-perfectionist.svg", false, "Platinum Perfectionist", 2000, 0 },
                    { 143, "Excellence", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Perfect everything you touch", 4, null, "/icons/achievements/platinum-flawless.svg", false, "Flawless", 3000, 0 },
                    { 144, "Excellence", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Transcend human quality limits", 4, null, "/icons/achievements/platinum-divine-quality.svg", false, "Divine Quality", 5000, 0 },
                    { 145, "Empire", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Lead 1000 family members", 4, null, "/icons/achievements/platinum-family-emperor.svg", false, "Family Emperor", 15000, 0 },
                    { 146, "Global", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Impact productivity worldwide", 4, null, "/icons/achievements/platinum-global-influence.svg", false, "Global Influence", 25000, 0 },
                    { 147, "Legacy", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create new productive civilizations", 4, null, "/icons/achievements/platinum-civilization-builder.svg", false, "Civilization Builder", 50000, 0 },
                    { 148, "Creation God", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Create productivity universes", 4, null, "/icons/achievements/platinum-universe-creator.svg", false, "Universe Creator", 20000, 0 },
                    { 149, "Divine Creation", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Design new realities", 4, null, "/icons/achievements/platinum-reality-architect.svg", false, "Reality Architect", 40000, 0 },
                    { 150, "Omnipotence", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Control infinite universes", 4, null, "/icons/achievements/platinum-multiverse-master.svg", false, "Multiverse Master", 100000, 0 },
                    { 151, "Transcendence", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Transcend all known limits", 4, null, "/icons/achievements/onyx-transcendent.svg", false, "Transcendent", 100000, 0 },
                    { 152, "Origin", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Become the source of all productivity", 4, null, "/icons/achievements/onyx-source-code.svg", false, "Source Code", 250000, 0 },
                    { 153, "Unity", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Achieve unity with productivity itself", 4, null, "/icons/achievements/onyx-one.svg", false, "One", 500000, 0 },
                    { 154, "Transcendence", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Walk between realities", 4, null, "/icons/achievements/onyx-void-walker.svg", false, "Void Walker", 750000, 0 },
                    { 155, "Absolute", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", "Become the absolute form of productivity", 4, null, "/icons/achievements/onyx-absolute.svg", false, "The Absolute", 1000000, 0 }
                });

            migrationBuilder.InsertData(
                table: "Badges",
                columns: new[] { "Id", "Category", "ColorScheme", "CreatedAt", "Criteria", "Description", "DisplayOrder", "IconUrl", "IsActive", "IsSpecial", "Name", "PointValue", "PointsRequired", "Rarity", "Tier" },
                values: new object[,]
                {
                    { 1, "Character", "red-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 25 high priority tasks", "Complete 25 tasks with high priority", 1, "/icons/badges/character-warrior.svg", true, false, "Warrior", 100, 0, "Common", "bronze" },
                    { 2, "Character", "blue-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 20 learning tasks", "Complete 20 learning or research tasks", 2, "/icons/badges/character-mage.svg", true, false, "Mage", 100, 0, "Common", "bronze" },
                    { 3, "Character", "green-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 15 tasks early", "Complete 15 tasks ahead of schedule", 3, "/icons/badges/character-rogue.svg", true, false, "Rogue", 100, 0, "Common", "bronze" },
                    { 4, "Character", "gold-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 10 family tasks", "Help family members with 10 tasks", 4, "/icons/badges/character-paladin.svg", true, false, "Paladin", 100, 0, "Common", "bronze" },
                    { 5, "Character", "brown-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 30 tasks on time", "Complete 30 tasks with precision timing", 5, "/icons/badges/character-archer.svg", true, false, "Archer", 100, 0, "Common", "bronze" },
                    { 6, "Character", "black-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 20 tasks before 7 AM or after 11 PM", "Complete 20 tasks in stealth mode (early morning/late night)", 6, "/icons/badges/character-assassin.svg", true, false, "Assassin", 150, 0, "Rare", "bronze" },
                    { 7, "Character", "red-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 100 high priority tasks", "Complete 100 high priority tasks", 7, "/icons/badges/character-warrior-silver.svg", true, false, "Elite Warrior", 250, 0, "Rare", "silver" },
                    { 8, "Character", "blue-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 75 learning tasks", "Complete 75 learning tasks", 8, "/icons/badges/character-mage-silver.svg", true, false, "Archmage", 250, 0, "Rare", "silver" },
                    { 9, "Character", "green-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 50 tasks early", "Complete 50 tasks ahead of schedule", 9, "/icons/badges/character-rogue-silver.svg", true, false, "Master Thief", 250, 0, "Rare", "silver" },
                    { 10, "Character", "gold-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 50 family tasks", "Help family members with 50 tasks", 10, "/icons/badges/character-paladin-silver.svg", true, false, "Crusader", 250, 0, "Rare", "silver" },
                    { 11, "Character", "red-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 500 high priority tasks", "Complete 500 high priority tasks", 11, "/icons/badges/character-warrior-gold.svg", true, false, "Legendary Warrior", 500, 0, "Epic", "gold" },
                    { 12, "Character", "blue-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 300 learning tasks", "Complete 300 learning tasks", 12, "/icons/badges/character-mage-gold.svg", true, false, "Grand Wizard", 500, 0, "Epic", "gold" },
                    { 13, "Character", "green-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 200 tasks early", "Complete 200 tasks ahead of schedule", 13, "/icons/badges/character-rogue-gold.svg", true, false, "Shadow Master", 500, 0, "Epic", "gold" },
                    { 14, "Character", "gold-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 200 family tasks", "Help family members with 200 tasks", 14, "/icons/badges/character-paladin-gold.svg", true, false, "Divine Champion", 500, 0, "Epic", "gold" },
                    { 15, "Character", "brown-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 400 tasks on time", "Complete 400 tasks with perfect timing", 15, "/icons/badges/character-archer-gold.svg", true, false, "Master Archer", 500, 0, "Epic", "gold" },
                    { 16, "Character", "black-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 150 tasks before 7 AM or after 11 PM", "Complete 150 stealth tasks", 16, "/icons/badges/character-assassin-gold.svg", true, false, "Night Emperor", 750, 0, "Legendary", "gold" },
                    { 17, "Streak", "orange-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "7 day completion streak", "Maintain a 7-day task completion streak", 17, "/icons/badges/streak-fire-starter.svg", true, false, "Fire Starter", 100, 0, "Common", "bronze" },
                    { 18, "Streak", "orange-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "14 day completion streak", "Maintain a 14-day streak", 18, "/icons/badges/streak-flame-keeper.svg", true, false, "Flame Keeper", 150, 0, "Common", "bronze" },
                    { 19, "Streak", "orange-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "30 day completion streak", "Maintain a 30-day streak", 19, "/icons/badges/streak-inferno-master.svg", true, false, "Inferno Master", 300, 0, "Rare", "silver" },
                    { 20, "Streak", "orange-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "100 day completion streak", "Maintain a 100-day streak", 20, "/icons/badges/streak-eternal-flame.svg", true, false, "Eternal Flame", 1000, 0, "Epic", "gold" },
                    { 21, "Streak", "phoenix-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete task after 30+ day break", "Return to complete tasks after a 30+ day break", 21, "/icons/badges/streak-phoenix-rising.svg", true, false, "Phoenix Rising", 200, 0, "Rare", "silver" },
                    { 22, "Speed", "silver-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 10 tasks under 5 minutes each", "Complete 10 tasks in under 5 minutes each", 22, "/icons/badges/speed-quicksilver.svg", true, false, "Quicksilver", 75, 0, "Common", "bronze" },
                    { 23, "Speed", "yellow-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 25 tasks under 10 minutes each", "Complete 25 tasks in under 10 minutes each", 23, "/icons/badges/speed-lightning.svg", true, false, "Lightning", 200, 0, "Rare", "silver" },
                    { 24, "Speed", "red-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 50 tasks under 15 minutes each", "Complete 50 tasks in under 15 minutes each", 24, "/icons/badges/speed-demon.svg", true, false, "Speed Demon", 400, 0, "Epic", "gold" },
                    { 25, "Speed", "time-platinum", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 100 tasks ahead of estimated time", "Complete 100 tasks ahead of estimated time", 25, "/icons/badges/speed-time-lord.svg", true, false, "Time Lord", 1000, 0, "Legendary", "platinum" },
                    { 26, "Social", "green-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 10 family tasks", "Complete 10 family tasks", 26, "/icons/badges/social-team-player.svg", true, false, "Team Player", 100, 0, "Common", "bronze" },
                    { 27, "Social", "green-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 50 family tasks", "Complete 50 family tasks", 27, "/icons/badges/social-family-hero.svg", true, false, "Family Hero", 300, 0, "Rare", "silver" },
                    { 28, "Social", "green-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 150 family tasks", "Complete 150 family tasks", 28, "/icons/badges/social-unity-champion.svg", true, false, "Unity Champion", 750, 0, "Epic", "gold" },
                    { 29, "Social", "party-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create and complete 5 family events", "Create and complete 5 family events", 29, "/icons/badges/social-event-master.svg", true, false, "Event Master", 250, 0, "Rare", "silver" },
                    { 30, "Milestone", "bronze-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 100 total tasks", "Complete 100 total tasks", 30, "/icons/badges/milestone-centurion.svg", true, false, "Centurion", 200, 0, "Common", "bronze" },
                    { 31, "Milestone", "bronze-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 500 total tasks", "Complete 500 total tasks", 31, "/icons/badges/milestone-gladiator.svg", true, false, "Gladiator", 500, 0, "Rare", "silver" },
                    { 32, "Milestone", "bronze-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 1000 total tasks", "Complete 1000 total tasks", 32, "/icons/badges/milestone-champion.svg", true, false, "Champion", 1000, 0, "Epic", "gold" },
                    { 33, "Milestone", "bronze-platinum", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 2500 total tasks", "Complete 2500 total tasks", 33, "/icons/badges/milestone-legend.svg", true, false, "Legend", 2500, 0, "Legendary", "platinum" },
                    { 34, "Milestone", "rainbow-diamond", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 5000 total tasks", "Complete 5000 total tasks", 34, "/icons/badges/milestone-immortal.svg", true, false, "Immortal", 5000, 0, "Legendary", "diamond" },
                    { 35, "Milestone", "cosmic-onyx", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 10000 total tasks", "Complete 10000 total tasks", 35, "/icons/badges/milestone-transcendent.svg", true, false, "Transcendent", 10000, 0, "Legendary", "onyx" },
                    { 36, "Special", "red-bronze", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete first task", "Complete your very first task", 36, "/icons/badges/special-first-blood.svg", true, true, "First Blood", 50, 0, "Common", "bronze" },
                    { 37, "Special", "party-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete task on birthday", "Complete tasks on your birthday", 37, "/icons/badges/special-birthday-bash.svg", true, true, "Birthday Bash", 500, 0, "Rare", "gold" },
                    { 38, "Special", "fireworks-gold", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 31 tasks in January", "Complete 31 tasks in January", 38, "/icons/badges/special-new-year.svg", true, true, "New Year's Resolution", 365, 0, "Epic", "gold" },
                    { 39, "Special", "love-silver", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete relationship tasks in February", "Complete romantic/relationship tasks in February", 39, "/icons/badges/special-valentine.svg", true, true, "Valentine's Helper", 200, 0, "Rare", "silver" }
                });

            migrationBuilder.InsertData(
                table: "Challenges",
                columns: new[] { "Id", "ActivityType", "AdditionalCriteria", "CreatedAt", "Description", "Difficulty", "EndDate", "IsActive", "Name", "PointReward", "PointsRequired", "RewardBadgeId", "StartDate", "TargetCount", "TargetEntityId" },
                values: new object[,]
                {
                    { 1, "DailyCompletion", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 5 tasks in a single day", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Daily Dynamo", 50, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, null },
                    { 2, "SpeedCompletion", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 3 tasks within 30 minutes", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Speed Racer", 75, 100, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, null },
                    { 3, "EarlyCompletion", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 2 tasks before 9 AM", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Early Bird Special", 60, 50, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, null },
                    { 4, "LateCompletion", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 3 tasks after 10 PM", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Night Owl Challenge", 55, 50, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, null },
                    { 5, "PerfectQuality", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete all tasks with perfect quality today", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Perfect Day", 100, 200, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, null },
                    { 6, "CategoryDiversity", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete tasks in 3 different categories today", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Category Explorer", 70, 75, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, null },
                    { 7, "FocusSessions", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 2 focus sessions today", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Focus Warrior", 80, 100, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, null },
                    { 8, "HighPriority", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 3 high-priority tasks today", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Priority Master", 90, 150, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, null },
                    { 9, "FamilyTasks", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 3 family tasks today", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Social Butterfly", 85, 100, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, null },
                    { 10, "SuperSpeed", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 10 tasks in under 2 hours", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Lightning Fast", 150, 300, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, null },
                    { 11, "Organization", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create 2 new categories and organize tasks", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Organizer Supreme", 95, 75, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, null },
                    { 12, "TemplateCreation", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create 1 task template today", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Template Creator", 65, 50, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, null },
                    { 13, "Documentation", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Add detailed notes to 5 tasks today", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Note Taker", 75, 75, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, null },
                    { 14, "BoardUsage", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Organize 10 tasks using boards today", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Board Master", 80, 100, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, null },
                    { 15, "ReminderSetting", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Set 5 reminders for future tasks", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Reminder Pro", 60, 50, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, null },
                    { 16, "WeeklyCompletion", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 25 tasks in a week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Weekly Warrior", 200, 500, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 25, null },
                    { 17, "ConsistentDaily", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete at least 1 task every day for a week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Consistency King", 250, 300, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 7, null },
                    { 18, "WeeklySpeed", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 50 tasks in under 5 minutes each this week", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Speed Week", 400, 1000, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 50, null },
                    { 19, "WeeklyPerfection", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete all tasks with perfect quality for a week", 5, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Perfect Week", 500, 1500, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 7, null },
                    { 20, "WeeklyLeader", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lead family leaderboard for a week", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Family Champion", 350, 800, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 7, null },
                    { 21, "WeeklyFocus", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 20 focus sessions this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Focus Master", 300, 600, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 20, null },
                    { 22, "CategoryMastery", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete tasks in 10 different categories this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Category Conqueror", 275, 400, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, null },
                    { 23, "WeeklyPriority", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 20 high-priority tasks this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Priority Pro", 325, 500, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 20, null },
                    { 24, "WeeklyEarly", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 15 tasks before 9 AM this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Early Bird Week", 280, 350, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 15, null },
                    { 25, "WeeklyCollaboration", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Help family complete 15 tasks this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Collaboration Master", 290, 400, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 15, null },
                    { 26, "WeeklyTemplates", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create 5 task templates this week", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Template Week", 220, 250, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, null },
                    { 27, "WeeklyOrganization", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create 10 categories and organize perfectly", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Organization Week", 240, 300, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, null },
                    { 28, "WeeklyBoards", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create and organize 5 boards this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Board Architect", 260, 350, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, null },
                    { 29, "WeeklyDocumentation", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Add comprehensive notes to 25 tasks", 2, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Documentation Week", 230, 200, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 25, null },
                    { 30, "WeeklyAutomation", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Set up 10 recurring tasks this week", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Automation Week", 270, 400, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, null },
                    { 31, "MonthlyCompletion", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 100 tasks in a month", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Monthly Master", 500, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 100, null },
                    { 32, "StreakMaintenance", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Maintain a 30-day streak", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Streak Legend", 750, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 30, null },
                    { 33, "MonthlyPerfection", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Perfect quality for entire month", 5, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Monthly Perfectionist", 1000, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 30, null },
                    { 34, "MonthlySpeed", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 200 tasks in under 5 minutes each", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Speed Month", 800, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 200, null },
                    { 35, "MonthlyDominance", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lead family for entire month", 5, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Family Emperor", 900, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 30, null },
                    { 36, "MonthlyFocus", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Complete 100 focus sessions in a month", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Focus Transcendence", 700, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 100, null },
                    { 37, "MonthlySystemBuilding", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create comprehensive productivity system", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "System Architect", 600, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, null },
                    { 38, "MonthlyInnovation", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Create 50 unique tasks and templates", 3, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Innovation Master", 650, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 50, null },
                    { 39, "MonthlyCommunity", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Help 50 family members achieve their goals", 4, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Community Builder", 850, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 50, null },
                    { 40, "AchievementUnlock", null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock 20 different achievements", 5, new DateTime(2025, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), true, "Ultimate Achiever", 1000, 0, null, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 20, null }
                });

            migrationBuilder.InsertData(
                table: "Rewards",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "ExpirationDate", "IconPath", "IsActive", "MinimumLevel", "Name", "PointCost", "Quantity" },
                values: new object[,]
                {
                    { 1, "Customization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock avatar customization options", null, "/icons/rewards/custom-avatar.svg", true, 2, "Custom Avatar", 100, null },
                    { 2, "Customization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock premium theme color schemes", null, "/icons/rewards/theme-colors.svg", true, 3, "Theme Colors", 150, null },
                    { 3, "Customization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock beautiful profile backgrounds", null, "/icons/rewards/profile-backgrounds.svg", true, 4, "Profile Backgrounds", 200, null },
                    { 4, "Customization", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock premium typography options", null, "/icons/rewards/custom-fonts.svg", true, 5, "Custom Fonts", 250, null },
                    { 5, "Premium", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock animated avatar options", null, "/icons/rewards/animated-avatars.svg", true, 10, "Animated Avatars", 500, null },
                    { 6, "Premium", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Add magical particle effects", null, "/icons/rewards/particle-effects.svg", true, 15, "Particle Effects", 800, null },
                    { 7, "Premium", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Themes that change with progress", null, "/icons/rewards/dynamic-themes.svg", true, 20, "Dynamic Themes", 1000, null },
                    { 8, "Audio", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Personalized audio feedback", null, "/icons/rewards/custom-sounds.svg", true, 12, "Custom Sound Effects", 600, null },
                    { 9, "Audio", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Epic completion celebrations", null, "/icons/rewards/victory-fanfares.svg", true, 15, "Victory Fanfares", 750, null },
                    { 10, "Audio", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Focus-enhancing background audio", null, "/icons/rewards/ambient-sounds.svg", true, 8, "Ambient Soundscapes", 400, null },
                    { 11, "Elite", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Futuristic holographic interface", null, "/icons/rewards/holographic-effects.svg", true, 30, "Holographic Effects", 2000, null },
                    { 12, "Legendary", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bend space and time in your interface", null, "/icons/rewards/reality-distortion.svg", true, 50, "Reality Distortion", 5000, null },
                    { 13, "Mythic", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Multiple reality interface overlay", null, "/icons/rewards/quantum-interface.svg", true, 75, "Quantum Interface", 10000, null },
                    { 14, "Cosmic", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Universe-spanning visual themes", null, "/icons/rewards/cosmic-themes.svg", true, 100, "Cosmic Themes", 15000, null },
                    { 15, "Transcendent", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Beyond physical avatar forms", null, "/icons/rewards/avatar-transcendence.svg", true, 150, "Avatar Transcendence", 25000, null },
                    { 16, "Character", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock the Warrior character class", null, "/icons/rewards/warrior-unlock.svg", true, 5, "Warrior Class", 250, null },
                    { 17, "Character", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock the Mage character class", null, "/icons/rewards/mage-unlock.svg", true, 8, "Mage Class", 400, null },
                    { 18, "Character", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock the Guardian character class", null, "/icons/rewards/guardian-unlock.svg", true, 12, "Guardian Class", 600, null },
                    { 19, "Character", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock the Speedster character class", null, "/icons/rewards/speedster-unlock.svg", true, 15, "Speedster Class", 800, null },
                    { 20, "Character", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Unlock the Healer character class", null, "/icons/rewards/healer-unlock.svg", true, 18, "Healer Class", 1000, null },
                    { 21, "Boost", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Double points for next 5 high-priority tasks", null, "/icons/rewards/priority-boost.svg", true, 6, "Priority Boost", 300, 10 },
                    { 22, "Boost", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Protect your streak for 3 days", null, "/icons/rewards/streak-shield.svg", true, 10, "Streak Shield", 500, 5 },
                    { 23, "Boost", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Double XP for 24 hours", null, "/icons/rewards/xp-multiplier.svg", true, 8, "XP Multiplier", 400, 10 },
                    { 24, "Boost", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Enhanced focus session benefits", null, "/icons/rewards/focus-enhancer.svg", true, 7, "Focus Enhancer", 350, 15 },
                    { 25, "Boost", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bonus points for fast completion", null, "/icons/rewards/speed-boost.svg", true, 5, "Speed Boost", 250, 20 },
                    { 26, "Collectible", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rare digital trophy for your collection", null, "/icons/rewards/golden-trophy.svg", true, 30, "Golden Trophy", 2000, 1 },
                    { 27, "Collectible", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mystical crystal containing ancient wisdom", null, "/icons/rewards/crystal-orb.svg", true, 35, "Crystal Orb", 3000, 1 },
                    { 28, "Collectible", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Feather from the legendary Phoenix", null, "/icons/rewards/phoenix-feather.svg", true, 50, "Phoenix Feather", 5000, 1 },
                    { 29, "Collectible", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Scale from an ancient dragon", null, "/icons/rewards/dragon-scale.svg", true, 60, "Dragon Scale", 7500, 1 },
                    { 30, "Cosmic", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Stardust from the birth of universe", null, "/icons/rewards/cosmic-dust.svg", true, 75, "Cosmic Dust", 10000, 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Achievements_FamilyId",
                table: "Achievements",
                column: "FamilyId");

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
                name: "IX_ChallengeProgresses_UserId",
                table: "ChallengeProgresses",
                column: "UserId");

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
                name: "IX_FamilyActivities_ActorId",
                table: "FamilyActivities",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyActivities_FamilyId",
                table: "FamilyActivities",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyActivities_TargetId",
                table: "FamilyActivities",
                column: "TargetId");

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
                name: "IX_NotificationPreferences_FamilyId",
                table: "NotificationPreferences",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationPreferences_UserId",
                table: "NotificationPreferences",
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
                name: "IX_SecurityAuditLogs_UserId",
                table: "SecurityAuditLogs",
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
                name: "IX_Users_Email_Unique",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PrimaryFamilyId",
                table: "Users",
                column: "PrimaryFamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username_Unique",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Achievements_Families_FamilyId",
                table: "Achievements",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id");

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
                name: "FK_ChallengeProgresses_Users_UserId",
                table: "ChallengeProgresses",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_Users_Families_PrimaryFamilyId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "BehavioralAnalytics");

            migrationBuilder.DropTable(
                name: "ChallengeProgresses");

            migrationBuilder.DropTable(
                name: "ChecklistItems");

            migrationBuilder.DropTable(
                name: "ChecklistTemplateItems");

            migrationBuilder.DropTable(
                name: "Distractions");

            migrationBuilder.DropTable(
                name: "FailedLoginAttempts");

            migrationBuilder.DropTable(
                name: "FamilyAchievementMembers");

            migrationBuilder.DropTable(
                name: "FamilyActivities");

            migrationBuilder.DropTable(
                name: "FamilyEventAttendees");

            migrationBuilder.DropTable(
                name: "FamilyEventReminders");

            migrationBuilder.DropTable(
                name: "FamilyMemberAvailabilities");

            migrationBuilder.DropTable(
                name: "FamilyRolePermissions");

            migrationBuilder.DropTable(
                name: "GeneralAuditLogs");

            migrationBuilder.DropTable(
                name: "Invitations");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "NotificationPreferences");

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
                name: "SecurityAuditLogs");

            migrationBuilder.DropTable(
                name: "SecurityMetrics");

            migrationBuilder.DropTable(
                name: "SystemHealthMetrics");

            migrationBuilder.DropTable(
                name: "TaskTags");

            migrationBuilder.DropTable(
                name: "ThreatIntelligence");

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
                name: "UserSessions");

            migrationBuilder.DropTable(
                name: "TaskTemplates");

            migrationBuilder.DropTable(
                name: "FocusSessions");

            migrationBuilder.DropTable(
                name: "FamilyAchievements");

            migrationBuilder.DropTable(
                name: "FamilyCalendarEvents");

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
                name: "Families");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
