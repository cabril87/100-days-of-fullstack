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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Repositories;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services;
using TaskTrackerAPI.Services.Interfaces;
using AutoMapper;
using TaskTrackerAPI.Middleware;
using TaskTrackerAPI.Exceptions;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using TaskTrackerAPI.Models;
using QRCoder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using TaskTrackerAPI.Extensions;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SignalR;
using TaskTrackerAPI.Hubs;
using Microsoft.Extensions.Logging;
using System.Net.Http.Json;
using TaskTrackerAPI.DTOs.Auth;
using Microsoft.AspNetCore.DataProtection;
using TaskTrackerAPI.ModelBinders;
using TaskTrackerAPI.Filters;

namespace TaskTrackerAPI;

// Making Program class public so it can be used for integration testing
public class Program
{
    public static void Main(string[] args)
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
                corsBuilder.AllowAnyOrigin() // Permissive for file:// protocol and local testing
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .WithExposedHeaders("Content-Disposition", "Set-Cookie");
            });
            
            // Docker development CORS policy - for when testing with Docker
            options.AddPolicy("DockerDevCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins(
                       "http://localhost:3000",    // Next.js frontend
                       "http://localhost:5173",    // Vite frontend
                       "http://localhost:8080",    // Webpack common port
                       "http://localhost",         // Generic localhost
                       "http://host.docker.internal:3000",  // Docker host Next.js
                       "http://host.docker.internal:5173"   // Docker host Vite
                    )
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Disposition", "Set-Cookie");
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
        
        // Register AuthHelper (critical dependency)
        builder.Services.AddScoped<AuthHelper>();

        // Register business services
        builder.Services.AddScoped<ITaskService, TaskService>();
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        builder.Services.AddScoped<ITagService, TagService>();
        builder.Services.AddScoped<IReminderService, ReminderService>();
        builder.Services.AddScoped<INotificationService, NotificationService>();
        
        // Add services that exist in the project
        builder.Services.AddScoped<IFamilyService, FamilyService>();
        builder.Services.AddScoped<IFamilyAchievementService, FamilyAchievementService>();
        builder.Services.AddScoped<IInvitationService, InvitationService>();
        builder.Services.AddScoped<IUserDeviceService, UserDeviceService>();
        builder.Services.AddScoped<IFamilyCalendarService, FamilyCalendarService>();
        builder.Services.AddScoped<ITaskSharingService, TaskSharingService>();
        
        builder.Services.AddScoped<IGamificationService, GamificationService>();
        builder.Services.AddScoped<IFocusService, FocusService>();
        builder.Services.AddScoped<ITaskSyncService, TaskSyncService>();
        builder.Services.AddScoped<ITaskPriorityService, TaskPriorityService>();

        // Register auth services
        builder.Services.AddScoped<IAuthService, AuthService>();
        
        // Re-add working services and add any missing ones from before
        builder.Services.AddScoped<IReminderService, ReminderService>();
        builder.Services.AddScoped<IBoardService, BoardService>();
        builder.Services.AddScoped<IFamilyMemberService, FamilyMemberService>();
        builder.Services.AddScoped<ITaskTemplateService, TaskTemplateService>();
        builder.Services.AddScoped<IFamilyRoleService, FamilyRoleService>();
        builder.Services.AddScoped<IAchievementService, AchievementService>();
        builder.Services.AddScoped<IBadgeService, BadgeService>();

        // Register SignalR for real-time updates
        builder.Services.AddSignalR(options =>
        {
            options.EnableDetailedErrors = builder.Environment.IsDevelopment();
            options.MaximumReceiveMessageSize = 102400; // 100KB
        });
        
        // Register task synchronization service
        builder.Services.AddScoped<ITaskSyncService, TaskSyncService>();

        // Register HttpContextAccessor and UserAccessor
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddScoped<IUserAccessor, UserAccessor>();

        // Register TaskPriorityService
        builder.Services.AddScoped<ITaskPriorityService, TaskPriorityService>();

        // Register TaskStatisticsService
        builder.Services.AddScoped<ITaskStatisticsService, TaskStatisticsService>();

        // Register Board repositories and services
        builder.Services.AddScoped<IBoardRepository, BoardRepository>();

        // Register Reminder, TaskTemplate, and Notification repositories
        builder.Services.AddScoped<IReminderRepository, ReminderRepository>();
        builder.Services.AddScoped<ITaskTemplateRepository, TaskTemplateRepository>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<IChecklistItemRepository, ChecklistItemRepository>();

        // Register DeadlineNotificationService as a hosted service
        builder.Services.AddHostedService<DeadlineNotificationService>();

        // Register QRCode Generator as singleton
        builder.Services.AddSingleton<QRCodeGenerator>();
        builder.Services.AddSingleton<QRCodeHelper>();

        // Register RateLimitBackoffHelper as singleton
        builder.Services.AddHttpClient();
        builder.Services.AddSingleton<Utils.RateLimitBackoffHelper>(sp => {
            HttpClient httpClient = sp.GetRequiredService<IHttpClientFactory>().CreateClient();
            ILogger<Utils.RateLimitBackoffHelper> logger = sp.GetRequiredService<ILogger<Utils.RateLimitBackoffHelper>>();
            return new Utils.RateLimitBackoffHelper(httpClient, logger);
        });

        // Register SecurityService
        builder.Services.AddScoped<ISecurityService, SecurityService>();

        // Add response compression
        builder.Services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
            options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
        });

        // Configure Brotli compression level
        builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProviderOptions>(options =>
        {
            options.Level = System.IO.Compression.CompressionLevel.Optimal;
        });

        // Configure Gzip compression level
        builder.Services.Configure<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProviderOptions>(options =>
        {
            options.Level = System.IO.Compression.CompressionLevel.Optimal;
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
                    sqlOptions => sqlOptions.EnableRetryOnFailure());
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
                
                // Add events for additional security checks
                options.Events = new JwtBearerEvents
                {
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
        
        // Configure Data Protection with appropriate settings
        IDataProtectionBuilder dataProtectionBuilder = builder.Services.AddDataProtection()
            .SetApplicationName("TaskTrackerAPI")
            .PersistKeysToFileSystem(new DirectoryInfo(keyDirectory))
            .SetDefaultKeyLifetime(TimeSpan.FromDays(90)); // Set keys to expire after 90 days
            
        // Only use DPAPI on Windows platforms
        if (OperatingSystem.IsWindows())
        {
            dataProtectionBuilder.ProtectKeysWithDpapi();
        }

        // Register DataProtectionService
        builder.Services.AddScoped<TaskTrackerAPI.Services.Interfaces.IDataProtectionService, TaskTrackerAPI.Services.DataProtectionService>();

        WebApplication app = builder.Build();

        // Get API version description provider
        IApiVersionDescriptionProvider apiVersionDescriptionProvider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

        // Enable response compression
        app.UseResponseCompression();

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
        }
        else if (app.Environment.IsStaging())
        {
            // Use staging CORS policy
            app.UseCors("StagingCors");
            
            // Enable HTTP Strict Transport Security (HSTS)
            app.UseHsts();
            
            // Force HTTPS
            app.UseHttpsRedirection();
            
            Console.WriteLine("Using staging environment configuration");
        }
        else
        {
            // Production environment
            app.UseCors("ProdCors");
            
            // Enable HTTP Strict Transport Security (HSTS)
            app.UseHsts();
            
            // Force HTTPS
            app.UseHttpsRedirection();
            
            Console.WriteLine("Using production environment configuration");
        }

        // Add global exception handling middleware
        app.UseGlobalExceptionHandling();

        // Add security audit middleware first to capture all requests
        app.UseSecurityAudit();

        // Add rate limiting middleware BEFORE security headers and CSRF protection
        app.UseRateLimiting();

        // Add security headers middleware
        app.UseMiddleware<SecurityHeadersMiddleware>();

        // Add validation middleware after CORS but before other middleware
        app.UseValidationPipeline();

        // Add CSRF protection middleware
        app.UseMiddleware<CsrfProtectionMiddleware>();

        // Add response caching after authentication and rate limiting
        // but before endpoints are executed
        app.UseAuthentication();
        app.UseAuthorization();

        // Add response caching middleware
        app.UseCustomResponseCaching();

        // Add query batching middleware
        app.UseMiddleware<QueryBatchingMiddleware>();

        // Map SignalR hubs
        app.MapHub<TaskHub>("/hubs/tasks");

        app.MapControllers();

        // Seed the database if needed
        using (IServiceScope scope = app.Services.CreateScope())
        {
            IServiceProvider services = scope.ServiceProvider;
            ApplicationDbContext dbContext = services.GetRequiredService<ApplicationDbContext>();

            if (app.Environment.IsDevelopment())
            {
                dbContext.Database.EnsureCreated();

                // Seed initial data if needed
                if (!dbContext.Users.Any())
                {
                    // Get the auth helper service
                    AuthHelper authHelper = services.GetRequiredService<AuthHelper>();

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
                    dbContext.Users.Add(user);
                    dbContext.SaveChanges();

                    Console.WriteLine("Admin user created with email: admin@tasktracker.com and password: password");
                }
            }

            if (!dbContext.FamilyRoles.Any())
            {
                Console.WriteLine("Creating family roles...");

                // Create Admin role
                FamilyRole adminRole = new FamilyRole
                {
                    Name = "Admin",
                    Description = "Full control over the family",
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.FamilyRoles.Add(adminRole);

                // Create Member role
                FamilyRole memberRole = new FamilyRole
                {
                    Name = "Member",
                    Description = "Regular family member",
                    IsDefault = true,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.FamilyRoles.Add(memberRole);
                dbContext.SaveChanges();

                // Add permissions for Admin role
                // Add permissions for Admin role
                dbContext.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
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
                dbContext.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
                {
                    new FamilyRolePermission { RoleId = memberRole.Id, Name = "view_members", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { RoleId = memberRole.Id, Name = "manage_own_tasks", CreatedAt = DateTime.UtcNow }
                });

                dbContext.SaveChanges();
                Console.WriteLine("Family roles created successfully!");
            }

            // Add Child and Adult roles for family task management
            if (!dbContext.FamilyRoles.Any(r => r.Name == "Child" || r.Name == "Adult"))
            {
                Console.WriteLine("Creating Child and Adult family roles...");

                // Create Adult role
                FamilyRole adultRole = new FamilyRole
                {
                    Name = "Adult",
                    Description = "Adult family member with task management permissions",
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.FamilyRoles.Add(adultRole);

                // Create Child role
                FamilyRole childRole = new FamilyRole
                {
                    Name = "Child",
                    Description = "Child family member with limited permissions",
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow
                };
                dbContext.FamilyRoles.Add(childRole);
                dbContext.SaveChanges();

                // Add permissions for Adult role
                dbContext.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
                {
                    new FamilyRolePermission { RoleId = adultRole.Id, Name = "assign_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { RoleId = adultRole.Id, Name = "view_tasks", CreatedAt = DateTime.UtcNow },
                    new FamilyRolePermission { RoleId = adultRole.Id, Name = "create_tasks", CreatedAt = DateTime.UtcNow }
                });

                // Add permissions for Child role (limited)
                dbContext.FamilyRolePermissions.AddRange(new List<FamilyRolePermission>
                {
                    new FamilyRolePermission { RoleId = childRole.Id, Name = "view_tasks", CreatedAt = DateTime.UtcNow }
                });

                dbContext.SaveChanges();
                Console.WriteLine("Child and Adult family roles created successfully!");
            }
        }

        app.Run();
    }
}