using System;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace TaskTrackerAPI.IntegrationTests
{
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // Create test claims for a mocked user
            Claim[] claims = new Claim[]
            {
                new Claim(ClaimTypes.Name, "testuser"),
                new Claim(ClaimTypes.NameIdentifier, "1"),
                new Claim(ClaimTypes.Email, "test@example.com"),
                new Claim(ClaimTypes.Role, "User")
            };

            // Create the identity and principal
            ClaimsIdentity identity = new ClaimsIdentity(claims, "Test");
            ClaimsPrincipal principal = new ClaimsPrincipal(identity);
            
            // Create the authentication ticket
            AuthenticationTicket ticket = new AuthenticationTicket(principal, "TestScheme");

            // Return a successful authentication result with the ticket
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }
} 