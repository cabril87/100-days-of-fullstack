using System;
using System.Security.Claims;

namespace TaskTrackerAPI.Utils
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal principal)
        {
            Claim? userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                throw new InvalidOperationException("User ID claim not found");
            }

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new InvalidOperationException("User ID is not a valid integer");
            }

            return userId;
        }

        public static bool IsInRole(this ClaimsPrincipal principal, string role)
        {
            return principal.HasClaim(ClaimTypes.Role, role);
        }
    }
} 