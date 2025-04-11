using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskTrackerAPI.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors((options) =>
    {
        options.AddPolicy("DevCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins("http://localhost:4200", "http://localhost:3000", "http://localhost:8000")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        options.AddPolicy("ProdCors", (corsBuilder) =>
            {
                corsBuilder.WithOrigins("https://myProductionSite.com")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
    });

    

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

app.UseHttpsRedirection();

// Map controllers
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
