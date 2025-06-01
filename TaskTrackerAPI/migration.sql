IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Badges] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [IconUrl] nvarchar(255) NOT NULL,
        [Criteria] nvarchar(1000) NOT NULL,
        [Rarity] nvarchar(50) NOT NULL,
        [Tier] nvarchar(50) NOT NULL,
        [PointsRequired] int NOT NULL,
        [PointValue] int NOT NULL,
        [ColorScheme] nvarchar(50) NOT NULL,
        [DisplayOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [IsSpecial] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_Badges] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [BehavioralAnalytics] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Username] nvarchar(100) NOT NULL,
        [IPAddress] nvarchar(45) NOT NULL,
        [UserAgent] nvarchar(500) NOT NULL,
        [ActionType] nvarchar(100) NOT NULL,
        [ResourceAccessed] nvarchar(200) NOT NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [SessionDuration] time NOT NULL,
        [ActionsPerMinute] int NOT NULL,
        [DataVolumeAccessed] int NOT NULL,
        [Country] nvarchar(100) NOT NULL,
        [City] nvarchar(100) NOT NULL,
        [DeviceType] nvarchar(100) NOT NULL,
        [Browser] nvarchar(100) NOT NULL,
        [OperatingSystem] nvarchar(50) NOT NULL,
        [IsAnomalous] bit NOT NULL,
        [AnomalyScore] float NOT NULL,
        [RiskLevel] nvarchar(20) NOT NULL,
        [AnomalyReason] nvarchar(500) NOT NULL,
        [IsNewLocation] bit NOT NULL,
        [IsNewDevice] bit NOT NULL,
        [IsOffHours] bit NOT NULL,
        [IsHighVelocity] bit NOT NULL,
        [DeviationFromBaseline] float NOT NULL,
        [IsOutsideNormalPattern] bit NOT NULL,
        [BehaviorMetadata] nvarchar(1000) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_BehavioralAnalytics] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Challenges] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [StartDate] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [EndDate] datetime2 NULL,
        [PointReward] int NOT NULL,
        [ActivityType] nvarchar(50) NOT NULL,
        [TargetCount] int NOT NULL,
        [TargetEntityId] int NULL,
        [RewardBadgeId] int NULL,
        [AdditionalCriteria] nvarchar(200) NULL,
        [IsActive] bit NOT NULL,
        [Difficulty] int NOT NULL,
        [PointsRequired] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_Challenges] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FailedLoginAttempts] (
        [Id] int NOT NULL IDENTITY,
        [EmailOrUsername] nvarchar(100) NOT NULL,
        [IpAddress] nvarchar(45) NOT NULL,
        [UserAgent] nvarchar(500) NULL,
        [AttemptTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [FailureReason] nvarchar(100) NULL,
        [Country] nvarchar(100) NULL,
        [City] nvarchar(100) NULL,
        [CountryCode] nvarchar(10) NULL,
        [Latitude] float NULL,
        [Longitude] float NULL,
        [IsSuspicious] bit NOT NULL,
        [RiskFactors] nvarchar(200) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FailedLoginAttempts] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyRoles] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [IsDefault] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyRoles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [GeneralAuditLogs] (
        [Id] int NOT NULL IDENTITY,
        [EntityType] nvarchar(50) NOT NULL,
        [EntityId] int NOT NULL,
        [Action] nvarchar(20) NOT NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [Details] nvarchar(500) NULL,
        [IpAddress] nvarchar(50) NULL,
        [UserId] int NULL,
        CONSTRAINT [PK_GeneralAuditLogs] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [PriorityMultipliers] (
        [Id] int NOT NULL IDENTITY,
        [Priority] nvarchar(50) NOT NULL,
        [Multiplier] float NOT NULL,
        CONSTRAINT [PK_PriorityMultipliers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Rewards] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [PointCost] int NOT NULL,
        [MinimumLevel] int NOT NULL,
        [IconPath] nvarchar(250) NULL,
        [IsActive] bit NOT NULL,
        [Quantity] int NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [ExpirationDate] datetime2 NULL,
        CONSTRAINT [PK_Rewards] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [SecurityMetrics] (
        [Id] int NOT NULL IDENTITY,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [MetricType] nvarchar(50) NOT NULL,
        [MetricName] nvarchar(100) NOT NULL,
        [Value] float NOT NULL,
        [Description] nvarchar(500) NULL,
        [Source] nvarchar(100) NULL,
        [Severity] nvarchar(50) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_SecurityMetrics] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [SubscriptionTiers] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NOT NULL,
        [Description] nvarchar(500) NULL,
        [DefaultRateLimit] int NOT NULL,
        [DefaultTimeWindowSeconds] int NOT NULL,
        [DailyApiQuota] int NOT NULL,
        [MaxConcurrentConnections] int NOT NULL,
        [BypassStandardRateLimits] bit NOT NULL,
        [Priority] int NOT NULL,
        [IsSystemTier] bit NOT NULL,
        [MonthlyCost] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_SubscriptionTiers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [SystemHealthMetrics] (
        [Id] int NOT NULL IDENTITY,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [MetricName] nvarchar(50) NOT NULL,
        [Value] float NOT NULL,
        [Unit] nvarchar(20) NULL,
        [Category] nvarchar(50) NULL,
        [Description] nvarchar(500) NULL,
        [IsHealthy] bit NOT NULL,
        [ThresholdWarning] float NULL,
        [ThresholdCritical] float NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_SystemHealthMetrics] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TemplateCategories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NOT NULL,
        [Description] nvarchar(500) NULL,
        [IconName] nvarchar(50) NULL,
        [ColorHex] nvarchar(7) NULL,
        [SortOrder] int NOT NULL,
        [IsSystem] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_TemplateCategories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [ThreatIntelligence] (
        [Id] int NOT NULL IDENTITY,
        [IPAddress] nvarchar(45) NOT NULL,
        [ThreatType] nvarchar(50) NOT NULL,
        [Severity] nvarchar(20) NOT NULL,
        [ThreatSource] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [ConfidenceScore] int NOT NULL,
        [IsActive] bit NOT NULL,
        [FirstSeen] datetime2 NOT NULL,
        [LastSeen] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [Country] nvarchar(100) NOT NULL,
        [City] nvarchar(100) NOT NULL,
        [ISP] nvarchar(100) NOT NULL,
        [ReportCount] int NOT NULL,
        [IsWhitelisted] bit NOT NULL,
        [IsBlacklisted] bit NOT NULL,
        [AdditionalMetadata] nvarchar(1000) NOT NULL,
        CONSTRAINT [PK_ThreatIntelligence] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyRolePermissions] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] int NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyRolePermissions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyRolePermissions_FamilyRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [FamilyRoles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [RateLimitTierConfigs] (
        [Id] int NOT NULL IDENTITY,
        [SubscriptionTierId] int NOT NULL,
        [EndpointPattern] nvarchar(255) NOT NULL,
        [HttpMethod] nvarchar(10) NOT NULL,
        [RateLimit] int NOT NULL,
        [TimeWindowSeconds] int NOT NULL,
        [IsCriticalEndpoint] bit NOT NULL,
        [ExemptSystemAccounts] bit NOT NULL,
        [MatchPriority] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsAdaptive] bit NOT NULL,
        [HighLoadReductionPercent] int NOT NULL,
        CONSTRAINT [PK_RateLimitTierConfigs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RateLimitTierConfigs_SubscriptionTiers_SubscriptionTierId] FOREIGN KEY ([SubscriptionTierId]) REFERENCES [SubscriptionTiers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Achievements] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [PointValue] int NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [Criteria] nvarchar(1000) NOT NULL,
        [IconUrl] nvarchar(255) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsDeleted] bit NOT NULL,
        [Difficulty] int NOT NULL,
        [Scope] int NOT NULL,
        [FamilyId] int NULL,
        CONSTRAINT [PK_Achievements] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [AnalyticsQueries] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [QueryName] nvarchar(100) NOT NULL,
        [QueryType] nvarchar(50) NOT NULL,
        [Parameters] nvarchar(max) NOT NULL,
        [ExecutionTime] float NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_AnalyticsQueries] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Boards] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Template] nvarchar(max) NOT NULL,
        [CustomLayout] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UserId] int NOT NULL,
        CONSTRAINT [PK_Boards] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(50) NOT NULL,
        [Description] nvarchar(max) NULL,
        [UserId] int NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [ChallengeProgresses] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ChallengeId] int NOT NULL,
        [CurrentProgress] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [EnrolledAt] datetime2 NOT NULL,
        [CompletedAt] datetime2 NULL,
        [TasksCompleted] int NOT NULL,
        [PointsEarned] int NOT NULL,
        CONSTRAINT [PK_ChallengeProgresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ChallengeProgresses_Challenges_ChallengeId] FOREIGN KEY ([ChallengeId]) REFERENCES [Challenges] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [ChecklistItems] (
        [Id] int NOT NULL IDENTITY,
        [Text] nvarchar(200) NOT NULL,
        [IsCompleted] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        [TaskId] int NOT NULL,
        [CompletedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_ChecklistItems] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [ChecklistTemplateItems] (
        [Id] int NOT NULL IDENTITY,
        [Text] nvarchar(200) NOT NULL,
        [DisplayOrder] int NOT NULL,
        [TaskTemplateId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_ChecklistTemplateItems] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [DashboardWidgets] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [WidgetType] nvarchar(50) NOT NULL,
        [Position] nvarchar(max) NOT NULL,
        [Configuration] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_DashboardWidgets] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [DataExportRequests] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ExportType] nvarchar(50) NOT NULL,
        [DateRange] nvarchar(max) NOT NULL,
        [Filters] nvarchar(max) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [FilePath] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CompletedAt] datetime2 NULL,
        [ErrorMessage] nvarchar(1000) NULL,
        CONSTRAINT [PK_DataExportRequests] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Distractions] (
        [Id] int NOT NULL IDENTITY,
        [FocusSessionId] int NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_Distractions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Families] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CreatedById] int NOT NULL,
        CONSTRAINT [PK_Families] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyAchievements] (
        [Id] int NOT NULL IDENTITY,
        [FamilyId] int NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [PointValue] int NOT NULL,
        [IconUrl] nvarchar(255) NULL,
        [ProgressCurrent] int NOT NULL,
        [ProgressTarget] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [CompletedAt] datetime2 NULL,
        [Type] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyAchievements] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyAchievements_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Username] nvarchar(50) NOT NULL,
        [Email] nvarchar(500) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Salt] nvarchar(max) NOT NULL,
        [FirstName] nvarchar(250) NULL,
        [LastName] nvarchar(250) NULL,
        [Role] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsActive] bit NOT NULL,
        [Points] int NOT NULL,
        [PrimaryFamilyId] int NULL,
        [AgeGroup] int NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Users_Families_PrimaryFamilyId] FOREIGN KEY ([PrimaryFamilyId]) REFERENCES [Families] ([Id]) ON DELETE SET NULL
    );
    DECLARE @defaultSchema AS sysname;
    SET @defaultSchema = SCHEMA_NAME();
    DECLARE @description AS sql_variant;
    SET @description = N'Encrypted field - PII';
    EXEC sp_addextendedproperty 'MS_Description', @description, 'SCHEMA', @defaultSchema, 'TABLE', N'Users', 'COLUMN', N'Email';
    SET @description = N'Encrypted field - PII';
    EXEC sp_addextendedproperty 'MS_Description', @description, 'SCHEMA', @defaultSchema, 'TABLE', N'Users', 'COLUMN', N'FirstName';
    SET @description = N'Encrypted field - PII';
    EXEC sp_addextendedproperty 'MS_Description', @description, 'SCHEMA', @defaultSchema, 'TABLE', N'Users', 'COLUMN', N'LastName';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyActivities] (
        [Id] int NOT NULL IDENTITY,
        [FamilyId] int NOT NULL,
        [ActorId] int NOT NULL,
        [TargetId] int NULL,
        [ActionType] nvarchar(50) NOT NULL,
        [Description] nvarchar(500) NULL,
        [EntityType] nvarchar(max) NULL,
        [EntityId] int NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [Metadata] nvarchar(max) NULL,
        CONSTRAINT [PK_FamilyActivities] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyActivities_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyActivities_Users_ActorId] FOREIGN KEY ([ActorId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyActivities_Users_TargetId] FOREIGN KEY ([TargetId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyCalendarEvents] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NULL,
        [StartTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [EndTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsAllDay] bit NOT NULL,
        [Location] nvarchar(max) NULL,
        [Color] nvarchar(max) NULL,
        [IsRecurring] bit NOT NULL,
        [RecurrencePattern] nvarchar(max) NULL,
        [EventType] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [FamilyId] int NOT NULL,
        [CreatedById] int NOT NULL,
        CONSTRAINT [PK_FamilyCalendarEvents] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyCalendarEvents_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyCalendarEvents_Users_CreatedById] FOREIGN KEY ([CreatedById]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyMembers] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Email] nvarchar(max) NULL,
        [AvatarUrl] nvarchar(max) NULL,
        [Relationship] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UserId] int NOT NULL,
        [FamilyId] int NOT NULL,
        [RoleId] int NOT NULL,
        [JoinedAt] datetime2 NOT NULL,
        [IsPending] bit NOT NULL,
        [ProfileCompleted] bit NOT NULL,
        [ApprovedAt] datetime2 NULL,
        CONSTRAINT [PK_FamilyMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyMembers_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyMembers_FamilyRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [FamilyRoles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FamilyMembers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Invitations] (
        [Id] int NOT NULL IDENTITY,
        [Token] nvarchar(max) NOT NULL,
        [Email] nvarchar(max) NOT NULL,
        [FamilyId] int NOT NULL,
        [RoleId] int NOT NULL,
        [CreatedById] int NOT NULL,
        [Message] nvarchar(max) NULL,
        [IsAccepted] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [ExpiresAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Invitations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Invitations_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Invitations_FamilyRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [FamilyRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Invitations_Users_CreatedById] FOREIGN KEY ([CreatedById]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [NotificationPreferences] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [NotificationType] nvarchar(50) NOT NULL,
        [Enabled] bit NOT NULL,
        [Priority] int NOT NULL,
        [FamilyId] int NULL,
        [EnableEmailNotifications] bit NOT NULL,
        [EnablePushNotifications] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_NotificationPreferences] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_NotificationPreferences_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]),
        CONSTRAINT [FK_NotificationPreferences_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Title] nvarchar(100) NOT NULL,
        [Message] nvarchar(500) NOT NULL,
        [NotificationType] nvarchar(50) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsRead] bit NOT NULL,
        [ReadAt] datetime2 NULL,
        [IsImportant] bit NOT NULL,
        [Type] int NULL,
        [RelatedEntityId] int NULL,
        [RelatedEntityType] nvarchar(50) NOT NULL,
        [CreatedByUserId] int NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notifications_Users_CreatedByUserId] FOREIGN KEY ([CreatedByUserId]) REFERENCES [Users] ([Id]),
        CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [Token] nvarchar(max) NOT NULL,
        [ExpiryDate] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CreatedDate] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CreatedByIp] nvarchar(max) NULL,
        [RevokedByIp] nvarchar(max) NULL,
        [RevokedDate] datetime2 NULL,
        [ReplacedByToken] nvarchar(max) NULL,
        [TokenFamily] nvarchar(max) NULL,
        [ReasonRevoked] nvarchar(max) NULL,
        [UserId] int NOT NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [SavedFilters] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [FilterCriteria] nvarchar(max) NOT NULL,
        [QueryType] nvarchar(50) NOT NULL,
        [IsPublic] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_SavedFilters] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SavedFilters_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [SecurityAuditLogs] (
        [Id] int NOT NULL IDENTITY,
        [Timestamp] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [EventType] nvarchar(50) NOT NULL,
        [Action] nvarchar(100) NOT NULL,
        [IpAddress] nvarchar(45) NULL,
        [UserAgent] nvarchar(500) NULL,
        [UserId] int NULL,
        [Username] nvarchar(100) NULL,
        [Resource] nvarchar(200) NULL,
        [Severity] nvarchar(50) NULL,
        [Details] nvarchar(1000) NULL,
        [Status] nvarchar(50) NULL,
        [IsSuccessful] bit NOT NULL,
        [IsSuspicious] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_SecurityAuditLogs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SecurityAuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Tags] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(30) NOT NULL,
        [UserId] int NOT NULL,
        CONSTRAINT [PK_Tags] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Tags_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TaskTemplates] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [Type] int NOT NULL,
        [TemplateData] nvarchar(max) NOT NULL,
        [IsSystemTemplate] bit NOT NULL,
        [IconUrl] nvarchar(max) NULL,
        [IsAutomated] bit NOT NULL,
        [AutomationRules] nvarchar(2000) NULL,
        [TriggerConditions] nvarchar(1000) NULL,
        [IsPublic] bit NOT NULL,
        [Category] nvarchar(50) NULL,
        [Rating] decimal(18,2) NOT NULL,
        [DownloadCount] int NOT NULL,
        [MarketplaceDescription] nvarchar(1000) NULL,
        [PublishedDate] datetime2 NULL,
        [Price] int NOT NULL,
        [IsPremium] bit NOT NULL,
        [PurchaseCount] int NOT NULL,
        [ValueProposition] nvarchar(1000) NULL,
        [SuccessStories] nvarchar(2000) NULL,
        [Prerequisites] nvarchar(500) NULL,
        [UsageCount] int NOT NULL,
        [SuccessRate] decimal(18,2) NOT NULL,
        [AverageCompletionTimeMinutes] int NOT NULL,
        [LastUsedDate] datetime2 NULL,
        [WorkflowSteps] nvarchar(max) NULL,
        [ConditionalLogic] nvarchar(2000) NULL,
        [WorkflowVersion] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UserId] int NULL,
        [TemplateCategoryId] int NULL,
        CONSTRAINT [PK_TaskTemplates] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TaskTemplates_TemplateCategories_TemplateCategoryId] FOREIGN KEY ([TemplateCategoryId]) REFERENCES [TemplateCategories] ([Id]),
        CONSTRAINT [FK_TaskTemplates_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserAchievements] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [AchievementId] int NOT NULL,
        [Progress] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [StartedAt] datetime2 NULL,
        [CompletedAt] datetime2 NULL,
        CONSTRAINT [PK_UserAchievements] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserAchievements_Achievements_AchievementId] FOREIGN KEY ([AchievementId]) REFERENCES [Achievements] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserAchievements_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserApiQuotas] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ApiCallsUsedToday] int NOT NULL,
        [MaxDailyApiCalls] int NOT NULL,
        [LastResetTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [LastUpdatedTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [SubscriptionTierId] int NOT NULL,
        [IsExemptFromQuota] bit NOT NULL,
        [HasReceivedQuotaWarning] bit NOT NULL,
        [QuotaWarningThresholdPercent] int NOT NULL,
        CONSTRAINT [PK_UserApiQuotas] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserApiQuotas_SubscriptionTiers_SubscriptionTierId] FOREIGN KEY ([SubscriptionTierId]) REFERENCES [SubscriptionTiers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserApiQuotas_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserBadges] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [BadgeId] int NOT NULL,
        [AwardedAt] datetime2 NOT NULL,
        [AwardNote] nvarchar(500) NOT NULL,
        [IsDisplayed] bit NOT NULL,
        [IsFeatured] bit NOT NULL,
        CONSTRAINT [PK_UserBadges] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserBadges_Badges_BadgeId] FOREIGN KEY ([BadgeId]) REFERENCES [Badges] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserBadges_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserChallenges] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ChallengeId] int NOT NULL,
        [EnrolledAt] datetime2 NOT NULL,
        [CurrentProgress] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [CompletedAt] datetime2 NULL,
        [IsRewardClaimed] bit NOT NULL,
        CONSTRAINT [PK_UserChallenges] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserChallenges_Challenges_ChallengeId] FOREIGN KEY ([ChallengeId]) REFERENCES [Challenges] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserChallenges_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserDevices] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [DeviceId] nvarchar(max) NOT NULL,
        [DeviceToken] nvarchar(max) NOT NULL,
        [DeviceType] nvarchar(max) NOT NULL,
        [DeviceName] nvarchar(max) NOT NULL,
        [IsVerified] bit NOT NULL,
        [VerificationCode] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [LastActiveAt] datetime2 NOT NULL,
        CONSTRAINT [PK_UserDevices] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserDevices_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserProgresses] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Level] int NOT NULL,
        [CurrentPoints] int NOT NULL,
        [TotalPointsEarned] int NOT NULL,
        [NextLevelThreshold] int NOT NULL,
        [CurrentStreak] int NOT NULL,
        [LongestStreak] int NOT NULL,
        [LastActivityDate] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CurrentCharacterClass] nvarchar(max) NOT NULL,
        [CharacterXP] int NOT NULL,
        [CharacterLevel] int NOT NULL,
        [UnlockedCharacters] nvarchar(max) NOT NULL,
        [UserTier] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_UserProgresses] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserProgresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserRewards] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [RewardId] int NOT NULL,
        [RedeemedAt] datetime2 NOT NULL,
        [IsUsed] bit NOT NULL,
        [UsedAt] datetime2 NULL,
        CONSTRAINT [PK_UserRewards] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserRewards_Rewards_RewardId] FOREIGN KEY ([RewardId]) REFERENCES [Rewards] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRewards_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [UserSessions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [SessionToken] nvarchar(128) NOT NULL,
        [IpAddress] nvarchar(45) NOT NULL,
        [UserAgent] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [LastActivity] datetime2 NOT NULL,
        [ExpiresAt] datetime2 NULL,
        [IsActive] bit NOT NULL,
        [Country] nvarchar(100) NULL,
        [City] nvarchar(100) NULL,
        [CountryCode] nvarchar(10) NULL,
        [Latitude] float NULL,
        [Longitude] float NULL,
        [DeviceType] nvarchar(100) NULL,
        [Browser] nvarchar(100) NULL,
        [OperatingSystem] nvarchar(50) NULL,
        [IsSuspicious] bit NOT NULL,
        [SecurityNotes] nvarchar(200) NULL,
        [TerminatedAt] datetime2 NULL,
        [TerminationReason] nvarchar(100) NULL,
        CONSTRAINT [PK_UserSessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyEventReminders] (
        [Id] int NOT NULL IDENTITY,
        [EventId] int NOT NULL,
        [TimeBeforeInMinutes] int NOT NULL,
        [ReminderMethod] int NOT NULL,
        [Sent] bit NOT NULL,
        [SentAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyEventReminders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyEventReminders_FamilyCalendarEvents_EventId] FOREIGN KEY ([EventId]) REFERENCES [FamilyCalendarEvents] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyAchievementMembers] (
        [Id] int NOT NULL IDENTITY,
        [AchievementId] int NOT NULL,
        [FamilyMemberId] int NOT NULL,
        [ContributionPoints] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyAchievementMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyAchievementMembers_FamilyAchievements_AchievementId] FOREIGN KEY ([AchievementId]) REFERENCES [FamilyAchievements] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyAchievementMembers_FamilyMembers_FamilyMemberId] FOREIGN KEY ([FamilyMemberId]) REFERENCES [FamilyMembers] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyEventAttendees] (
        [Id] int NOT NULL IDENTITY,
        [EventId] int NOT NULL,
        [FamilyMemberId] int NOT NULL,
        [Response] int NOT NULL,
        [Note] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyEventAttendees] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyEventAttendees_FamilyCalendarEvents_EventId] FOREIGN KEY ([EventId]) REFERENCES [FamilyCalendarEvents] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FamilyEventAttendees_FamilyMembers_FamilyMemberId] FOREIGN KEY ([FamilyMemberId]) REFERENCES [FamilyMembers] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FamilyMemberAvailabilities] (
        [Id] int NOT NULL IDENTITY,
        [FamilyMemberId] int NOT NULL,
        [StartTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [EndTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsRecurring] bit NOT NULL,
        [RecurrencePattern] nvarchar(max) NULL,
        [Status] int NOT NULL,
        [Note] nvarchar(200) NULL,
        [DayOfWeek] int NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_FamilyMemberAvailabilities] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FamilyMemberAvailabilities_FamilyMembers_FamilyMemberId] FOREIGN KEY ([FamilyMemberId]) REFERENCES [FamilyMembers] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Tasks] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(100) NOT NULL,
        [Description] nvarchar(1000) NOT NULL,
        [Status] int NOT NULL,
        [DueDate] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CompletedAt] datetime2 NULL,
        [IsCompleted] bit NOT NULL,
        [Priority] nvarchar(50) NOT NULL,
        [UserId] int NOT NULL,
        [CategoryId] int NULL,
        [EstimatedTimeMinutes] int NULL,
        [ProgressPercentage] int NOT NULL,
        [ActualTimeSpentMinutes] int NOT NULL,
        [BoardId] int NULL,
        [BoardColumn] nvarchar(max) NULL,
        [BoardOrder] int NULL,
        [PositionX] float NULL,
        [PositionY] float NULL,
        [AssignedToId] int NULL,
        [AssignedToFamilyMemberId] int NULL,
        [IsRecurring] bit NOT NULL,
        [RecurringPattern] nvarchar(max) NULL,
        [LastRecurrence] datetime2 NULL,
        [NextRecurrence] datetime2 NULL,
        [AssignedByUserId] int NULL,
        [FamilyId] int NULL,
        [RequiresApproval] bit NOT NULL,
        [ApprovedByUserId] int NULL,
        [ApprovedAt] datetime2 NULL,
        [Version] bigint NOT NULL,
        CONSTRAINT [PK_Tasks] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Tasks_Boards_BoardId] FOREIGN KEY ([BoardId]) REFERENCES [Boards] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Tasks_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Tasks_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]),
        CONSTRAINT [FK_Tasks_FamilyMembers_AssignedToFamilyMemberId] FOREIGN KEY ([AssignedToFamilyMemberId]) REFERENCES [FamilyMembers] ([Id]),
        CONSTRAINT [FK_Tasks_Users_ApprovedByUserId] FOREIGN KEY ([ApprovedByUserId]) REFERENCES [Users] ([Id]),
        CONSTRAINT [FK_Tasks_Users_AssignedByUserId] FOREIGN KEY ([AssignedByUserId]) REFERENCES [Users] ([Id]),
        CONSTRAINT [FK_Tasks_Users_AssignedToId] FOREIGN KEY ([AssignedToId]) REFERENCES [Users] ([Id]),
        CONSTRAINT [FK_Tasks_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TaskAutomationRules] (
        [Id] int NOT NULL IDENTITY,
        [TemplateId] int NOT NULL,
        [TriggerType] nvarchar(50) NOT NULL,
        [Conditions] nvarchar(2000) NULL,
        [Actions] nvarchar(2000) NOT NULL,
        [Name] nvarchar(100) NULL,
        [Description] nvarchar(500) NULL,
        [IsActive] bit NOT NULL,
        [Priority] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [LastTriggered] datetime2 NULL,
        [TriggerCount] int NOT NULL,
        [SuccessRate] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_TaskAutomationRules] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TaskAutomationRules_TaskTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [TaskTemplates] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TemplateMarketplace] (
        [Id] int NOT NULL IDENTITY,
        [TemplateId] int NOT NULL,
        [CreatedBy] int NOT NULL,
        [PublishedDate] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [Description] nvarchar(1000) NULL,
        [Tags] nvarchar(500) NULL,
        [IsFeatured] bit NOT NULL,
        [IsApproved] bit NOT NULL,
        [ApprovedDate] datetime2 NULL,
        [ApprovedBy] int NULL,
        [Price] decimal(18,2) NOT NULL,
        [IsFree] bit NOT NULL,
        [Version] nvarchar(100) NULL,
        [ChangeLog] nvarchar(2000) NULL,
        [MinimumRating] int NOT NULL,
        [LastUpdated] datetime2 NULL,
        [CreatorId] int NULL,
        [ApproverId] int NULL,
        CONSTRAINT [PK_TemplateMarketplace] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TemplateMarketplace_TaskTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [TaskTemplates] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TemplateMarketplace_Users_ApproverId] FOREIGN KEY ([ApproverId]) REFERENCES [Users] ([Id]),
        CONSTRAINT [FK_TemplateMarketplace_Users_CreatorId] FOREIGN KEY ([CreatorId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TemplatePurchases] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [TemplateId] int NOT NULL,
        [PointsSpent] int NOT NULL,
        [PurchasedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_TemplatePurchases] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TemplatePurchases_TaskTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [TaskTemplates] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TemplatePurchases_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TemplateUsageAnalytics] (
        [Id] int NOT NULL IDENTITY,
        [TemplateId] int NOT NULL,
        [UserId] int NOT NULL,
        [UsedDate] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CompletionTimeMinutes] int NOT NULL,
        [Success] bit NOT NULL,
        [Notes] nvarchar(500) NULL,
        [TasksCreated] int NOT NULL,
        [TasksCompleted] int NOT NULL,
        [EfficiencyScore] decimal(18,2) NOT NULL,
        [Feedback] nvarchar(1000) NULL,
        [CompletedAt] datetime2 NULL,
        CONSTRAINT [PK_TemplateUsageAnalytics] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TemplateUsageAnalytics_TaskTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [TaskTemplates] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TemplateUsageAnalytics_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [WorkflowSteps] (
        [Id] int NOT NULL IDENTITY,
        [TemplateId] int NOT NULL,
        [StepOrder] int NOT NULL,
        [StepType] nvarchar(50) NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NULL,
        [Configuration] nvarchar(2000) NULL,
        [Conditions] nvarchar(1000) NULL,
        [IsRequired] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [EstimatedDurationMinutes] int NOT NULL,
        [Dependencies] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_WorkflowSteps] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_WorkflowSteps_TaskTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [TaskTemplates] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [FocusSessions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [TaskId] int NOT NULL,
        [StartTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [EndTime] datetime2 NULL,
        [DurationMinutes] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [Notes] nvarchar(max) NULL,
        [SessionQualityRating] int NULL,
        [CompletionNotes] nvarchar(max) NULL,
        [TaskProgressBefore] int NOT NULL,
        [TaskProgressAfter] int NOT NULL,
        [TaskCompletedDuringSession] bit NOT NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_FocusSessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FocusSessions_Tasks_TaskId] FOREIGN KEY ([TaskId]) REFERENCES [Tasks] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_FocusSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Notes] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(200) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [Category] int NOT NULL,
        [Format] int NOT NULL,
        [IsPinned] bit NOT NULL,
        [IsArchived] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UserId] int NOT NULL,
        [TaskItemId] int NULL,
        CONSTRAINT [PK_Notes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notes_Tasks_TaskItemId] FOREIGN KEY ([TaskItemId]) REFERENCES [Tasks] ([Id]),
        CONSTRAINT [FK_Notes_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [PointTransactions] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Points] int NOT NULL,
        [TransactionType] nvarchar(50) NOT NULL,
        [Description] nvarchar(200) NOT NULL,
        [TaskId] int NULL,
        [TemplateId] int NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        CONSTRAINT [PK_PointTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_PointTransactions_TaskTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [TaskTemplates] ([Id]),
        CONSTRAINT [FK_PointTransactions_Tasks_TaskId] FOREIGN KEY ([TaskId]) REFERENCES [Tasks] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_PointTransactions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [Reminders] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NOT NULL,
        [ReminderTime] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [DueDate] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [IsRepeating] bit NOT NULL,
        [RepeatFrequency] int NULL,
        [IsCompleted] bit NOT NULL,
        [Priority] int NOT NULL,
        [Status] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [UpdatedAt] datetime2 NULL DEFAULT '2025-01-01T00:00:00.0000000',
        [CompletedAt] datetime2 NULL,
        [UserId] int NOT NULL,
        [TaskItemId] int NULL,
        CONSTRAINT [PK_Reminders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Reminders_Tasks_TaskItemId] FOREIGN KEY ([TaskItemId]) REFERENCES [Tasks] ([Id]),
        CONSTRAINT [FK_Reminders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE TABLE [TaskTags] (
        [TaskId] int NOT NULL,
        [TagId] int NOT NULL,
        CONSTRAINT [PK_TaskTags] PRIMARY KEY ([TaskId], [TagId]),
        CONSTRAINT [FK_TaskTags_Tags_TagId] FOREIGN KEY ([TagId]) REFERENCES [Tags] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TaskTags_Tasks_TaskId] FOREIGN KEY ([TaskId]) REFERENCES [Tasks] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Criteria', N'Description', N'Difficulty', N'FamilyId', N'IconUrl', N'IsDeleted', N'Name', N'PointValue', N'Scope') AND [object_id] = OBJECT_ID(N'[Achievements]'))
        SET IDENTITY_INSERT [Achievements] ON;
    EXEC(N'INSERT INTO [Achievements] ([Id], [Category], [CreatedAt], [Criteria], [Description], [Difficulty], [FamilyId], [IconUrl], [IsDeleted], [Name], [PointValue], [Scope])
    VALUES (1, N''First Steps'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete your very first task'', 0, NULL, N''/icons/achievements/bronze-first-task.svg'', CAST(0 AS bit), N''First Steps'', 10, 0),
    (2, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks'', 0, NULL, N''/icons/achievements/bronze-task-starter.svg'', CAST(0 AS bit), N''Task Starter'', 25, 0),
    (3, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 10 tasks'', 0, NULL, N''/icons/achievements/bronze-getting-started.svg'', CAST(0 AS bit), N''Getting Started'', 50, 0),
    (4, N''Creation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create your first task'', 0, NULL, N''/icons/achievements/bronze-creator.svg'', CAST(0 AS bit), N''Creator'', 15, 0),
    (5, N''Organization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create your first category'', 0, NULL, N''/icons/achievements/bronze-organizer.svg'', CAST(0 AS bit), N''Organizer'', 10, 0),
    (6, N''Time Management'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete a task before 8 AM'', 1, NULL, N''/icons/achievements/bronze-early-bird.svg'', CAST(0 AS bit), N''Early Bird'', 20, 0),
    (7, N''Time Management'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete a task after 10 PM'', 1, NULL, N''/icons/achievements/bronze-night-owl.svg'', CAST(0 AS bit), N''Night Owl'', 15, 0),
    (8, N''Dedication'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks on weekends'', 1, NULL, N''/icons/achievements/bronze-weekend-warrior.svg'', CAST(0 AS bit), N''Weekend Warrior'', 30, 0),
    (9, N''Time Management'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 3 tasks during lunch break'', 1, NULL, N''/icons/achievements/bronze-lunch-hero.svg'', CAST(0 AS bit), N''Lunch Break Hero'', 25, 0),
    (10, N''Punctuality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks before their due date'', 1, NULL, N''/icons/achievements/bronze-on-time.svg'', CAST(0 AS bit), N''On Time'', 40, 0),
    (11, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete a task in under 5 minutes'', 1, NULL, N''/icons/achievements/bronze-speed-runner.svg'', CAST(0 AS bit), N''Speed Runner'', 15, 0),
    (12, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 3 tasks in under 10 minutes each'', 1, NULL, N''/icons/achievements/bronze-quick-draw.svg'', CAST(0 AS bit), N''Quick Draw'', 35, 0),
    (13, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks in under 15 minutes total'', 2, NULL, N''/icons/achievements/bronze-flash.svg'', CAST(0 AS bit), N''Flash'', 50, 0),
    (14, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete tasks for 3 consecutive days'', 1, NULL, N''/icons/achievements/bronze-streak-start.svg'', CAST(0 AS bit), N''Streak Starter'', 30, 0),
    (15, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete at least 1 task every day for 5 days'', 1, NULL, N''/icons/achievements/bronze-daily-dose.svg'', CAST(0 AS bit), N''Daily Dose'', 50, 0),
    (16, N''Habits'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete morning tasks 5 days in a row'', 1, NULL, N''/icons/achievements/bronze-morning-routine.svg'', CAST(0 AS bit), N''Morning Routine'', 45, 0),
    (17, N''Social'', ''2025-01-01T00:00:00.0000000'', N'''', N''Join your first family'', 0, NULL, N''/icons/achievements/bronze-team-player.svg'', CAST(0 AS bit), N''Team Player'', 25, 0),
    (18, N''Collaboration'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 3 family tasks'', 1, NULL, N''/icons/achievements/bronze-helpful.svg'', CAST(0 AS bit), N''Helpful'', 35, 0),
    (19, N''Social'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create your first family event'', 1, NULL, N''/icons/achievements/bronze-event-organizer.svg'', CAST(0 AS bit), N''Event Organizer'', 30, 0),
    (20, N''Learning'', ''2025-01-01T00:00:00.0000000'', N'''', N''Try 3 different task priorities'', 1, NULL, N''/icons/achievements/bronze-experimenter.svg'', CAST(0 AS bit), N''Experimenter'', 20, 0),
    (21, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete your first focus session'', 0, NULL, N''/icons/achievements/bronze-focused.svg'', CAST(0 AS bit), N''Focused'', 25, 0),
    (22, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 focus sessions'', 1, NULL, N''/icons/achievements/bronze-zen-master.svg'', CAST(0 AS bit), N''Zen Master'', 75, 0),
    (23, N''Resilience'', ''2025-01-01T00:00:00.0000000'', N'''', N''Return after 7 days of inactivity'', 1, NULL, N''/icons/achievements/bronze-comeback-kid.svg'', CAST(0 AS bit), N''Comeback Kid'', 50, 0),
    (24, N''Quality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks with perfect quality'', 2, NULL, N''/icons/achievements/bronze-perfectionist.svg'', CAST(0 AS bit), N''Perfectionist'', 60, 0),
    (25, N''Versatility'', ''2025-01-01T00:00:00.0000000'', N'''', N''Work on 3 different categories in one day'', 1, NULL, N''/icons/achievements/bronze-multi-tasker.svg'', CAST(0 AS bit), N''Multi-tasker'', 30, 0),
    (26, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 10 tasks in January'', 2, NULL, N''/icons/achievements/bronze-new-year.svg'', CAST(0 AS bit), N''New Year Resolution'', 100, 0),
    (27, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 15 organization tasks in March'', 2, NULL, N''/icons/achievements/bronze-spring-cleaning.svg'', CAST(0 AS bit), N''Spring Cleaning'', 75, 0),
    (28, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 20 tasks in summer months'', 2, NULL, N''/icons/achievements/bronze-summer-vibes.svg'', CAST(0 AS bit), N''Summer Vibes'', 80, 0),
    (29, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use task templates 10 times'', 1, NULL, N''/icons/achievements/bronze-template-master.svg'', CAST(0 AS bit), N''Template Master'', 50, 0),
    (30, N''Automation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 3 recurring tasks'', 1, NULL, N''/icons/achievements/bronze-automation.svg'', CAST(0 AS bit), N''Automation Lover'', 45, 0),
    (31, N''Milestones'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use the app for 7 consecutive days'', 1, NULL, N''/icons/achievements/bronze-first-week.svg'', CAST(0 AS bit), N''First Week'', 70, 0),
    (32, N''Milestones'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use the app for 30 days total'', 2, NULL, N''/icons/achievements/bronze-loyal-user.svg'', CAST(0 AS bit), N''Loyal User'', 150, 0),
    (33, N''Productivity'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks in one hour'', 2, NULL, N''/icons/achievements/bronze-power-hour.svg'', CAST(0 AS bit), N''Power Hour'', 80, 0),
    (34, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 20 tasks total'', 2, NULL, N''/icons/achievements/bronze-task-destroyer.svg'', CAST(0 AS bit), N''Task Destroyer'', 100, 0),
    (35, N''Priority'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 10 high-priority tasks'', 2, NULL, N''/icons/achievements/bronze-priority-pro.svg'', CAST(0 AS bit), N''Priority Pro'', 75, 0),
    (36, N''Priority'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 critical priority tasks'', 3, NULL, N''/icons/achievements/bronze-critical-thinker.svg'', CAST(0 AS bit), N''Critical Thinker'', 100, 0),
    (37, N''Organization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 5 different categories'', 1, NULL, N''/icons/achievements/bronze-category-creator.svg'', CAST(0 AS bit), N''Category Creator'', 50, 0),
    (38, N''Organization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use 10 different tags'', 1, NULL, N''/icons/achievements/bronze-tag-master.svg'', CAST(0 AS bit), N''Tag Master'', 40, 0),
    (39, N''Planning'', ''2025-01-01T00:00:00.0000000'', N'''', N''Set your first reminder'', 0, NULL, N''/icons/achievements/bronze-reminder-rookie.svg'', CAST(0 AS bit), N''Reminder Rookie'', 15, 0),
    (40, N''Planning'', ''2025-01-01T00:00:00.0000000'', N'''', N''Set 10 reminders'', 1, NULL, N''/icons/achievements/bronze-planner.svg'', CAST(0 AS bit), N''Planner'', 50, 0),
    (41, N''Documentation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Add notes to 5 tasks'', 1, NULL, N''/icons/achievements/bronze-note-taker.svg'', CAST(0 AS bit), N''Note Taker'', 30, 0),
    (42, N''Documentation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Write notes longer than 100 characters'', 1, NULL, N''/icons/achievements/bronze-detailed.svg'', CAST(0 AS bit), N''Detailed'', 25, 0);
    INSERT INTO [Achievements] ([Id], [Category], [CreatedAt], [Criteria], [Description], [Difficulty], [FamilyId], [IconUrl], [IsDeleted], [Name], [PointValue], [Scope])
    VALUES (43, N''Visualization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create your first board'', 0, NULL, N''/icons/achievements/bronze-board-creator.svg'', CAST(0 AS bit), N''Board Creator'', 30, 0),
    (44, N''Visualization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Move 10 tasks between board columns'', 1, NULL, N''/icons/achievements/bronze-visual-organizer.svg'', CAST(0 AS bit), N''Visual Organizer'', 40, 0),
    (45, N''Challenges'', ''2025-01-01T00:00:00.0000000'', N'''', N''Join your first challenge'', 0, NULL, N''/icons/achievements/bronze-challenge-accepted.svg'', CAST(0 AS bit), N''Challenge Accepted'', 25, 0),
    (46, N''Gamification'', ''2025-01-01T00:00:00.0000000'', N'''', N''Earn your first 100 points'', 1, NULL, N''/icons/achievements/bronze-point-collector.svg'', CAST(0 AS bit), N''Point Collector'', 0, 0),
    (47, N''Exploration'', ''2025-01-01T00:00:00.0000000'', N'''', N''Try every main feature once'', 2, NULL, N''/icons/achievements/bronze-explorer.svg'', CAST(0 AS bit), N''Explorer'', 100, 0),
    (48, N''Exploration'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use 5 different app features'', 1, NULL, N''/icons/achievements/bronze-feature-hunter.svg'', CAST(0 AS bit), N''Feature Hunter'', 50, 0),
    (49, N''Development'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 10 personal development tasks'', 2, NULL, N''/icons/achievements/bronze-self-improver.svg'', CAST(0 AS bit), N''Self Improver'', 75, 0),
    (50, N''Habits'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete the same type of task 7 days in a row'', 2, NULL, N''/icons/achievements/bronze-habit-builder.svg'', CAST(0 AS bit), N''Habit Builder'', 80, 0),
    (51, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 tasks'', 2, NULL, N''/icons/achievements/silver-task-warrior.svg'', CAST(0 AS bit), N''Task Warrior'', 150, 0),
    (52, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 100 tasks'', 3, NULL, N''/icons/achievements/silver-productive.svg'', CAST(0 AS bit), N''Productive'', 250, 0),
    (53, N''Intensity'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 25 tasks in one week'', 3, NULL, N''/icons/achievements/silver-task-machine.svg'', CAST(0 AS bit), N''Task Machine'', 200, 0),
    (54, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 10 tasks in under 5 minutes each'', 2, NULL, N''/icons/achievements/silver-lightning-fast.svg'', CAST(0 AS bit), N''Lightning Fast'', 150, 0),
    (55, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 tasks within 30 minutes'', 3, NULL, N''/icons/achievements/silver-speed-demon.svg'', CAST(0 AS bit), N''Speed Demon'', 120, 0),
    (56, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 15 tasks in 2 hours'', 3, NULL, N''/icons/achievements/silver-rapid-fire.svg'', CAST(0 AS bit), N''Rapid Fire'', 180, 0),
    (57, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain a 14-day streak'', 2, NULL, N''/icons/achievements/silver-flame-keeper.svg'', CAST(0 AS bit), N''Flame Keeper'', 200, 0),
    (58, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete tasks every day for 21 days'', 3, NULL, N''/icons/achievements/silver-dedicated.svg'', CAST(0 AS bit), N''Dedicated'', 300, 0),
    (59, N''Habits'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete morning tasks for 14 days straight'', 3, NULL, N''/icons/achievements/silver-morning-champion.svg'', CAST(0 AS bit), N''Morning Champion'', 250, 0),
    (60, N''Time Management'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete tasks on time for 10 consecutive days'', 2, NULL, N''/icons/achievements/silver-time-master.svg'', CAST(0 AS bit), N''Time Master'', 200, 0),
    (61, N''Punctuality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 tasks before their due date'', 3, NULL, N''/icons/achievements/silver-punctuality-expert.svg'', CAST(0 AS bit), N''Punctuality Expert'', 300, 0),
    (62, N''Time Management'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 25 tasks before 8 AM'', 3, NULL, N''/icons/achievements/silver-early-bird-master.svg'', CAST(0 AS bit), N''Early Bird Master'', 250, 0),
    (63, N''Collaboration'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 25 family tasks'', 2, NULL, N''/icons/achievements/silver-team-player.svg'', CAST(0 AS bit), N''Team Player'', 200, 0),
    (64, N''Collaboration'', ''2025-01-01T00:00:00.0000000'', N'''', N''Help family members complete 15 tasks'', 2, NULL, N''/icons/achievements/silver-family-hero.svg'', CAST(0 AS bit), N''Family Hero'', 180, 0),
    (65, N''Social'', ''2025-01-01T00:00:00.0000000'', N'''', N''Organize 10 family events'', 3, NULL, N''/icons/achievements/silver-event-master.svg'', CAST(0 AS bit), N''Event Master'', 300, 0),
    (66, N''Social'', ''2025-01-01T00:00:00.0000000'', N'''', N''Invite 5 people to join families'', 3, NULL, N''/icons/achievements/silver-community-builder.svg'', CAST(0 AS bit), N''Community Builder'', 250, 0),
    (67, N''Quality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 25 tasks with perfect quality'', 3, NULL, N''/icons/achievements/silver-quality-control.svg'', CAST(0 AS bit), N''Quality Control'', 300, 0),
    (68, N''Documentation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Add detailed notes to 25 tasks'', 2, NULL, N''/icons/achievements/silver-attention-detail.svg'', CAST(0 AS bit), N''Attention to Detail'', 200, 0),
    (69, N''Quality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Review and update 20 completed tasks'', 2, NULL, N''/icons/achievements/silver-reviewer.svg'', CAST(0 AS bit), N''Reviewer'', 150, 0),
    (70, N''Innovation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 25 unique tasks'', 2, NULL, N''/icons/achievements/silver-innovator.svg'', CAST(0 AS bit), N''Innovator'', 200, 0),
    (71, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 10 task templates'', 2, NULL, N''/icons/achievements/silver-template-creator.svg'', CAST(0 AS bit), N''Template Creator'', 180, 0),
    (72, N''Organization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 15 categories and organize tasks'', 2, NULL, N''/icons/achievements/silver-system-builder.svg'', CAST(0 AS bit), N''System Builder'', 220, 0),
    (73, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 25 focus sessions'', 2, NULL, N''/icons/achievements/silver-focus-master.svg'', CAST(0 AS bit), N''Focus Master'', 250, 0),
    (74, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 5 focus sessions over 2 hours each'', 3, NULL, N''/icons/achievements/silver-deep-work.svg'', CAST(0 AS bit), N''Deep Work'', 300, 0),
    (75, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 100 tasks during focus sessions'', 3, NULL, N''/icons/achievements/silver-concentration-champion.svg'', CAST(0 AS bit), N''Concentration Champion'', 400, 0),
    (76, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 75 tasks in spring'', 3, NULL, N''/icons/achievements/silver-spring-productivity.svg'', CAST(0 AS bit), N''Spring Productivity'', 300, 0),
    (77, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain streaks throughout summer'', 3, NULL, N''/icons/achievements/silver-summer-consistency.svg'', CAST(0 AS bit), N''Summer Consistency'', 350, 0),
    (78, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Reorganize and complete 50 tasks in fall'', 2, NULL, N''/icons/achievements/silver-autumn-organizer.svg'', CAST(0 AS bit), N''Autumn Organizer'', 275, 0),
    (79, N''Seasonal'', ''2025-01-01T00:00:00.0000000'', N'''', N''Stay productive throughout winter'', 4, NULL, N''/icons/achievements/silver-winter-warrior.svg'', CAST(0 AS bit), N''Winter Warrior'', 400, 0),
    (80, N''Priority'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 high-priority tasks'', 2, NULL, N''/icons/achievements/silver-priority-master.svg'', CAST(0 AS bit), N''Priority Master'', 300, 0),
    (81, N''Strategy'', ''2025-01-01T00:00:00.0000000'', N'''', N''Balance tasks across all priority levels'', 2, NULL, N''/icons/achievements/silver-strategic-thinker.svg'', CAST(0 AS bit), N''Strategic Thinker'', 250, 0),
    (82, N''Priority'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 20 critical priority tasks'', 3, NULL, N''/icons/achievements/silver-crisis-manager.svg'', CAST(0 AS bit), N''Crisis Manager'', 400, 0),
    (83, N''Automation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Set up 20 recurring tasks'', 2, NULL, N''/icons/achievements/silver-automation-expert.svg'', CAST(0 AS bit), N''Automation Expert'', 300, 0),
    (84, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use templates for 50 task creations'', 2, NULL, N''/icons/achievements/silver-efficiency-master.svg'', CAST(0 AS bit), N''Efficiency Master'', 250, 0);
    INSERT INTO [Achievements] ([Id], [Category], [CreatedAt], [Criteria], [Description], [Difficulty], [FamilyId], [IconUrl], [IsDeleted], [Name], [PointValue], [Scope])
    VALUES (85, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Save 10 hours using automation features'', 4, NULL, N''/icons/achievements/silver-time-saver.svg'', CAST(0 AS bit), N''Time Saver'', 500, 0),
    (86, N''Milestones'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use the app for 90 consecutive days'', 3, NULL, N''/icons/achievements/silver-regular-user.svg'', CAST(0 AS bit), N''Regular User'', 450, 0),
    (87, N''Milestones'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use the app for 6 months total'', 4, NULL, N''/icons/achievements/silver-dedicated-user.svg'', CAST(0 AS bit), N''Dedicated User'', 600, 0),
    (88, N''Gamification'', ''2025-01-01T00:00:00.0000000'', N'''', N''Earn 1000 total points'', 2, NULL, N''/icons/achievements/silver-point-accumulator.svg'', CAST(0 AS bit), N''Point Accumulator'', 0, 0),
    (89, N''Challenges'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 10 different challenges'', 2, NULL, N''/icons/achievements/silver-challenge-warrior.svg'', CAST(0 AS bit), N''Challenge Warrior'', 300, 0),
    (90, N''Competition'', ''2025-01-01T00:00:00.0000000'', N'''', N''Finish in top 3 of family leaderboard 5 times'', 3, NULL, N''/icons/achievements/silver-competitor.svg'', CAST(0 AS bit), N''Competitor'', 350, 0),
    (91, N''Competition'', ''2025-01-01T00:00:00.0000000'', N'''', N''Improve leaderboard position 10 times'', 2, NULL, N''/icons/achievements/silver-leaderboard-climber.svg'', CAST(0 AS bit), N''Leaderboard Climber'', 250, 0),
    (92, N''Development'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 learning/development tasks'', 2, NULL, N''/icons/achievements/silver-growth-mindset.svg'', CAST(0 AS bit), N''Growth Mindset'', 300, 0),
    (93, N''Versatility'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete tasks in 10 different categories'', 2, NULL, N''/icons/achievements/silver-skill-builder.svg'', CAST(0 AS bit), N''Skill Builder'', 250, 0),
    (94, N''Habits'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain 5 different habit streaks simultaneously'', 4, NULL, N''/icons/achievements/silver-habit-master.svg'', CAST(0 AS bit), N''Habit Master'', 400, 0),
    (95, N''Communication'', ''2025-01-01T00:00:00.0000000'', N'''', N''Add comments to 50 family tasks'', 2, NULL, N''/icons/achievements/silver-communicator.svg'', CAST(0 AS bit), N''Communicator'', 200, 0),
    (96, N''Planning'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create tasks with comprehensive descriptions'', 2, NULL, N''/icons/achievements/silver-detailed-planner.svg'', CAST(0 AS bit), N''Detailed Planner'', 150, 0),
    (97, N''Documentation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain detailed notes for 3 months'', 3, NULL, N''/icons/achievements/silver-knowledge-keeper.svg'', CAST(0 AS bit), N''Knowledge Keeper'', 300, 0),
    (98, N''Visualization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create and maintain 10 active boards'', 2, NULL, N''/icons/achievements/silver-board-master.svg'', CAST(0 AS bit), N''Board Master'', 250, 0),
    (99, N''Visualization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Organize 500 tasks using boards'', 3, NULL, N''/icons/achievements/silver-visual-thinker.svg'', CAST(0 AS bit), N''Visual Thinker'', 300, 0),
    (100, N''Organization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Design the perfect productivity workspace'', 3, NULL, N''/icons/achievements/silver-workspace-architect.svg'', CAST(0 AS bit), N''Workspace Architect'', 350, 0),
    (101, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 200 tasks'', 3, NULL, N''/icons/achievements/gold-champion.svg'', CAST(0 AS bit), N''Champion'', 400, 0),
    (102, N''Progress'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 300 tasks'', 4, NULL, N''/icons/achievements/gold-task-master.svg'', CAST(0 AS bit), N''Task Master'', 600, 0),
    (103, N''Intensity'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 tasks in one week'', 4, NULL, N''/icons/achievements/gold-productivity-beast.svg'', CAST(0 AS bit), N''Productivity Beast'', 500, 0),
    (104, N''Endurance'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 100 tasks in one month'', 4, NULL, N''/icons/achievements/gold-marathon-runner.svg'', CAST(0 AS bit), N''Marathon Runner'', 750, 0),
    (105, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete tasks every day for 50 days'', 4, NULL, N''/icons/achievements/gold-unstoppable.svg'', CAST(0 AS bit), N''Unstoppable'', 800, 0),
    (106, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 20 tasks in under 5 minutes each'', 3, NULL, N''/icons/achievements/gold-rocket-speed.svg'', CAST(0 AS bit), N''Rocket Speed'', 400, 0),
    (107, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 30 tasks in 1 hour'', 4, NULL, N''/icons/achievements/gold-speed-light.svg'', CAST(0 AS bit), N''Speed of Light'', 600, 0),
    (108, N''Speed'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 100 tasks in 4 hours'', 4, NULL, N''/icons/achievements/gold-time-warp.svg'', CAST(0 AS bit), N''Time Warp'', 800, 0),
    (109, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain a 30-day streak'', 3, NULL, N''/icons/achievements/gold-campfire.svg'', CAST(0 AS bit), N''Campfire'', 600, 0),
    (110, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain a 60-day streak'', 4, NULL, N''/icons/achievements/gold-bonfire.svg'', CAST(0 AS bit), N''Bonfire'', 900, 0),
    (111, N''Consistency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain a 90-day streak'', 4, NULL, N''/icons/achievements/gold-wildfire.svg'', CAST(0 AS bit), N''Wildfire'', 1200, 0),
    (112, N''Quality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 tasks with perfect quality'', 3, NULL, N''/icons/achievements/gold-perfectionist.svg'', CAST(0 AS bit), N''Perfectionist'', 500, 0),
    (113, N''Quality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain perfect quality for 30 days'', 4, NULL, N''/icons/achievements/gold-quality-assurance.svg'', CAST(0 AS bit), N''Quality Assurance'', 700, 0),
    (114, N''Quality'', ''2025-01-01T00:00:00.0000000'', N'''', N''Perfect 100 tasks with detailed notes'', 4, NULL, N''/icons/achievements/gold-craftsman.svg'', CAST(0 AS bit), N''Craftsman'', 800, 0),
    (115, N''Leadership'', ''2025-01-01T00:00:00.0000000'', N'''', N''Lead family productivity for 14 days'', 3, NULL, N''/icons/achievements/gold-leader.svg'', CAST(0 AS bit), N''Leader'', 600, 0),
    (116, N''Leadership'', ''2025-01-01T00:00:00.0000000'', N'''', N''Help 10 family members achieve streaks'', 4, NULL, N''/icons/achievements/gold-mentor.svg'', CAST(0 AS bit), N''Mentor'', 700, 0),
    (117, N''Community'', ''2025-01-01T00:00:00.0000000'', N'''', N''Build a family of 20+ active members'', 4, NULL, N''/icons/achievements/gold-community-champion.svg'', CAST(0 AS bit), N''Community Champion'', 1000, 0),
    (118, N''Creation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 100 unique tasks'', 3, NULL, N''/icons/achievements/gold-master-creator.svg'', CAST(0 AS bit), N''Master Creator'', 500, 0),
    (119, N''Organization'', ''2025-01-01T00:00:00.0000000'', N'''', N''Design comprehensive productivity systems'', 4, NULL, N''/icons/achievements/gold-system-architect.svg'', CAST(0 AS bit), N''System Architect'', 800, 0),
    (120, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create 50 helpful templates'', 3, NULL, N''/icons/achievements/gold-template-wizard.svg'', CAST(0 AS bit), N''Template Wizard'', 600, 0),
    (121, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 100 focus sessions'', 3, NULL, N''/icons/achievements/gold-deep-focus.svg'', CAST(0 AS bit), N''Deep Focus'', 700, 0),
    (122, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 hours of focus time'', 4, NULL, N''/icons/achievements/gold-meditation-master.svg'', CAST(0 AS bit), N''Meditation Master'', 900, 0),
    (123, N''Focus'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain focus sessions for 60 days'', 4, NULL, N''/icons/achievements/gold-zen-garden.svg'', CAST(0 AS bit), N''Zen Garden'', 1000, 0),
    (124, N''Time Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Master time across all dimensions'', 4, NULL, N''/icons/achievements/gold-time-lord.svg'', CAST(0 AS bit), N''Time Lord'', 3000, 0),
    (125, N''Time Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Control time itself'', 4, NULL, N''/icons/achievements/gold-chronos.svg'', CAST(0 AS bit), N''Chronos'', 5000, 0),
    (126, N''Time Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Rule over all time and space'', 4, NULL, N''/icons/achievements/gold-temporal-sovereign.svg'', CAST(0 AS bit), N''Temporal Sovereign'', 8000, 0);
    INSERT INTO [Achievements] ([Id], [Category], [CreatedAt], [Criteria], [Description], [Difficulty], [FamilyId], [IconUrl], [IsDeleted], [Name], [PointValue], [Scope])
    VALUES (127, N''Competition'', ''2025-01-01T00:00:00.0000000'', N'''', N''Win 50 competitions'', 4, NULL, N''/icons/achievements/gold-champion-champions.svg'', CAST(0 AS bit), N''Champion of Champions'', 2500, 0),
    (128, N''Dominance'', ''2025-01-01T00:00:00.0000000'', N'''', N''Never lose a competition for a year'', 4, NULL, N''/icons/achievements/gold-undefeated.svg'', CAST(0 AS bit), N''Undefeated'', 4000, 0),
    (129, N''Dominance'', ''2025-01-01T00:00:00.0000000'', N'''', N''Achieve impossible victory records'', 4, NULL, N''/icons/achievements/gold-god-mode.svg'', CAST(0 AS bit), N''God Mode'', 7500, 0),
    (130, N''Teaching'', ''2025-01-01T00:00:00.0000000'', N'''', N''Teach 100 people productivity'', 4, NULL, N''/icons/achievements/gold-productivity-sensei.svg'', CAST(0 AS bit), N''Productivity Sensei'', 3000, 0),
    (131, N''Wisdom'', ''2025-01-01T00:00:00.0000000'', N'''', N''Preserve and share ancient wisdom'', 4, NULL, N''/icons/achievements/gold-wisdom-keeper.svg'', CAST(0 AS bit), N''Wisdom Keeper'', 4500, 0),
    (132, N''Enlightenment'', ''2025-01-01T00:00:00.0000000'', N'''', N''Achieve productivity enlightenment'', 4, NULL, N''/icons/achievements/gold-enlightened-one.svg'', CAST(0 AS bit), N''Enlightened One'', 7500, 0),
    (133, N''Legend'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 500 tasks'', 4, NULL, N''/icons/achievements/platinum-legend.svg'', CAST(0 AS bit), N''Legend'', 1500, 0),
    (134, N''Legend'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 750 tasks'', 4, NULL, N''/icons/achievements/platinum-myth.svg'', CAST(0 AS bit), N''Myth'', 2000, 0),
    (135, N''Legend'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 1000 tasks'', 4, NULL, N''/icons/achievements/platinum-epic.svg'', CAST(0 AS bit), N''Epic'', 3000, 0),
    (136, N''Speed Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Complete 50 tasks in a single day'', 4, NULL, N''/icons/achievements/platinum-speed-demon.svg'', CAST(0 AS bit), N''Speed Demon'', 2000, 0),
    (137, N''Speed Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain extreme speed for 30 days'', 4, NULL, N''/icons/achievements/platinum-velocity.svg'', CAST(0 AS bit), N''Velocity'', 2500, 0),
    (138, N''Speed Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Achieve impossible speed records'', 4, NULL, N''/icons/achievements/platinum-hypersonic.svg'', CAST(0 AS bit), N''Hypersonic'', 3000, 0),
    (139, N''Endurance'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain a 180-day streak'', 4, NULL, N''/icons/achievements/platinum-eternal-flame.svg'', CAST(0 AS bit), N''Eternal Flame'', 3000, 0),
    (140, N''Endurance'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain a 365-day streak'', 4, NULL, N''/icons/achievements/platinum-immortal.svg'', CAST(0 AS bit), N''Immortal'', 5000, 0),
    (141, N''Endurance'', ''2025-01-01T00:00:00.0000000'', N'''', N''Never miss a day for 2 years'', 4, NULL, N''/icons/achievements/platinum-unbreakable.svg'', CAST(0 AS bit), N''Unbreakable'', 10000, 0),
    (142, N''Excellence'', ''2025-01-01T00:00:00.0000000'', N'''', N''Perfect quality in 200 tasks'', 4, NULL, N''/icons/achievements/platinum-perfectionist.svg'', CAST(0 AS bit), N''Platinum Perfectionist'', 2000, 0),
    (143, N''Excellence'', ''2025-01-01T00:00:00.0000000'', N'''', N''Perfect everything you touch'', 4, NULL, N''/icons/achievements/platinum-flawless.svg'', CAST(0 AS bit), N''Flawless'', 3000, 0),
    (144, N''Excellence'', ''2025-01-01T00:00:00.0000000'', N'''', N''Transcend human quality limits'', 4, NULL, N''/icons/achievements/platinum-divine-quality.svg'', CAST(0 AS bit), N''Divine Quality'', 5000, 0),
    (145, N''Empire'', ''2025-01-01T00:00:00.0000000'', N'''', N''Lead 1000 family members'', 4, NULL, N''/icons/achievements/platinum-family-emperor.svg'', CAST(0 AS bit), N''Family Emperor'', 15000, 0),
    (146, N''Global'', ''2025-01-01T00:00:00.0000000'', N'''', N''Impact productivity worldwide'', 4, NULL, N''/icons/achievements/platinum-global-influence.svg'', CAST(0 AS bit), N''Global Influence'', 25000, 0),
    (147, N''Legacy'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create new productive civilizations'', 4, NULL, N''/icons/achievements/platinum-civilization-builder.svg'', CAST(0 AS bit), N''Civilization Builder'', 50000, 0),
    (148, N''Creation God'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create productivity universes'', 4, NULL, N''/icons/achievements/platinum-universe-creator.svg'', CAST(0 AS bit), N''Universe Creator'', 20000, 0),
    (149, N''Divine Creation'', ''2025-01-01T00:00:00.0000000'', N'''', N''Design new realities'', 4, NULL, N''/icons/achievements/platinum-reality-architect.svg'', CAST(0 AS bit), N''Reality Architect'', 40000, 0),
    (150, N''Omnipotence'', ''2025-01-01T00:00:00.0000000'', N'''', N''Control infinite universes'', 4, NULL, N''/icons/achievements/platinum-multiverse-master.svg'', CAST(0 AS bit), N''Multiverse Master'', 100000, 0),
    (151, N''Transcendence'', ''2025-01-01T00:00:00.0000000'', N'''', N''Transcend all known limits'', 4, NULL, N''/icons/achievements/onyx-transcendent.svg'', CAST(0 AS bit), N''Transcendent'', 100000, 0),
    (152, N''Origin'', ''2025-01-01T00:00:00.0000000'', N'''', N''Become the source of all productivity'', 4, NULL, N''/icons/achievements/onyx-source-code.svg'', CAST(0 AS bit), N''Source Code'', 250000, 0),
    (153, N''Unity'', ''2025-01-01T00:00:00.0000000'', N'''', N''Achieve unity with productivity itself'', 4, NULL, N''/icons/achievements/onyx-one.svg'', CAST(0 AS bit), N''One'', 500000, 0),
    (154, N''Transcendence'', ''2025-01-01T00:00:00.0000000'', N'''', N''Walk between realities'', 4, NULL, N''/icons/achievements/onyx-void-walker.svg'', CAST(0 AS bit), N''Void Walker'', 750000, 0),
    (155, N''Absolute'', ''2025-01-01T00:00:00.0000000'', N'''', N''Become the absolute form of productivity'', 4, NULL, N''/icons/achievements/onyx-absolute.svg'', CAST(0 AS bit), N''The Absolute'', 1000000, 0),
    (156, N''Smart Scheduling'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use smart scheduling suggestions 5 times'', 1, NULL, N''/icons/achievements/bronze-smart-scheduler.svg'', CAST(0 AS bit), N''Smart Scheduler'', 50, 0),
    (157, N''Conflict Resolution'', ''2025-01-01T00:00:00.0000000'', N'''', N''Resolve your first scheduling conflict'', 1, NULL, N''/icons/achievements/bronze-conflict-resolver.svg'', CAST(0 AS bit), N''Conflict Resolver'', 40, 0),
    (158, N''Availability'', ''2025-01-01T00:00:00.0000000'', N'''', N''Update availability for 7 consecutive days'', 2, NULL, N''/icons/achievements/bronze-availability-expert.svg'', CAST(0 AS bit), N''Availability Expert'', 75, 0),
    (159, N''Availability'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use availability matrix to schedule 3 events'', 2, NULL, N''/icons/achievements/bronze-matrix-navigator.svg'', CAST(0 AS bit), N''Matrix Navigator'', 60, 0),
    (160, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use bulk calendar operations for the first time'', 1, NULL, N''/icons/achievements/bronze-batch-operator.svg'', CAST(0 AS bit), N''Batch Operator'', 45, 0),
    (161, N''Perfect Scheduling'', ''2025-01-01T00:00:00.0000000'', N'''', N''Have zero conflicts for 7 consecutive days'', 3, NULL, N''/icons/achievements/silver-perfect-scheduler.svg'', CAST(0 AS bit), N''Perfect Scheduler'', 150, 0),
    (162, N''Conflict Resolution'', ''2025-01-01T00:00:00.0000000'', N'''', N''Successfully resolve 10 scheduling conflicts'', 3, NULL, N''/icons/achievements/silver-coordination-champion.svg'', CAST(0 AS bit), N''Coordination Champion'', 200, 0),
    (163, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Successfully manage 20+ events in bulk operations'', 2, NULL, N''/icons/achievements/silver-batch-master.svg'', CAST(0 AS bit), N''Batch Master'', 175, 0),
    (164, N''Smart Scheduling'', ''2025-01-01T00:00:00.0000000'', N'''', N''Select optimal time slots 25 times'', 2, NULL, N''/icons/achievements/silver-optimal-planner.svg'', CAST(0 AS bit), N''Optimal Planner'', 125, 0),
    (165, N''Family Coordination'', ''2025-01-01T00:00:00.0000000'', N'''', N''Coordinate 50 family events without conflicts'', 3, NULL, N''/icons/achievements/silver-family-harmonizer.svg'', CAST(0 AS bit), N''Family Harmonizer'', 250, 0),
    (166, N''Analytics'', ''2025-01-01T00:00:00.0000000'', N'''', N''Use scheduling analytics dashboard 10 times'', 1, NULL, N''/icons/achievements/bronze-analytics-explorer.svg'', CAST(0 AS bit), N''Analytics Explorer'', 80, 0),
    (167, N''Analytics'', ''2025-01-01T00:00:00.0000000'', N'''', N''Discover and use 5 optimal scheduling patterns'', 2, NULL, N''/icons/achievements/silver-pattern-master.svg'', CAST(0 AS bit), N''Pattern Master'', 150, 0),
    (168, N''Efficiency'', ''2025-01-01T00:00:00.0000000'', N'''', N''Achieve 95% scheduling efficiency for a month'', 4, NULL, N''/icons/achievements/gold-efficiency-guru.svg'', CAST(0 AS bit), N''Efficiency Guru'', 300, 0);
    INSERT INTO [Achievements] ([Id], [Category], [CreatedAt], [Criteria], [Description], [Difficulty], [FamilyId], [IconUrl], [IsDeleted], [Name], [PointValue], [Scope])
    VALUES (169, N''Recurring Events'', ''2025-01-01T00:00:00.0000000'', N'''', N''Create your first recurring event'', 0, NULL, N''/icons/achievements/bronze-recurrence-rookie.svg'', CAST(0 AS bit), N''Recurrence Rookie'', 35, 0),
    (170, N''Recurring Events'', ''2025-01-01T00:00:00.0000000'', N'''', N''Manage 10 different recurring event series'', 2, NULL, N''/icons/achievements/silver-series-specialist.svg'', CAST(0 AS bit), N''Series Specialist'', 120, 0),
    (171, N''Integration'', ''2025-01-01T00:00:00.0000000'', N'''', N''Export family calendar to external systems 5 times'', 2, NULL, N''/icons/achievements/silver-export-master.svg'', CAST(0 AS bit), N''Calendar Export Master'', 90, 0),
    (172, N''Master Coordination'', ''2025-01-01T00:00:00.0000000'', N'''', N''Coordinate complex multi-family events flawlessly'', 4, NULL, N''/icons/achievements/gold-scheduling-mastermind.svg'', CAST(0 AS bit), N''Scheduling Mastermind'', 500, 0),
    (173, N''System Design'', ''2025-01-01T00:00:00.0000000'', N'''', N''Design perfect scheduling systems for 100+ family members'', 4, NULL, N''/icons/achievements/gold-temporal-architect.svg'', CAST(0 AS bit), N''Temporal Architect'', 750, 0),
    (174, N''Perfect Harmony'', ''2025-01-01T00:00:00.0000000'', N'''', N''Maintain zero conflicts for 90 consecutive days'', 4, NULL, N''/icons/achievements/gold-harmony-keeper.svg'', CAST(0 AS bit), N''Harmony Keeper'', 1000, 0),
    (175, N''Calendar Mastery'', ''2025-01-01T00:00:00.0000000'', N'''', N''Master all advanced calendar features and help others'', 4, NULL, N''/icons/achievements/gold-calendar-sage.svg'', CAST(0 AS bit), N''Calendar Sage'', 800, 0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Criteria', N'Description', N'Difficulty', N'FamilyId', N'IconUrl', N'IsDeleted', N'Name', N'PointValue', N'Scope') AND [object_id] = OBJECT_ID(N'[Achievements]'))
        SET IDENTITY_INSERT [Achievements] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'ColorScheme', N'CreatedAt', N'Criteria', N'Description', N'DisplayOrder', N'IconUrl', N'IsActive', N'IsSpecial', N'Name', N'PointValue', N'PointsRequired', N'Rarity', N'Tier') AND [object_id] = OBJECT_ID(N'[Badges]'))
        SET IDENTITY_INSERT [Badges] ON;
    EXEC(N'INSERT INTO [Badges] ([Id], [Category], [ColorScheme], [CreatedAt], [Criteria], [Description], [DisplayOrder], [IconUrl], [IsActive], [IsSpecial], [Name], [PointValue], [PointsRequired], [Rarity], [Tier])
    VALUES (1, N''Character'', N''red-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 25 high priority tasks'', N''Complete 25 tasks with high priority'', 1, N''/icons/badges/character-warrior.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Warrior'', 100, 0, N''Common'', N''bronze''),
    (2, N''Character'', N''blue-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 20 learning tasks'', N''Complete 20 learning or research tasks'', 2, N''/icons/badges/character-mage.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Mage'', 100, 0, N''Common'', N''bronze''),
    (3, N''Character'', N''green-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 15 tasks early'', N''Complete 15 tasks ahead of schedule'', 3, N''/icons/badges/character-rogue.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Rogue'', 100, 0, N''Common'', N''bronze''),
    (4, N''Character'', N''gold-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 10 family tasks'', N''Help family members with 10 tasks'', 4, N''/icons/badges/character-paladin.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Paladin'', 100, 0, N''Common'', N''bronze''),
    (5, N''Character'', N''brown-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 30 tasks on time'', N''Complete 30 tasks with precision timing'', 5, N''/icons/badges/character-archer.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Archer'', 100, 0, N''Common'', N''bronze''),
    (6, N''Character'', N''black-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 20 tasks before 7 AM or after 11 PM'', N''Complete 20 tasks in stealth mode (early morning/late night)'', 6, N''/icons/badges/character-assassin.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Assassin'', 150, 0, N''Rare'', N''bronze''),
    (7, N''Character'', N''red-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 100 high priority tasks'', N''Complete 100 high priority tasks'', 7, N''/icons/badges/character-warrior-silver.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Elite Warrior'', 250, 0, N''Rare'', N''silver''),
    (8, N''Character'', N''blue-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 75 learning tasks'', N''Complete 75 learning tasks'', 8, N''/icons/badges/character-mage-silver.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Archmage'', 250, 0, N''Rare'', N''silver''),
    (9, N''Character'', N''green-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 50 tasks early'', N''Complete 50 tasks ahead of schedule'', 9, N''/icons/badges/character-rogue-silver.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Master Thief'', 250, 0, N''Rare'', N''silver''),
    (10, N''Character'', N''gold-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 50 family tasks'', N''Help family members with 50 tasks'', 10, N''/icons/badges/character-paladin-silver.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Crusader'', 250, 0, N''Rare'', N''silver''),
    (11, N''Character'', N''red-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 500 high priority tasks'', N''Complete 500 high priority tasks'', 11, N''/icons/badges/character-warrior-gold.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Legendary Warrior'', 500, 0, N''Epic'', N''gold''),
    (12, N''Character'', N''blue-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 300 learning tasks'', N''Complete 300 learning tasks'', 12, N''/icons/badges/character-mage-gold.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Grand Wizard'', 500, 0, N''Epic'', N''gold''),
    (13, N''Character'', N''green-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 200 tasks early'', N''Complete 200 tasks ahead of schedule'', 13, N''/icons/badges/character-rogue-gold.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Shadow Master'', 500, 0, N''Epic'', N''gold''),
    (14, N''Character'', N''gold-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 200 family tasks'', N''Help family members with 200 tasks'', 14, N''/icons/badges/character-paladin-gold.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Divine Champion'', 500, 0, N''Epic'', N''gold''),
    (15, N''Character'', N''brown-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 400 tasks on time'', N''Complete 400 tasks with perfect timing'', 15, N''/icons/badges/character-archer-gold.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Master Archer'', 500, 0, N''Epic'', N''gold''),
    (16, N''Character'', N''black-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 150 tasks before 7 AM or after 11 PM'', N''Complete 150 stealth tasks'', 16, N''/icons/badges/character-assassin-gold.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Night Emperor'', 750, 0, N''Legendary'', N''gold''),
    (17, N''Streak'', N''orange-bronze'', ''2025-01-01T00:00:00.0000000'', N''7 day completion streak'', N''Maintain a 7-day task completion streak'', 17, N''/icons/badges/streak-fire-starter.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Fire Starter'', 100, 0, N''Common'', N''bronze''),
    (18, N''Streak'', N''orange-bronze'', ''2025-01-01T00:00:00.0000000'', N''14 day completion streak'', N''Maintain a 14-day streak'', 18, N''/icons/badges/streak-flame-keeper.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Flame Keeper'', 150, 0, N''Common'', N''bronze''),
    (19, N''Streak'', N''orange-silver'', ''2025-01-01T00:00:00.0000000'', N''30 day completion streak'', N''Maintain a 30-day streak'', 19, N''/icons/badges/streak-inferno-master.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Inferno Master'', 300, 0, N''Rare'', N''silver''),
    (20, N''Streak'', N''orange-gold'', ''2025-01-01T00:00:00.0000000'', N''100 day completion streak'', N''Maintain a 100-day streak'', 20, N''/icons/badges/streak-eternal-flame.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Eternal Flame'', 1000, 0, N''Epic'', N''gold''),
    (21, N''Streak'', N''phoenix-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete task after 30+ day break'', N''Return to complete tasks after a 30+ day break'', 21, N''/icons/badges/streak-phoenix-rising.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Phoenix Rising'', 200, 0, N''Rare'', N''silver''),
    (22, N''Speed'', N''silver-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 10 tasks under 5 minutes each'', N''Complete 10 tasks in under 5 minutes each'', 22, N''/icons/badges/speed-quicksilver.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Quicksilver'', 75, 0, N''Common'', N''bronze''),
    (23, N''Speed'', N''yellow-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 25 tasks under 10 minutes each'', N''Complete 25 tasks in under 10 minutes each'', 23, N''/icons/badges/speed-lightning.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Lightning'', 200, 0, N''Rare'', N''silver''),
    (24, N''Speed'', N''red-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 50 tasks under 15 minutes each'', N''Complete 50 tasks in under 15 minutes each'', 24, N''/icons/badges/speed-demon.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Speed Demon'', 400, 0, N''Epic'', N''gold''),
    (25, N''Speed'', N''time-platinum'', ''2025-01-01T00:00:00.0000000'', N''Complete 100 tasks ahead of estimated time'', N''Complete 100 tasks ahead of estimated time'', 25, N''/icons/badges/speed-time-lord.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Time Lord'', 1000, 0, N''Legendary'', N''platinum''),
    (26, N''Social'', N''green-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 10 family tasks'', N''Complete 10 family tasks'', 26, N''/icons/badges/social-team-player.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Team Player'', 100, 0, N''Common'', N''bronze''),
    (27, N''Social'', N''green-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 50 family tasks'', N''Complete 50 family tasks'', 27, N''/icons/badges/social-family-hero.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Family Hero'', 300, 0, N''Rare'', N''silver''),
    (28, N''Social'', N''green-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 150 family tasks'', N''Complete 150 family tasks'', 28, N''/icons/badges/social-unity-champion.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Unity Champion'', 750, 0, N''Epic'', N''gold''),
    (29, N''Social'', N''party-silver'', ''2025-01-01T00:00:00.0000000'', N''Create and complete 5 family events'', N''Create and complete 5 family events'', 29, N''/icons/badges/social-event-master.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Event Master'', 250, 0, N''Rare'', N''silver''),
    (30, N''Milestone'', N''bronze-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete 100 total tasks'', N''Complete 100 total tasks'', 30, N''/icons/badges/milestone-centurion.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Centurion'', 200, 0, N''Common'', N''bronze''),
    (31, N''Milestone'', N''bronze-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete 500 total tasks'', N''Complete 500 total tasks'', 31, N''/icons/badges/milestone-gladiator.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Gladiator'', 500, 0, N''Rare'', N''silver''),
    (32, N''Milestone'', N''bronze-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 1000 total tasks'', N''Complete 1000 total tasks'', 32, N''/icons/badges/milestone-champion.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Champion'', 1000, 0, N''Epic'', N''gold''),
    (33, N''Milestone'', N''bronze-platinum'', ''2025-01-01T00:00:00.0000000'', N''Complete 2500 total tasks'', N''Complete 2500 total tasks'', 33, N''/icons/badges/milestone-legend.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Legend'', 2500, 0, N''Legendary'', N''platinum''),
    (34, N''Milestone'', N''rainbow-diamond'', ''2025-01-01T00:00:00.0000000'', N''Complete 5000 total tasks'', N''Complete 5000 total tasks'', 34, N''/icons/badges/milestone-immortal.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Immortal'', 5000, 0, N''Legendary'', N''diamond''),
    (35, N''Milestone'', N''cosmic-onyx'', ''2025-01-01T00:00:00.0000000'', N''Complete 10000 total tasks'', N''Complete 10000 total tasks'', 35, N''/icons/badges/milestone-transcendent.svg'', CAST(1 AS bit), CAST(0 AS bit), N''Transcendent'', 10000, 0, N''Legendary'', N''onyx''),
    (36, N''Special'', N''red-bronze'', ''2025-01-01T00:00:00.0000000'', N''Complete first task'', N''Complete your very first task'', 36, N''/icons/badges/special-first-blood.svg'', CAST(1 AS bit), CAST(1 AS bit), N''First Blood'', 50, 0, N''Common'', N''bronze''),
    (37, N''Special'', N''party-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete task on birthday'', N''Complete tasks on your birthday'', 37, N''/icons/badges/special-birthday-bash.svg'', CAST(1 AS bit), CAST(1 AS bit), N''Birthday Bash'', 500, 0, N''Rare'', N''gold''),
    (38, N''Special'', N''fireworks-gold'', ''2025-01-01T00:00:00.0000000'', N''Complete 31 tasks in January'', N''Complete 31 tasks in January'', 38, N''/icons/badges/special-new-year.svg'', CAST(1 AS bit), CAST(1 AS bit), N''New Year''''s Resolution'', 365, 0, N''Epic'', N''gold''),
    (39, N''Special'', N''love-silver'', ''2025-01-01T00:00:00.0000000'', N''Complete relationship tasks in February'', N''Complete romantic/relationship tasks in February'', 39, N''/icons/badges/special-valentine.svg'', CAST(1 AS bit), CAST(1 AS bit), N''Valentine''''s Helper'', 200, 0, N''Rare'', N''silver'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'ColorScheme', N'CreatedAt', N'Criteria', N'Description', N'DisplayOrder', N'IconUrl', N'IsActive', N'IsSpecial', N'Name', N'PointValue', N'PointsRequired', N'Rarity', N'Tier') AND [object_id] = OBJECT_ID(N'[Badges]'))
        SET IDENTITY_INSERT [Badges] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ActivityType', N'AdditionalCriteria', N'CreatedAt', N'Description', N'Difficulty', N'EndDate', N'IsActive', N'Name', N'PointReward', N'PointsRequired', N'RewardBadgeId', N'StartDate', N'TargetCount', N'TargetEntityId') AND [object_id] = OBJECT_ID(N'[Challenges]'))
        SET IDENTITY_INSERT [Challenges] ON;
    EXEC(N'INSERT INTO [Challenges] ([Id], [ActivityType], [AdditionalCriteria], [CreatedAt], [Description], [Difficulty], [EndDate], [IsActive], [Name], [PointReward], [PointsRequired], [RewardBadgeId], [StartDate], [TargetCount], [TargetEntityId])
    VALUES (1, N''DailyCompletion'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 5 tasks in a single day'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Daily Dynamo'', 50, 0, NULL, ''2025-01-01T00:00:00.0000000'', 5, NULL),
    (2, N''SpeedCompletion'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 3 tasks within 30 minutes'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Speed Racer'', 75, 100, NULL, ''2025-01-01T00:00:00.0000000'', 3, NULL),
    (3, N''EarlyCompletion'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 2 tasks before 9 AM'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Early Bird Special'', 60, 50, NULL, ''2025-01-01T00:00:00.0000000'', 2, NULL),
    (4, N''LateCompletion'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 3 tasks after 10 PM'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Night Owl Challenge'', 55, 50, NULL, ''2025-01-01T00:00:00.0000000'', 3, NULL),
    (5, N''PerfectQuality'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete all tasks with perfect quality today'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Perfect Day'', 100, 200, NULL, ''2025-01-01T00:00:00.0000000'', 1, NULL),
    (6, N''CategoryDiversity'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete tasks in 3 different categories today'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Category Explorer'', 70, 75, NULL, ''2025-01-01T00:00:00.0000000'', 3, NULL),
    (7, N''FocusSessions'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 2 focus sessions today'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Focus Warrior'', 80, 100, NULL, ''2025-01-01T00:00:00.0000000'', 2, NULL),
    (8, N''HighPriority'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 3 high-priority tasks today'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Priority Master'', 90, 150, NULL, ''2025-01-01T00:00:00.0000000'', 3, NULL),
    (9, N''FamilyTasks'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 3 family tasks today'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Social Butterfly'', 85, 100, NULL, ''2025-01-01T00:00:00.0000000'', 3, NULL),
    (10, N''SuperSpeed'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 10 tasks in under 2 hours'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Lightning Fast'', 150, 300, NULL, ''2025-01-01T00:00:00.0000000'', 10, NULL),
    (11, N''Organization'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create 2 new categories and organize tasks'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Organizer Supreme'', 95, 75, NULL, ''2025-01-01T00:00:00.0000000'', 2, NULL),
    (12, N''TemplateCreation'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create 1 task template today'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Template Creator'', 65, 50, NULL, ''2025-01-01T00:00:00.0000000'', 1, NULL),
    (13, N''Documentation'', NULL, ''2025-01-01T00:00:00.0000000'', N''Add detailed notes to 5 tasks today'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Note Taker'', 75, 75, NULL, ''2025-01-01T00:00:00.0000000'', 5, NULL),
    (14, N''BoardUsage'', NULL, ''2025-01-01T00:00:00.0000000'', N''Organize 10 tasks using boards today'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Board Master'', 80, 100, NULL, ''2025-01-01T00:00:00.0000000'', 10, NULL),
    (15, N''ReminderSetting'', NULL, ''2025-01-01T00:00:00.0000000'', N''Set 5 reminders for future tasks'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Reminder Pro'', 60, 50, NULL, ''2025-01-01T00:00:00.0000000'', 5, NULL),
    (16, N''WeeklyCompletion'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 25 tasks in a week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Weekly Warrior'', 200, 500, NULL, ''2025-01-01T00:00:00.0000000'', 25, NULL),
    (17, N''ConsistentDaily'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete at least 1 task every day for a week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Consistency King'', 250, 300, NULL, ''2025-01-01T00:00:00.0000000'', 7, NULL),
    (18, N''WeeklySpeed'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 50 tasks in under 5 minutes each this week'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Speed Week'', 400, 1000, NULL, ''2025-01-01T00:00:00.0000000'', 50, NULL),
    (19, N''WeeklyPerfection'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete all tasks with perfect quality for a week'', 5, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Perfect Week'', 500, 1500, NULL, ''2025-01-01T00:00:00.0000000'', 7, NULL),
    (20, N''WeeklyLeader'', NULL, ''2025-01-01T00:00:00.0000000'', N''Lead family leaderboard for a week'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Family Champion'', 350, 800, NULL, ''2025-01-01T00:00:00.0000000'', 7, NULL),
    (21, N''WeeklyFocus'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 20 focus sessions this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Focus Master'', 300, 600, NULL, ''2025-01-01T00:00:00.0000000'', 20, NULL),
    (22, N''CategoryMastery'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete tasks in 10 different categories this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Category Conqueror'', 275, 400, NULL, ''2025-01-01T00:00:00.0000000'', 10, NULL),
    (23, N''WeeklyPriority'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 20 high-priority tasks this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Priority Pro'', 325, 500, NULL, ''2025-01-01T00:00:00.0000000'', 20, NULL),
    (24, N''WeeklyEarly'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 15 tasks before 9 AM this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Early Bird Week'', 280, 350, NULL, ''2025-01-01T00:00:00.0000000'', 15, NULL),
    (25, N''WeeklyCollaboration'', NULL, ''2025-01-01T00:00:00.0000000'', N''Help family complete 15 tasks this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Collaboration Master'', 290, 400, NULL, ''2025-01-01T00:00:00.0000000'', 15, NULL),
    (26, N''WeeklyTemplates'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create 5 task templates this week'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Template Week'', 220, 250, NULL, ''2025-01-01T00:00:00.0000000'', 5, NULL),
    (27, N''WeeklyOrganization'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create 10 categories and organize perfectly'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Organization Week'', 240, 300, NULL, ''2025-01-01T00:00:00.0000000'', 10, NULL),
    (28, N''WeeklyBoards'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create and organize 5 boards this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Board Architect'', 260, 350, NULL, ''2025-01-01T00:00:00.0000000'', 5, NULL),
    (29, N''WeeklyDocumentation'', NULL, ''2025-01-01T00:00:00.0000000'', N''Add comprehensive notes to 25 tasks'', 2, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Documentation Week'', 230, 200, NULL, ''2025-01-01T00:00:00.0000000'', 25, NULL),
    (30, N''WeeklyAutomation'', NULL, ''2025-01-01T00:00:00.0000000'', N''Set up 10 recurring tasks this week'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Automation Week'', 270, 400, NULL, ''2025-01-01T00:00:00.0000000'', 10, NULL),
    (31, N''MonthlyCompletion'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 100 tasks in a month'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Monthly Master'', 500, 0, NULL, ''2025-01-01T00:00:00.0000000'', 100, NULL),
    (32, N''StreakMaintenance'', NULL, ''2025-01-01T00:00:00.0000000'', N''Maintain a 30-day streak'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Streak Legend'', 750, 0, NULL, ''2025-01-01T00:00:00.0000000'', 30, NULL),
    (33, N''MonthlyPerfection'', NULL, ''2025-01-01T00:00:00.0000000'', N''Perfect quality for entire month'', 5, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Monthly Perfectionist'', 1000, 0, NULL, ''2025-01-01T00:00:00.0000000'', 30, NULL),
    (34, N''MonthlySpeed'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 200 tasks in under 5 minutes each'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Speed Month'', 800, 0, NULL, ''2025-01-01T00:00:00.0000000'', 200, NULL),
    (35, N''MonthlyDominance'', NULL, ''2025-01-01T00:00:00.0000000'', N''Lead family for entire month'', 5, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Family Emperor'', 900, 0, NULL, ''2025-01-01T00:00:00.0000000'', 30, NULL),
    (36, N''MonthlyFocus'', NULL, ''2025-01-01T00:00:00.0000000'', N''Complete 100 focus sessions in a month'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Focus Transcendence'', 700, 0, NULL, ''2025-01-01T00:00:00.0000000'', 100, NULL),
    (37, N''MonthlySystemBuilding'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create comprehensive productivity system'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''System Architect'', 600, 0, NULL, ''2025-01-01T00:00:00.0000000'', 1, NULL),
    (38, N''MonthlyInnovation'', NULL, ''2025-01-01T00:00:00.0000000'', N''Create 50 unique tasks and templates'', 3, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Innovation Master'', 650, 0, NULL, ''2025-01-01T00:00:00.0000000'', 50, NULL),
    (39, N''MonthlyCommunity'', NULL, ''2025-01-01T00:00:00.0000000'', N''Help 50 family members achieve their goals'', 4, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Community Builder'', 850, 0, NULL, ''2025-01-01T00:00:00.0000000'', 50, NULL),
    (40, N''AchievementUnlock'', NULL, ''2025-01-01T00:00:00.0000000'', N''Unlock 20 different achievements'', 5, ''2025-12-31T00:00:00.0000000'', CAST(1 AS bit), N''Ultimate Achiever'', 1000, 0, NULL, ''2025-01-01T00:00:00.0000000'', 20, NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ActivityType', N'AdditionalCriteria', N'CreatedAt', N'Description', N'Difficulty', N'EndDate', N'IsActive', N'Name', N'PointReward', N'PointsRequired', N'RewardBadgeId', N'StartDate', N'TargetCount', N'TargetEntityId') AND [object_id] = OBJECT_ID(N'[Challenges]'))
        SET IDENTITY_INSERT [Challenges] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Description', N'ExpirationDate', N'IconPath', N'IsActive', N'MinimumLevel', N'Name', N'PointCost', N'Quantity') AND [object_id] = OBJECT_ID(N'[Rewards]'))
        SET IDENTITY_INSERT [Rewards] ON;
    EXEC(N'INSERT INTO [Rewards] ([Id], [Category], [CreatedAt], [Description], [ExpirationDate], [IconPath], [IsActive], [MinimumLevel], [Name], [PointCost], [Quantity])
    VALUES (1, N''Customization'', ''2025-01-01T00:00:00.0000000'', N''Unlock avatar customization options'', NULL, N''/icons/rewards/custom-avatar.svg'', CAST(1 AS bit), 2, N''Custom Avatar'', 100, NULL),
    (2, N''Customization'', ''2025-01-01T00:00:00.0000000'', N''Unlock premium theme color schemes'', NULL, N''/icons/rewards/theme-colors.svg'', CAST(1 AS bit), 3, N''Theme Colors'', 150, NULL),
    (3, N''Customization'', ''2025-01-01T00:00:00.0000000'', N''Unlock beautiful profile backgrounds'', NULL, N''/icons/rewards/profile-backgrounds.svg'', CAST(1 AS bit), 4, N''Profile Backgrounds'', 200, NULL),
    (4, N''Customization'', ''2025-01-01T00:00:00.0000000'', N''Unlock premium typography options'', NULL, N''/icons/rewards/custom-fonts.svg'', CAST(1 AS bit), 5, N''Custom Fonts'', 250, NULL),
    (5, N''Premium'', ''2025-01-01T00:00:00.0000000'', N''Unlock animated avatar options'', NULL, N''/icons/rewards/animated-avatars.svg'', CAST(1 AS bit), 10, N''Animated Avatars'', 500, NULL),
    (6, N''Premium'', ''2025-01-01T00:00:00.0000000'', N''Add magical particle effects'', NULL, N''/icons/rewards/particle-effects.svg'', CAST(1 AS bit), 15, N''Particle Effects'', 800, NULL),
    (7, N''Premium'', ''2025-01-01T00:00:00.0000000'', N''Themes that change with progress'', NULL, N''/icons/rewards/dynamic-themes.svg'', CAST(1 AS bit), 20, N''Dynamic Themes'', 1000, NULL),
    (8, N''Audio'', ''2025-01-01T00:00:00.0000000'', N''Personalized audio feedback'', NULL, N''/icons/rewards/custom-sounds.svg'', CAST(1 AS bit), 12, N''Custom Sound Effects'', 600, NULL),
    (9, N''Audio'', ''2025-01-01T00:00:00.0000000'', N''Epic completion celebrations'', NULL, N''/icons/rewards/victory-fanfares.svg'', CAST(1 AS bit), 15, N''Victory Fanfares'', 750, NULL),
    (10, N''Audio'', ''2025-01-01T00:00:00.0000000'', N''Focus-enhancing background audio'', NULL, N''/icons/rewards/ambient-sounds.svg'', CAST(1 AS bit), 8, N''Ambient Soundscapes'', 400, NULL),
    (11, N''Elite'', ''2025-01-01T00:00:00.0000000'', N''Futuristic holographic interface'', NULL, N''/icons/rewards/holographic-effects.svg'', CAST(1 AS bit), 30, N''Holographic Effects'', 2000, NULL),
    (12, N''Legendary'', ''2025-01-01T00:00:00.0000000'', N''Bend space and time in your interface'', NULL, N''/icons/rewards/reality-distortion.svg'', CAST(1 AS bit), 50, N''Reality Distortion'', 5000, NULL),
    (13, N''Mythic'', ''2025-01-01T00:00:00.0000000'', N''Multiple reality interface overlay'', NULL, N''/icons/rewards/quantum-interface.svg'', CAST(1 AS bit), 75, N''Quantum Interface'', 10000, NULL),
    (14, N''Cosmic'', ''2025-01-01T00:00:00.0000000'', N''Universe-spanning visual themes'', NULL, N''/icons/rewards/cosmic-themes.svg'', CAST(1 AS bit), 100, N''Cosmic Themes'', 15000, NULL),
    (15, N''Transcendent'', ''2025-01-01T00:00:00.0000000'', N''Beyond physical avatar forms'', NULL, N''/icons/rewards/avatar-transcendence.svg'', CAST(1 AS bit), 150, N''Avatar Transcendence'', 25000, NULL),
    (16, N''Character'', ''2025-01-01T00:00:00.0000000'', N''Unlock the Warrior character class'', NULL, N''/icons/rewards/warrior-unlock.svg'', CAST(1 AS bit), 5, N''Warrior Class'', 250, NULL),
    (17, N''Character'', ''2025-01-01T00:00:00.0000000'', N''Unlock the Mage character class'', NULL, N''/icons/rewards/mage-unlock.svg'', CAST(1 AS bit), 8, N''Mage Class'', 400, NULL),
    (18, N''Character'', ''2025-01-01T00:00:00.0000000'', N''Unlock the Guardian character class'', NULL, N''/icons/rewards/guardian-unlock.svg'', CAST(1 AS bit), 12, N''Guardian Class'', 600, NULL),
    (19, N''Character'', ''2025-01-01T00:00:00.0000000'', N''Unlock the Speedster character class'', NULL, N''/icons/rewards/speedster-unlock.svg'', CAST(1 AS bit), 15, N''Speedster Class'', 800, NULL),
    (20, N''Character'', ''2025-01-01T00:00:00.0000000'', N''Unlock the Healer character class'', NULL, N''/icons/rewards/healer-unlock.svg'', CAST(1 AS bit), 18, N''Healer Class'', 1000, NULL),
    (21, N''Boost'', ''2025-01-01T00:00:00.0000000'', N''Double points for next 5 high-priority tasks'', NULL, N''/icons/rewards/priority-boost.svg'', CAST(1 AS bit), 6, N''Priority Boost'', 300, 10),
    (22, N''Boost'', ''2025-01-01T00:00:00.0000000'', N''Protect your streak for 3 days'', NULL, N''/icons/rewards/streak-shield.svg'', CAST(1 AS bit), 10, N''Streak Shield'', 500, 5),
    (23, N''Boost'', ''2025-01-01T00:00:00.0000000'', N''Double XP for 24 hours'', NULL, N''/icons/rewards/xp-multiplier.svg'', CAST(1 AS bit), 8, N''XP Multiplier'', 400, 10),
    (24, N''Boost'', ''2025-01-01T00:00:00.0000000'', N''Enhanced focus session benefits'', NULL, N''/icons/rewards/focus-enhancer.svg'', CAST(1 AS bit), 7, N''Focus Enhancer'', 350, 15),
    (25, N''Boost'', ''2025-01-01T00:00:00.0000000'', N''Bonus points for fast completion'', NULL, N''/icons/rewards/speed-boost.svg'', CAST(1 AS bit), 5, N''Speed Boost'', 250, 20),
    (26, N''Collectible'', ''2025-01-01T00:00:00.0000000'', N''Rare digital trophy for your collection'', NULL, N''/icons/rewards/golden-trophy.svg'', CAST(1 AS bit), 30, N''Golden Trophy'', 2000, 1),
    (27, N''Collectible'', ''2025-01-01T00:00:00.0000000'', N''Mystical crystal containing ancient wisdom'', NULL, N''/icons/rewards/crystal-orb.svg'', CAST(1 AS bit), 35, N''Crystal Orb'', 3000, 1),
    (28, N''Collectible'', ''2025-01-01T00:00:00.0000000'', N''Feather from the legendary Phoenix'', NULL, N''/icons/rewards/phoenix-feather.svg'', CAST(1 AS bit), 50, N''Phoenix Feather'', 5000, 1),
    (29, N''Collectible'', ''2025-01-01T00:00:00.0000000'', N''Scale from an ancient dragon'', NULL, N''/icons/rewards/dragon-scale.svg'', CAST(1 AS bit), 60, N''Dragon Scale'', 7500, 1),
    (30, N''Cosmic'', ''2025-01-01T00:00:00.0000000'', N''Stardust from the birth of universe'', NULL, N''/icons/rewards/cosmic-dust.svg'', CAST(1 AS bit), 75, N''Cosmic Dust'', 10000, 1)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'CreatedAt', N'Description', N'ExpirationDate', N'IconPath', N'IsActive', N'MinimumLevel', N'Name', N'PointCost', N'Quantity') AND [object_id] = OBJECT_ID(N'[Rewards]'))
        SET IDENTITY_INSERT [Rewards] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Achievements_FamilyId] ON [Achievements] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_AnalyticsQueries_UserId] ON [AnalyticsQueries] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Boards_UserId] ON [Boards] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Categories_UserId] ON [Categories] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_ChallengeProgresses_ChallengeId] ON [ChallengeProgresses] ([ChallengeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_ChallengeProgresses_UserId] ON [ChallengeProgresses] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_ChecklistItems_TaskId] ON [ChecklistItems] ([TaskId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_ChecklistTemplateItems_TaskTemplateId] ON [ChecklistTemplateItems] ([TaskTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_DashboardWidgets_UserId] ON [DashboardWidgets] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_DataExportRequests_UserId] ON [DataExportRequests] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Distractions_FocusSessionId] ON [Distractions] ([FocusSessionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Families_CreatedById] ON [Families] ([CreatedById]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyAchievementMembers_AchievementId] ON [FamilyAchievementMembers] ([AchievementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyAchievementMembers_FamilyMemberId] ON [FamilyAchievementMembers] ([FamilyMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyAchievements_FamilyId] ON [FamilyAchievements] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyActivities_ActorId] ON [FamilyActivities] ([ActorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyActivities_FamilyId] ON [FamilyActivities] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyActivities_TargetId] ON [FamilyActivities] ([TargetId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyCalendarEvents_CreatedById] ON [FamilyCalendarEvents] ([CreatedById]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyCalendarEvents_FamilyId] ON [FamilyCalendarEvents] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyEventAttendees_EventId] ON [FamilyEventAttendees] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyEventAttendees_FamilyMemberId] ON [FamilyEventAttendees] ([FamilyMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyEventReminders_EventId] ON [FamilyEventReminders] ([EventId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyMemberAvailabilities_FamilyMemberId] ON [FamilyMemberAvailabilities] ([FamilyMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyMembers_FamilyId] ON [FamilyMembers] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyMembers_RoleId] ON [FamilyMembers] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyMembers_UserId] ON [FamilyMembers] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FamilyRolePermissions_RoleId] ON [FamilyRolePermissions] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FocusSessions_TaskId] ON [FocusSessions] ([TaskId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_FocusSessions_UserId] ON [FocusSessions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Invitations_CreatedById] ON [Invitations] ([CreatedById]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Invitations_FamilyId] ON [Invitations] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Invitations_RoleId] ON [Invitations] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Notes_TaskItemId] ON [Notes] ([TaskItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Notes_UserId] ON [Notes] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_NotificationPreferences_FamilyId] ON [NotificationPreferences] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_NotificationPreferences_UserId] ON [NotificationPreferences] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Notifications_CreatedByUserId] ON [Notifications] ([CreatedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_PointTransactions_TaskId] ON [PointTransactions] ([TaskId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_PointTransactions_TemplateId] ON [PointTransactions] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_PointTransactions_UserId] ON [PointTransactions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_RateLimitTierConfigs_SubscriptionTierId] ON [RateLimitTierConfigs] ([SubscriptionTierId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Reminders_TaskItemId] ON [Reminders] ([TaskItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Reminders_UserId] ON [Reminders] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_SavedFilters_UserId] ON [SavedFilters] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_SecurityAuditLogs_UserId] ON [SecurityAuditLogs] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tags_UserId] ON [Tags] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TaskAutomationRules_TemplateId] ON [TaskAutomationRules] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_ApprovedByUserId] ON [Tasks] ([ApprovedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_AssignedByUserId] ON [Tasks] ([AssignedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_AssignedToFamilyMemberId] ON [Tasks] ([AssignedToFamilyMemberId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_AssignedToId] ON [Tasks] ([AssignedToId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_BoardId] ON [Tasks] ([BoardId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_CategoryId] ON [Tasks] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_FamilyId] ON [Tasks] ([FamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Tasks_UserId] ON [Tasks] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TaskTags_TagId] ON [TaskTags] ([TagId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TaskTemplates_TemplateCategoryId] ON [TaskTemplates] ([TemplateCategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TaskTemplates_UserId] ON [TaskTemplates] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplateMarketplace_ApproverId] ON [TemplateMarketplace] ([ApproverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplateMarketplace_CreatorId] ON [TemplateMarketplace] ([CreatorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplateMarketplace_TemplateId] ON [TemplateMarketplace] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplatePurchases_TemplateId] ON [TemplatePurchases] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplatePurchases_UserId] ON [TemplatePurchases] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplateUsageAnalytics_TemplateId] ON [TemplateUsageAnalytics] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_TemplateUsageAnalytics_UserId] ON [TemplateUsageAnalytics] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserAchievements_AchievementId] ON [UserAchievements] ([AchievementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserAchievements_UserId] ON [UserAchievements] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserApiQuotas_SubscriptionTierId] ON [UserApiQuotas] ([SubscriptionTierId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserApiQuotas_UserId] ON [UserApiQuotas] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserBadges_BadgeId] ON [UserBadges] ([BadgeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserBadges_UserId] ON [UserBadges] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserChallenges_ChallengeId] ON [UserChallenges] ([ChallengeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserChallenges_UserId] ON [UserChallenges] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserDevices_UserId] ON [UserDevices] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserProgresses_UserId] ON [UserProgresses] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserRewards_RewardId] ON [UserRewards] ([RewardId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserRewards_UserId] ON [UserRewards] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email_Unique] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_Users_PrimaryFamilyId] ON [Users] ([PrimaryFamilyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Username_Unique] ON [Users] ([Username]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_UserSessions_UserId] ON [UserSessions] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    CREATE INDEX [IX_WorkflowSteps_TemplateId] ON [WorkflowSteps] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [Achievements] ADD CONSTRAINT [FK_Achievements_Families_FamilyId] FOREIGN KEY ([FamilyId]) REFERENCES [Families] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [AnalyticsQueries] ADD CONSTRAINT [FK_AnalyticsQueries_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [Boards] ADD CONSTRAINT [FK_Boards_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [Categories] ADD CONSTRAINT [FK_Categories_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [ChallengeProgresses] ADD CONSTRAINT [FK_ChallengeProgresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [ChecklistItems] ADD CONSTRAINT [FK_ChecklistItems_Tasks_TaskId] FOREIGN KEY ([TaskId]) REFERENCES [Tasks] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [ChecklistTemplateItems] ADD CONSTRAINT [FK_ChecklistTemplateItems_TaskTemplates_TaskTemplateId] FOREIGN KEY ([TaskTemplateId]) REFERENCES [TaskTemplates] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [DashboardWidgets] ADD CONSTRAINT [FK_DashboardWidgets_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [DataExportRequests] ADD CONSTRAINT [FK_DataExportRequests_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [Distractions] ADD CONSTRAINT [FK_Distractions_FocusSessions_FocusSessionId] FOREIGN KEY ([FocusSessionId]) REFERENCES [FocusSessions] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    ALTER TABLE [Families] ADD CONSTRAINT [FK_Families_Users_CreatedById] FOREIGN KEY ([CreatedById]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20250531191935_InitialBaseline'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20250531191935_InitialBaseline', N'9.0.5');
END;

COMMIT;
GO

