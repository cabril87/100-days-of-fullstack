using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using TaskTrackerAPI.Helpers;
using TaskTrackerAPI.Models;
using System;
using System.Collections.Generic;

namespace TaskTrackerAPI.IntegrationTests
{
    public class MockAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private readonly int _userId;
        private readonly string _username;
        private readonly string _role;
        private readonly IConfiguration _configuration;
        private readonly AuthHelper _authHelper;

        public MockAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock,
            IConfiguration configuration) 
            : base(options, logger, encoder, clock)
        {
            _userId = 1; // Admin user ID
            _username = "admin";
            _role = "Admin";
            _configuration = configuration;
            
            // Create the AuthHelper with the configuration
            _authHelper = new AuthHelper(_configuration);
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // Create claims for the authenticated user
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _userId.ToString()),
                new Claim(ClaimTypes.Name, _username),
                new Claim(ClaimTypes.Role, _role)
            };

            ClaimsIdentity identity = new ClaimsIdentity(claims, Scheme.Name);
            ClaimsPrincipal principal = new ClaimsPrincipal(identity);
            AuthenticationTicket ticket = new AuthenticationTicket(principal, Scheme.Name);

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
        
        public string CreateTestToken()
        {
            User user = new User
            {
                Id = _userId,
                Username = _username,
                Role = _role,
                Email = "test@example.com",
                PasswordHash = "hashedpassword",
                Salt = "salt123",
                FirstName = "Test",
                LastName = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            return _authHelper.CreateToken(user);
        }
        
        public string GenerateTestRefreshToken()
        {
            return _authHelper.GenerateRefreshToken();
        }
    }
} 