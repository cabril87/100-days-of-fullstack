using System;
using System.Security.Claims;

namespace TaskTrackerAPI.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            if (user.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("User is not authenticated");
                
            string userId = user.FindFirstValue(ClaimTypes.NameIdentifier) ??
                            throw new InvalidOperationException("User ID claim not found");
                
            if (!int.TryParse(userId, out int id))
                throw new InvalidOperationException("User ID is not a valid integer");
                
            return id;
        }
    }
} 