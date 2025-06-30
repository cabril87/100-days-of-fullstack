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
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Repositories;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Middleware;
using System.Text.Json.Serialization;
using QRCoder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using TaskTrackerAPI.Extensions;
using Microsoft.AspNetCore.HttpsPolicy;
using TaskTrackerAPI.Hubs;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using TaskTrackerAPI.DTOs.Auth;
using Microsoft.AspNetCore.DataProtection;
using TaskTrackerAPI.ModelBinders;
using TaskTrackerAPI.Filters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.OpenApi.Models;
using System.IO;
using System.Security.Cryptography;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Net.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.ResponseCompression;
using System.Text.Json.Serialization.Metadata;
using System.IO.Compression;

namespace TaskTrackerAPI;

// Making Program class public so it can be used for integration testing
public class Program
{
    public static async Task Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers(options =>
            {
                // Add our custom model binder provider
                options.ModelBinderProviders.Insert(0, new SanitizedStringModelBinderProvider());

                // Add our model state validation filter
                options.Filters.Add<ValidateModelStateFilter>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            });

        // Add security headers service
        builder.Services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-XSRF-TOKEN";
        });

        // Add validation pipeline services
        builder.Services.AddValidationPipeline();

        // Configure HTTP Security Headers
        builder.Services.AddHsts(options =>
        {
            options.Preload = true;
            options.IncludeSubDomains = true;
            options.MaxAge = TimeSpan.FromDays(365);
        });

        // Add API Versioning
        builder.Services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new HeaderApiVersionReader("X-API-Version"),
                new QueryStringApiVersionReader("api-version")
            );
        });

        // Add versioned API explorer
        builder.Services.AddVersionedApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        // Add services to the container.
        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddCors(options =>
        {
            // Development CORS policy - permissive for local testing
            options.AddPolicy("DevCors", (corsBuilder) =>
            {
                corsBuilder.SetIsOriginAllowed(_ => true) // Allow any origin including null (file://)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials() // Enable credentials for cookie authentication
                    .WithExposedHeaders("Content-Disposition", "Set-Cookie", "X-CSRF-Status");
            });

            // Docker development CORS policy - for when testing with Docker
            options.AddPolicy("DockerDevCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins(
                       "http://localhost:3000",    // Next.js frontend
                       "http://localhost:3001",    // Next.js frontend
                       "http://localhost:5173",    // Vite frontend
                       "http://localhost:8080",    // Webpack common port
                       "http://localhost",         // Generic localhost
                       "http://host.docker.internal:3000",  // Docker host Next.js
                       "http://host.docker.internal:3001",  // Docker host Next.js
                       "http://host.docker.internal:5173"   // Docker host Vite
                    )
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials() // Essential for cookie authentication
                    .WithExposedHeaders("Content-Disposition", "Set-Cookie", "X-CSRF-Status");
            });

            // Staging CORS policy - more restricted but allows test domains
            options.AddPolicy("StagingCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins(
                       "https://staging.yourdomain.com",
                       "https://api-staging.yourdomain.com",
                       "https://test.yourdomain.com"
                    )
                    .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .WithHeaders("Authorization", "Content-Type", "Accept", "X-XSRF-TOKEN", "X-CSRF-TOKEN")
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Disposition", "Set-Cookie");
            });

            // Production CORS policy - strict and secure
            options.AddPolicy("ProdCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins(
                       "https://yourdomain.com",
                       "https://api.yourdomain.com",
                       "https://app.yourdomain.com"
                    )
                    .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .WithHeaders("Authorization", "Content-Type", "Accept", "X-XSRF-TOKEN", "X-CSRF-TOKEN")
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Disposition", "Set-Cookie");
            });
        });

        // Register AutoMapper
        builder.Services.AddAutoMapper(config =>
        {
            config.AddMaps(typeof(Program).Assembly);
        });

        // Add Memory Cache for rate limiting and response caching
        builder.Services.AddMemoryCache();

        // Add distributed cache for more robust caching across multiple instances
        builder.Services.AddDistributedMemoryCache();

        // Register repository
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>();
        builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
        builder.Services.AddScoped<ITagRepository, TagRepository>();
        builder.Services.AddScoped<IReminderRepository, ReminderRepository>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<IFamilyRepository, FamilyRepository>();
        builder.Services.AddScoped<IFamilyMemberRepository, FamilyMemberRepository>();
        builder.Services.AddScoped<IFamilyRoleRepository, FamilyRoleRepository>();
        builder.Services.AddScoped<IFocusRepository, FocusRepository>();
        builder.Services.AddScoped<IChecklistItemRepository, ChecklistItemRepository>();

        // Add repositories that exist in the project
        builder.Services.AddScoped<IInvitationRepository, InvitationRepository>();
        builder.Services.AddScoped<IUserDeviceRepository, UserDeviceRepository>();
        builder.Services.AddScoped<IFamilyAchievementRepository, FamilyAchievementRepository>();
        builder.Services.AddScoped<IFamilyCalendarRepository, FamilyCalendarRepository>();
        builder.Services.AddScoped<IUserCalendarRepository, UserCalendarRepository>();
        builder.Services.AddScoped<IFamilyActivityRepository, FamilyActivityRepository>();

        // Add notification preference repository
        builder.Services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();

        // Add password reset repository
        builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();

        // Add security question repository
        builder.Services.AddScoped<ISecurityQuestionRepository, SecurityQuestionRepository>();

        // Register AuthHelper (critical dependency)
        builder.Services.AddScoped<AuthHelper>();

        // Register business services
        builder.Services.AddScoped<ITaskService, TaskService>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        builder.Services.AddScoped<ITagService, TagService>();
        builder.Services.AddScoped<IReminderService, ReminderService>();
        builder.Services.AddScoped<INotificationService, NotificationService>();
        
        // ✨ ENTERPRISE: Unified Dashboard Service - Comprehensive dashboard data aggregation
        builder.Services.AddScoped<IUnifiedDashboardService, UnifiedDashboardService>();

        // Add services that exist in the project
        builder.Services.AddScoped<IFamilyService, FamilyService>();
        builder.Services.AddScoped<IFamilyAchievementService, FamilyAchievementService>();
        builder.Services.AddScoped<IFamilyActivityService, FamilyActivityService>();
        builder.Services.AddScoped<IInvitationService, InvitationService>();

        // Add notification preference service
        builder.Services.AddScoped<INotificationPreferenceService, NotificationPreferenceService>();

        // Add security question service
        builder.Services.AddScoped<ISecurityQuestionService, SecurityQuestionService>();

        // Add family seeding service (Admin only)
        builder.Services.AddScoped<IFamilySeedingService, FamilySeedingService>();

        // Add smart role recommendation service
        builder.Services.AddScoped<ISmartRoleRecommendationService, SmartRoleRecommendationService>();

        // Add unified real-time service (consolidates 5 services into 1 for better performance)
        builder.Services.AddScoped<IUnifiedRealTimeService, UnifiedRealTimeService>();

        builder.Services.AddScoped<IUserDeviceService, UserDeviceService>();
        builder.Services.AddScoped<IFamilyCalendarService, FamilyCalendarService>();
        builder.Services.AddScoped<IUserCalendarService, UserCalendarService>();
        builder.Services.AddScoped<ISmartSchedulingService, SmartSchedulingService>();
        builder.Services.AddScoped<ITaskSharingService, TaskSharingService>();

        builder.Services.AddScoped<IGamificationService, GamificationService>();
        builder.Services.AddScoped<IUserActivityService, UserActivityService>();
        builder.Services.AddScoped<IFocusService, FocusService>();
        builder.Services.AddScoped<ITaskPriorityService, TaskPriorityService>();

        // Register auth services
        builder.Services.AddScoped<IAuthService, AuthService>();

        // Register admin services
        builder.Services.AddScoped<IAdminService, AdminService>();

        // Register email and password reset services
        builder.Services.AddScoped<IEmailService, EmailService>();
        builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();

        // Register MFA service
        builder.Services.AddScoped<IMFAService, MFAService>();

        // Re-add working services and add any missing ones from before
        builder.Services.AddScoped<IReminderService, ReminderService>();
        builder.Services.AddScoped<IBoardService, BoardService>();
        builder.Services.AddScoped<IFamilyMemberService, FamilyMemberService>();
        builder.Services.AddScoped<IFamilyRoleService, FamilyRoleService>();
        builder.Services.AddScoped<IAchievementService, AchievementService>();
        builder.Services.AddScoped<IBadgeService, BadgeService>();

        // Register TaskTemplateService (required for TaskTemplatesController)
        builder.Services.AddScoped<ITaskTemplateService, TaskTemplateService>();

        // Register marketplace services
        builder.Services.AddScoped<IPointsService, PointsService>();

        // Register SignalR for real-time updates
        builder.Services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = builder.Environment.IsDevelopment();
            options.MaximumReceiveMessageSize = 102400; // 100KB
        });

        // Register calendar real-time service (kept separate due to complex scheduling logic)
        builder.Services.AddScoped<ICalendarRealTimeService, CalendarRealTimeService>();

        // Register HttpContextAccessor and UserAccessor
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<IUserAccessor, UserAccessor>();

        // Register TaskPriorityService
        builder.Services.AddScoped<ITaskPriorityService, TaskPriorityService>();

        // Register TaskStatisticsService
        builder.Services.AddScoped<ITaskStatisticsService, TaskStatisticsService>();

        // Register Board repositories and services
        builder.Services.AddScoped<IBoardRepository, BoardRepository>();

        // Register Enhanced Board Repositories (Phase 2 - Repository Pattern)
        builder.Services.AddScoped<IBoardColumnRepository, BoardColumnRepository>();
        builder.Services.AddScoped<IBoardSettingsRepository, BoardSettingsRepository>();
        builder.Services.AddScoped<IBoardTemplateRepository, BoardTemplateRepository>();

        // Register Enhanced Board Services (Phase 3 - Service Layer)
        builder.Services.AddScoped<IBoardColumnService, BoardColumnService>();
        builder.Services.AddScoped<IBoardSettingsService, BoardSettingsService>();
        builder.Services.AddScoped<IBoardTemplateService, BoardTemplateService>();

        // Register Reminder, TaskTemplate, and Notification repositories
        builder.Services.AddScoped<IReminderRepository, ReminderRepository>();
        builder.Services.AddScoped<ITaskTemplateRepository, TaskTemplateRepository>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<IChecklistItemRepository, ChecklistItemRepository>();

        // Register new gamification repositories (repository pattern compliance)
        builder.Services.AddScoped<ISecurityRepository, SecurityRepository>();
        builder.Services.AddScoped<IAchievementRepository, AchievementRepository>();
        builder.Services.AddScoped<IBadgeRepository, BadgeRepository>();
        builder.Services.AddScoped<IPointsRepository, PointsRepository>();
        builder.Services.AddScoped<IThreatIntelligenceRepository, ThreatIntelligenceRepository>();

        // Register new security & monitoring repositories (Phase 2 repository pattern compliance)
        builder.Services.AddScoped<IGeolocationRepository, GeolocationRepository>();
        builder.Services.AddScoped<IFailedLoginRepository, FailedLoginRepository>();
        builder.Services.AddScoped<ISessionManagementRepository, SessionManagementRepository>();

        builder.Services.AddScoped<IUserSubscriptionRepository, UserSubscriptionRepository>();

        // Register DeadlineNotificationService as a hosted service
        builder.Services.AddHostedService<DeadlineNotificationService>();

        // Register QRCode Generator as singleton
        builder.Services.AddSingleton<QRCodeGenerator>();
        builder.Services.AddSingleton<QRCodeHelper>();

        // Register UserSubscriptionService
        builder.Services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();

        // Register RateLimitBackoffHelper as singleton
        builder.Services.AddHttpClient();
        builder.Services.AddSingleton<Utils.RateLimitBackoffHelper>(sp =>
        {
            HttpClient httpClient = sp.GetRequiredService<IHttpClientFactory>().CreateClient();
            ILogger<Utils.RateLimitBackoffHelper> logger = sp.GetRequiredService<ILogger<Utils.RateLimitBackoffHelper>>();
            return new Utils.RateLimitBackoffHelper(httpClient, logger);
        });

        // Register SecurityService
        builder.Services.AddScoped<ISecurityService, SecurityService>();

        // Register Security Monitoring Service
        builder.Services.AddScoped<ISecurityMonitoringService, SecurityMonitoringService>();

        // Register Failed Login Service
        builder.Services.AddScoped<IFailedLoginService, FailedLoginService>();

        // Register Geolocation Service
        builder.Services.AddScoped<IGeolocationService, GeolocationService>();

        // Register Session Management Service
        builder.Services.AddScoped<ISessionManagementService, SessionManagementService>();

        // Register Advanced Security Services
        builder.Services.AddScoped<IThreatIntelligenceService, ThreatIntelligenceService>();
        // Analytics Services - consolidated into unified analytics
        // IBehavioralAnalyticsService, IMLAnalyticsService, IAdvancedAnalyticsService functionality moved to IUnifiedAnalyticsService

        // Register Analytics repositories and services (Day 59)
        builder.Services.AddScoped<ISavedFilterRepository, SavedFilterRepository>();
        builder.Services.AddScoped<ISavedFilterService, SavedFilterService>();
        builder.Services.AddScoped<IDataExportRepository, DataExportRepository>();
        builder.Services.AddScoped<IDataExportService, DataExportService>();
        builder.Services.AddScoped<IDashboardWidgetRepository, DashboardWidgetRepository>();
        builder.Services.AddScoped<IDataVisualizationService, DataVisualizationService>();
        
        // Register Unified Analytics (consolidates 7+ analytics services)
        builder.Services.AddScoped<IUnifiedAnalyticsRepository, UnifiedAnalyticsRepository>();
        builder.Services.AddScoped<IUnifiedAnalyticsService, TaskTrackerAPI.Services.Analytics.UnifiedAnalyticsService>();

        // Register Background Service Status Management (Day 61)
        builder.Services.AddScoped<IBackgroundServiceStatusRepository, BackgroundServiceStatusRepository>();
        // IBackgroundServiceStatusService functionality moved to IUnifiedAnalyticsService

        // Register Search repositories and services
        builder.Services.AddScoped<ISavedSearchRepository, SavedSearchRepository>();
        builder.Services.AddScoped<ISavedSearchService, SavedSearchService>();
        builder.Services.AddScoped<IUnifiedSearchService, UnifiedSearchService>();

// Photo Attachment Services  
builder.Services.AddScoped<IPhotoAttachmentRepository, PhotoAttachmentRepository>();
builder.Services.AddScoped<IPhotoAttachmentService, PhotoAttachmentService>();

        // Add response compression
        builder.Services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
        });

        // Configure Brotli compression level
        builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
        {
            options.Level = CompressionLevel.Optimal;
        });

        // Configure Gzip compression level
        builder.Services.Configure<GzipCompressionProviderOptions>(options =>
        {
            options.Level = CompressionLevel.Optimal;
        });

        // Load configuration from environment variables
        if (builder.Environment.IsDevelopment())
        {
            builder.Configuration["AppSettings:TokenKey"] = builder.Configuration["TokenKey"] ??
                builder.Configuration["AppSettings:TokenKey"];
            builder.Configuration["AppSettings:PasswordKey"] = builder.Configuration["PasswordKey"] ??
                builder.Configuration["AppSettings:PasswordKey"];
        }

        string? tokenKeyString = builder.Configuration.GetSection("AppSettings:TokenKey").Value;
        if (string.IsNullOrWhiteSpace(tokenKeyString))
        {
            throw new Exception("TokenKey is not configured.");
        }

        SymmetricSecurityKey tokenKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(tokenKeyString)
        );

        TokenValidationParameters tokenValidationParameters;

        if (builder.Environment.IsDevelopment())
        {
            // Development settings
            tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = false,
                IssuerSigningKey = tokenKey,
                ValidateIssuer = false,
                ValidateAudience = false
            };
        }
        else
        {
            // Production settings - more strict validation
            tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = tokenKey,
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration.GetSection("AppSettings:ValidIssuer").Value,
                ValidateAudience = true,
                ValidAudience = builder.Configuration.GetSection("AppSettings:ValidAudience").Value,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(2),
                RequireExpirationTime = true
            };
        }

        // Register DbContext: skip SQL if DefaultConnection is set to InMemoryConnection
        string defaultConn = builder.Configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        if (builder.Environment.IsEnvironment("Testing") || defaultConn.Equals("InMemoryConnection", StringComparison.OrdinalIgnoreCase))
        {
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase("IntegrationTestDb"));
        }
        else
        {
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(defaultConn,
                    sqlOptions =>
                    {
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                        sqlOptions.CommandTimeout(60);
                    });
            });
        }

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = tokenValidationParameters;

                // In production, require HTTPS for tokens
                if (!builder.Environment.IsDevelopment())
                {
                    options.RequireHttpsMetadata = true;
                }

                // Add events for additional security checks and SignalR support
                options.Events = new JwtBearerEvents
                {
                    // Handle SignalR authentication - extract token from query parameters OR cookies
                    OnMessageReceived = context =>
                    {
                        var path = context.HttpContext.Request.Path;

                        // If the request is for our SignalR hub...
                        if (path.StartsWithSegments("/hubs"))
                        {
                            // First try to get token from query string (JWT-based auth)
                            var accessToken = context.Request.Query["access_token"];
                            
                            if (!string.IsNullOrEmpty(accessToken))
                        {
                            // Read the token out of the query string
                            context.Token = accessToken;
                            }
                            else
                            {
                                // Fall back to cookie-based auth for SignalR
                                if (context.Request.Cookies.TryGetValue("access_token", out string? cookieToken) && !string.IsNullOrEmpty(cookieToken))
                                {
                                    context.Token = cookieToken;
                                }
                            }
                        }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = async context =>
                    {
                        // Additional validation if needed, e.g. check if user still exists and is active
                        IUserService userService = context.HttpContext.RequestServices.GetRequiredService<IUserService>();

                        // Get user ID from claims
                        string? userId = context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                        if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out int id))
                        {
                            UserDTO? user = await userService.GetUserByIdAsync(id);

                            // Reject token if user no longer exists 
                            if (user == null)
                            {
                                context.Fail("User no longer exists");
                            }
                            // Check if the IsActive property exists and is false
                            else
                            {
                                System.Reflection.PropertyInfo? isActiveProperty = user.GetType().GetProperty("IsActive");
                                if (isActiveProperty != null)
                                {
                                    object? isActiveValue = isActiveProperty.GetValue(user);
                                    if (isActiveValue != null && isActiveValue is bool isActive && !isActive)
                                    {
                                        context.Fail("User has been deactivated");
                                    }
                                }
                            }
                        }
                    }
                };
            });

        // Add Data Protection API with key storage
        string keyDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Keys");

        // Ensure the directory exists
        if (!Directory.Exists(keyDirectory))
        {
            Directory.CreateDirectory(keyDirectory);
        }

        // Configure Data Protection with improved settings for development/production
        IDataProtectionBuilder dataProtectionBuilder = builder.Services.AddDataProtection()
            .SetApplicationName("TaskTrackerAPI")
            .PersistKeysToFileSystem(new DirectoryInfo(keyDirectory));

        // Configure key lifetime based on environment
        if (builder.Environment.IsDevelopment())
        {
            // Use longer key lifetime in development to avoid frequent key rotation issues
            dataProtectionBuilder.SetDefaultKeyLifetime(TimeSpan.FromDays(365)); // 1 year for development

            // Check for keys before disabling generation
            if (Directory.GetFiles(keyDirectory, "*.xml").Length == 0)
            {
                // No keys found, we need to generate one first
                builder.Services.AddDataProtection()
                    .SetApplicationName("TaskTrackerAPI")
                    .PersistKeysToFileSystem(new DirectoryInfo(keyDirectory));

                // Create a directory watcher to monitor key changes
                builder.Services.AddSingleton<FileSystemWatcher>(provider =>
                {
                    var logger = provider.GetRequiredService<ILogger<FileSystemWatcher>>();

                    var watcher = new FileSystemWatcher(keyDirectory);
                    watcher.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName | NotifyFilters.DirectoryName;
                    watcher.Filter = "*.xml";

                    watcher.Changed += (sender, e) =>
                    {
                        logger.LogInformation("Data protection key changed: {FileName}", e.Name);
                    };

                    watcher.Created += (sender, e) =>
                    {
                        logger.LogInformation("New data protection key created: {FileName}", e.Name);
                    };

                    watcher.Deleted += (sender, e) =>
                    {
                        logger.LogWarning("Data protection key deleted: {FileName}", e.Name);
                    };

                    watcher.Renamed += (sender, e) =>
                    {
                        logger.LogInformation("Data protection key renamed: {OldName} to {NewName}", e.OldName, e.Name);
                    };

                    watcher.EnableRaisingEvents = true;
                    return watcher;
                });
            }
            else
            {
                // We have keys, disable automatic generation to avoid issues
                dataProtectionBuilder.DisableAutomaticKeyGeneration();
            }
        }
        else
        {
            // Production key lifetime
            dataProtectionBuilder.SetDefaultKeyLifetime(TimeSpan.FromDays(90)); // 90 days for production
        }

        // Only use DPAPI on Windows platforms
        if (OperatingSystem.IsWindows())
        {
            dataProtectionBuilder.ProtectKeysWithDpapi();
        }

        // Register DataProtectionService
        builder.Services.AddScoped<IDataProtectionService, DataProtectionService>();

        // Day 60: Register Template Automation Services
        builder.Services.AddScoped<ITemplateAutomationRepository, TemplateAutomationRepository>();
        builder.Services.AddScoped<ITemplateAutomationService, TemplateAutomationService>();

        // Register additional repositories for proper separation of concerns
        builder.Services.AddScoped<IGamificationRepository, GamificationRepository>();
        builder.Services.AddScoped<IAdaptationLearningRepository, AdaptationLearningRepository>();
        builder.Services.AddScoped<ISecurityMonitoringRepository, SecurityMonitoringRepository>();
        builder.Services.AddScoped<IUserSecuritySettingsRepository, UserSecuritySettingsRepository>();

        // Register marketplace services
        builder.Services.AddScoped<IPointsService, PointsService>();

        // Parental Control service (Family Safety)
        builder.Services.AddScoped<IParentalControlService, ParentalControlService>();
        builder.Services.AddScoped<IParentalControlRepository, ParentalControlRepository>();

        WebApplication app = builder.Build();

        // Get API version description provider
        IApiVersionDescriptionProvider apiVersionDescriptionProvider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

        // Enable response compression
        app.UseResponseCompression();

        // Add diagnostic middleware to log requests
        app.Use(async (context, next) =>
        {
            Console.WriteLine($"Request path: {context.Request.Path}, Method: {context.Request.Method}");
            await next();
            Console.WriteLine($"Response status: {context.Response.StatusCode} for {context.Request.Path}");
        });

        // Configure the HTTP request pipeline based on environment
        if (app.Environment.IsDevelopment())
        {
            // Check if running in Docker (environment variable set in docker-compose.yml)
            bool isRunningInDocker = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DOCKER_ENVIRONMENT"));

            if (isRunningInDocker)
            {
                // Use Docker-specific CORS policy
                app.UseCors("DockerDevCors");
                Console.WriteLine("Using Docker development CORS policy");
            }
            else
            {
                // Use permissive CORS policy for local development
                app.UseCors("DevCors");
                Console.WriteLine("Using permissive development CORS policy");
            }

            // Remove HTTPS redirection for local development to avoid the warning
            // app.UseHttpsRedirection();

            // Use developer exception page for detailed error information
            app.UseDeveloperExceptionPage();

            Console.WriteLine("Using DeveloperExceptionPage for exception handling in development");
        }
        else if (app.Environment.IsStaging())
        {
            // Use staging CORS policy
            app.UseCors("StagingCors");

            // Enable HTTP Strict Transport Security (HSTS)
            app.UseHsts();

            // Force HTTPS
            app.UseHttpsRedirection();

            // Add global exception handling middleware for staging
            app.UseGlobalExceptionHandling();

            Console.WriteLine("Using staging environment configuration with custom exception handling");
        }
        else
        {
            // Production environment
            app.UseCors("ProdCors");

            // Enable HTTP Strict Transport Security (HSTS)
            app.UseHsts();

            // Force HTTPS
            app.UseHttpsRedirection();

            // Add global exception handling middleware for production
            app.UseGlobalExceptionHandling();

            Console.WriteLine("Using production environment configuration with custom exception handling");
        }

        // Add rate limiting middleware BEFORE security headers and CSRF protection
        app.UseRateLimiting();

        // Add security audit middleware AFTER rate limiting but before other middleware
        app.UseSecurityAudit();
        Console.WriteLine("Security Audit Middleware enabled");

        // Add security headers middleware
        app.UseMiddleware<SecurityHeadersMiddleware>();

        // Add validation middleware after CORS but before other middleware
        app.UseValidationPipeline();

        // Add CSRF protection middleware
        app.UseMiddleware<CsrfProtectionMiddleware>();

        // Add cookie authentication middleware for HTTP-only cookies support
        app.UseCookieAuthentication();

        // Add response caching after authentication and rate limiting
        // but before endpoints are executed
        app.UseAuthentication();
        app.UseAuthorization();

        // Add response caching middleware
        app.UseCustomResponseCaching();

        // Add query batching middleware
        app.UseMiddleware<QueryBatchingMiddleware>();

        // Map Consolidated SignalR hubs for optimal performance
        app.MapHub<UnifiedMainHub>("/hubs/main");           // Consolidated: Tasks + Gamification + Notifications + Boards + Templates
        app.MapHub<CalendarHub>("/hubs/calendar");          // Specialized: Calendar and scheduling features

        // Add health check endpoint for Docker
        app.MapGet("/health", () => Microsoft.AspNetCore.Http.Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));
        app.MapGet("/api/v1/health", () => Microsoft.AspNetCore.Http.Results.Ok(new { status = "healthy", version = "1.0", timestamp = DateTime.UtcNow }));

        app.MapControllers();

        // Seed the database if needed
        using (IServiceScope scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var logger = services.GetRequiredService<ILogger<Program>>();

            try
            {
                var context = services.GetRequiredService<ApplicationDbContext>();
                var authHelper = services.GetRequiredService<AuthHelper>();

                // Wait for SQL Server to be ready (especially important in Docker)
                logger.LogInformation("Waiting for database to be ready...");

                // Add initial delay in Docker to give SQL Server more startup time
                bool isRunningInDocker = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DOCKER_ENVIRONMENT"));
                if (isRunningInDocker)
                {
                    logger.LogInformation("Docker environment detected, waiting 10 seconds for SQL Server startup...");
                    await Task.Delay(10000);
                }

                await WaitForDatabaseAsync(context, logger);

                if (app.Environment.IsDevelopment())
                {
                    // Apply migrations and seed data in development
                    logger.LogInformation("Development environment - applying migrations...");
                    await context.Database.MigrateAsync();
                    logger.LogInformation("Migrations applied successfully.");
                }
                else
                {
                    // Production: use migrations
                    await context.Database.MigrateAsync();
                }

                var seeder = new Data.SeedData.DataSeeder();
                await seeder.SeedAsync(context, logger, authHelper);

                logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
            }
        }

        app.Run();
    }

    /// <summary>
    /// Waits for the database server to become available with exponential backoff
    /// </summary>
    private static async Task WaitForDatabaseAsync(ApplicationDbContext context, ILogger logger)
    {
        var delay = TimeSpan.FromSeconds(1);
        const int maxRetries = 30;

        // Get connection string and modify it to connect to master database for initial check
        var connectionString = context.Database.GetConnectionString();
        var masterConnectionString = connectionString?.Replace("Database=TaskTracker", "Database=master");

        for (int i = 0; i < maxRetries; i++)
        {
            try
            {
                // First, test SQL Server connectivity using master database
                using (var connection = new Microsoft.Data.SqlClient.SqlConnection(masterConnectionString))
                {
                    await connection.OpenAsync();
                    logger.LogInformation("SQL Server connection successful.");
                    return;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning($"SQL Server connection attempt {i + 1}/{maxRetries} failed: {ex.Message}");

                if (i == maxRetries - 1)
                {
                    logger.LogError("Max SQL Server connection retries reached. SQL Server may not be available.");
                    throw;
                }

                await Task.Delay(delay);
                delay = TimeSpan.FromMilliseconds(Math.Min(delay.TotalMilliseconds * 2, 10000)); // Max 10 second delay
            }
        }
    }
}