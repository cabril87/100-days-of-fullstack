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
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI;

// Making Program class public so it can be used for integration testing
public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });
        // Add services to the container.
        // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options => {
            // Configure Swagger for JWT authentication
            options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme {
                Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
                In = ParameterLocation.Header,
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey
            });
            options.OperationFilter<SecurityRequirementsOperationFilter>();
        });
        builder.Services.AddCors((options) =>
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
                       "http://localhost"
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

        // Register repository
        builder.Services.AddScoped<IUserRepository, UserRepository>();

        // Register TaskItem Repository
        builder.Services.AddScoped<ITaskItemRepository, TaskItemRepository>(); 
        // Register Category Repository
        builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();

        // Register Tag Repository
        builder.Services.AddScoped<ITagRepository, TagRepository>();

        // Register helpers
        builder.Services.AddScoped<AuthHelper>();

        // Register Category Service
        builder.Services.AddScoped<ICategoryService, CategoryService>();

        // Register Tag Service
        builder.Services.AddScoped<ITagService, TagService>();

        // Register services
        builder.Services.AddScoped<IAuthService, AuthService>();

        // Register TaskService
        builder.Services.AddScoped<ITaskService, TaskService>();
        
        // Register TaskStatisticsService
        builder.Services.AddScoped<ITaskStatisticsService, TaskStatisticsService>();
            
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

        // Only add the SQL Server DbContext if we're not in the Testing environment
        // This allows the test project to set up its own in-memory database
        if (builder.Environment.EnvironmentName != "Testing")
        {
            builder.Services.AddDbContext<ApplicationDbContext>(options => 
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
        }

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = tokenValidationParameters;
            });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseCors("DevCors");
            app.UseSwagger();
            app.UseSwaggerUI();
        }
        else
        {
            app.UseCors("ProdCors");
            app.UseHttpsRedirection();
        }

        // Add global exception handling middleware
        app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

        app.UseHttpsRedirection();

        // Map controllers
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        // Seed the database if needed
        using (var scope = app.Services.CreateScope())
        {
            var services = scope.ServiceProvider;
            var dbContext = services.GetRequiredService<ApplicationDbContext>();
            
            if (app.Environment.IsDevelopment())
            {
                dbContext.Database.EnsureCreated();
                
                // Seed initial data if needed
                if (!dbContext.Users.Any())
                {
                    // Get the auth helper service
                    var authHelper = services.GetRequiredService<AuthHelper>();
                    
                    // Create a proper password hash for a very simple password
                    authHelper.CreatePasswordHash("password", out string passwordHash, out string salt);
                    
                    // Add default admin user for testing
                    var user = new User
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
        }

        app.Run();
    }
}