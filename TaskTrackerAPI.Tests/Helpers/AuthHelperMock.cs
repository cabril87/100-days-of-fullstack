using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Tests.Helpers
{
    // A simplified version of AuthHelper for testing
    public class AuthHelperMock : AuthHelper
    {
        public AuthHelperMock() : base(CreateMockConfiguration())
        {
        }
        
        private static IConfiguration CreateMockConfiguration()
        {
            var configurationMock = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    {"AppSettings:PasswordKey", "mock_password_key"},
                    {"AppSettings:TokenKey", "mock_token_key_that_is_at_least_128_bits_long_for_testing_purposes"},
                    {"AppSettings:AccessTokenExpireMinutes", "60"},
                    {"AppSettings:RefreshTokenExpireDays", "7"}
                })
                .Build();
            
            return configurationMock;
        }

        // We don't need to override these methods as they're not virtual in the base class
        // Instead we'll use the base implementation with our mock configuration
        
        // This method demonstrates how we could provide a custom implementation if needed
        public new void CreatePasswordHash(string password, out string passwordHash, out string salt)
        {
            // Simplified implementation for testing
            passwordHash = $"hashed_{password}";
            salt = "test_salt";
        }
        
        // This method demonstrates how we could provide a custom implementation if needed
        public new bool VerifyPasswordHash(string password, string storedHash, string storedSalt)
        {
            // Simplified implementation for testing 
            return storedHash == $"hashed_{password}";
        }
        
        // This method demonstrates how we could provide a custom implementation if needed
        public new string CreateToken(User user)
        {
            // Simplified implementation for testing
            return $"mock_jwt_token_for_user_{user.Id}";
        }
        
        // This method demonstrates how we could provide a custom implementation if needed
        public new string GenerateRefreshToken()
        {
            // Simplified implementation for testing
            return "mock_refresh_token";
        }
        
        // This method demonstrates how we could provide a custom implementation if needed
        public new DateTime GetRefreshTokenExpiryTime()
        {
            // Simplified implementation for testing
            return DateTime.UtcNow.AddDays(7);
        }
        
        // This method demonstrates how we could provide a custom implementation if needed
        public new ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            // Simplified implementation for testing
            if (token.StartsWith("mock_jwt_token_for_user_"))
            {
                var claims = new List<Claim> 
                {
                    new Claim(ClaimTypes.NameIdentifier, "1"),
                    new Claim(ClaimTypes.Name, "testuser"),
                    new Claim(ClaimTypes.Email, "test@example.com"),
                    new Claim(ClaimTypes.Role, "User")
                };
                
                return new ClaimsPrincipal(new ClaimsIdentity(claims, "Test"));
            }
            
            return null;
        }
    }
} 