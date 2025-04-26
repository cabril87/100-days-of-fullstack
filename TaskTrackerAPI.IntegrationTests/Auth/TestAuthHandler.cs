using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace TaskTrackerAPI.IntegrationTests.Auth
{
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        private static readonly AsyncLocal<string> _userId = new AsyncLocal<string> { Value = "1" };
        private static readonly AsyncLocal<string> _username = new AsyncLocal<string> { Value = "testuser" };
        private static readonly AsyncLocal<string> _role = new AsyncLocal<string> { Value = "User" };
        
        public static string UserId 
        { 
            get => _userId.Value ?? "1"; 
            set => _userId.Value = value; 
        }
        
        public static string Username 
        {
            get => _username.Value ?? "testuser";
            set => _username.Value = value;
        }
        
        public static string Role 
        {
            get => _role.Value ?? "User";
            set => _role.Value = value;
        }
        
        public TestAuthHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            TimeProvider timeProvider)
            : base(options, logger, encoder)
        {
            // TimeProvider is now injected but not used in the base constructor
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            Claim[] claims = new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, UserId),
                new Claim(ClaimTypes.Name, Username),
                new Claim(ClaimTypes.Role, Role)
            };

            ClaimsIdentity identity = new ClaimsIdentity(claims, "Test");
            ClaimsPrincipal principal = new ClaimsPrincipal(identity);
            AuthenticationTicket ticket = new AuthenticationTicket(principal, "TestScheme");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
        
        public static void SetUser(string userId, string username = "testuser", string role = "User")
        {
            UserId = userId;
            Username = username;
            Role = role;
        }
        
        public static void ResetUser()
        {
            UserId = "1";
            Username = "testuser";
            Role = "User";
        }
    }
} 