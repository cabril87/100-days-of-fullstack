using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.ServiceTests.Helpers
{
    // A simplified version of AuthHelper for testing
    public class AuthHelperMock : AuthHelper
    {
        public AuthHelperMock() : base(CreateMockConfiguration())
        {
        }
        
        private static IConfiguration CreateMockConfiguration()
        {
            // Try to load from the test settings file first
            IConfigurationBuilder configBuilder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.test.json", optional: true);
            
            IConfiguration config = configBuilder.Build();
            
            // If token key is missing, fallback to in-memory config
            if (string.IsNullOrEmpty(config.GetSection("AppSettings:TokenKey").Value))
            {
                configBuilder.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    {"AppSettings:PasswordKey", "mock_password_key"},
                    {"AppSettings:TokenKey", "mock_token_key_that_is_at_least_128_bits_long_for_testing_purposes"},
                    {"AppSettings:AccessTokenExpireMinutes", "60"},
                    {"AppSettings:RefreshTokenExpireDays", "7"}
                });
                
                config = configBuilder.Build();
            }
            
            return config;
        }

        // Using 'new' keyword to hide the base methods rather than override them
        
        public new void CreatePasswordHash(string password, out string passwordHash, out string salt)
        {
            // Simplified implementation for testing
            passwordHash = $"hashed_{password}";
            salt = "test_salt";
        }
        
        public new bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
        {
            // Simplified implementation for testing 
            return storedHash == $"hashed_{password}";
        }
        
        public new string CreateToken(User user)
        {
            // Simplified implementation for testing
            return $"mock_jwt_token_for_user_{user.Id}";
        }
        
        public new string GenerateRefreshToken()
        {
            // Simplified implementation for testing
            return "mock_refresh_token";
        }
        
        public new DateTime GetRefreshTokenExpiryTime()
        {
            // Simplified implementation for testing
            return DateTime.UtcNow.AddDays(7);
        }
        
        public new ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            // Simplified implementation for testing
            if (token.StartsWith("mock_jwt_token_for_user_"))
            {
                List<Claim> claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, "1"),
                    new Claim(ClaimTypes.Name, "testuser"),
                    new Claim(ClaimTypes.Role, "User")
                };
                
                return new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
            }
            
            return null;
        }
    }
} 