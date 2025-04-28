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

namespace TaskTrackerAPI;

// Making Program class public so it can be used for integration testing
public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
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
            options.AddPolicy("DevCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins(
                       "http://localhost:4200",
                       "http://localhost:3000",
                       "http://localhost:8000",
                       "http://localhost:5173",
                       "http://localhost:8080",
                       "http://localhost:5211",
                       "http://127.0.0.1:5173",
                       "http://127.0.0.1:3000",
                       "http://127.0.0.1:5211",
                       "http://localhost",
                       "http://10.0.2.2:5211",  // Add this for Android emulator
                       "http://10.0.2.2:8081"   // Add this for React Native dev server
                    )
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Disposition");
            });
            options.AddPolicy("ProdCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins("https://myProductionSite.com")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Disposition");
            });
        });

        // Register AutoMapper
        builder.Services.AddAutoMapper(typeof(Program).Assembly);

        // Add Memory Cache for rate limiting
        builder.Services.AddMemoryCache();

        // Register repository
        builder.Services.AddScoped<IUserRepository, TaskTrackerAPI.Repositories.UserRepository>();
        builder.Services.AddScoped<ITaskItemRepository, TaskTrackerAPI.Repositories.TaskItemRepository>();
        builder.Services.AddScoped<ICategoryRepository, TaskTrackerAPI.Repositories.CategoryRepository>();
        builder.Services.AddScoped<ITagRepository, TaskTrackerAPI.Repositories.TagRepository>();
        builder.Services.AddScoped<IFamilyRepository, TaskTrackerAPI.Repositories.FamilyRepository>();
        builder.Services.AddScoped<IFamilyRoleRepository, TaskTrackerAPI.Repositories.FamilyRoleRepository>();
        builder.Services.AddScoped<IInvitationRepository, TaskTrackerAPI.Repositories.InvitationRepository>();
        builder.Services.AddScoped<IUserDeviceRepository, TaskTrackerAPI.Repositories.UserDeviceRepository>();
        builder.Services.AddScoped<IFamilyMemberRepository, TaskTrackerAPI.Repositories.FamilyMemberRepository>();
        builder.Services.AddScoped<IFamilyAchievementRepository, TaskTrackerAPI.Repositories.FamilyAchievementRepository>();

        // Register helpers
        builder.Services.AddScoped<AuthHelper>();

        // Register Category Service
        builder.Services.AddScoped<ICategoryService, CategoryService>();

        // Register Tag Service
        builder.Services.AddScoped<ITagService, TagService>();

        // Register services
        builder.Services.AddScoped<IUserService, UserService>();
        builder.Services.AddScoped<ITaskService, TaskService>();
        builder.Services.AddScoped<ICategoryService, CategoryService>();
        builder.Services.AddScoped<ITagService, TagService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IReminderService, ReminderService>();
        builder.Services.AddScoped<IBoardService, BoardService>();
        builder.Services.AddScoped<IFamilyMemberService, FamilyMemberService>();
        builder.Services.AddScoped<ITaskTemplateService, TaskTemplateService>();
        builder.Services.AddScoped<INotificationService, NotificationService>();
        builder.Services.AddScoped<IGamificationService, GamificationService>();
        builder.Services.AddScoped<IFamilyService, FamilyService>();
        builder.Services.AddScoped<IFamilyRoleService, FamilyRoleService>();
        builder.Services.AddScoped<IInvitationService, InvitationService>();
        builder.Services.AddScoped<IUserDeviceService, UserDeviceService>();
        builder.Services.AddScoped<IFamilyAchievementService, FamilyAchievementService>();
        builder.Services.AddScoped<ITaskSharingService, TaskSharingService>();
        builder.Services.AddScoped<IAchievementService, AchievementService>();
        builder.Services.AddScoped<IBadgeService, BadgeService>();

        // Register TaskStatisticsService
        builder.Services.AddScoped<ITaskStatisticsService, TaskStatisticsService>();

        // Register Board repositories and services
        builder.Services.AddScoped<IBoardRepository, BoardRepository>();

        // Register Reminder, TaskTemplate, and Notification repositories
        builder.Services.AddScoped<IReminderRepository, ReminderRepository>();
        builder.Services.AddScoped<ITaskTemplateRepository, TaskTemplateRepository>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

        // Register QRCode Generator as singleton
        builder.Services.AddSingleton<QRCodeGenerator>();
        builder.Services.AddSingleton<QRCodeHelper>();

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
            // Production settings
            tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = tokenKey,
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration.GetSection("AppSettings:ValidIssuer").Value,
                ValidateAudience = true,
                ValidAudience = builder.Configuration.GetSection("AppSettings:ValidAudience").Value,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
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
                options.UseSqlServer(defaultConn));
        }

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = tokenValidationParameters;
            });

        WebApplication app = builder.Build();

        // Get API version description provider
        var apiVersionDescriptionProvider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseCors("DevCors");
        }
        else
        {
            app.UseCors("ProdCors");
            app.UseHsts();
        }

        // Add global exception handling middleware
        app.UseGlobalExceptionHandling();

        // Add rate limiting middleware BEFORE CSRF protection
        app.UseRateLimiting();

        // Add CSRF protection middleware
        app.UseMiddleware<CsrfProtectionMiddleware>();

        app.UseHttpsRedirection();

        // Map controllers
        app.UseAuthentication();
        app.UseAuthorization();
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
                        IsActive = true
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