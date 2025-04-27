using System;
using System.Security.Claims;

namespace TaskTrackerAPI.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        /// <summary>
        /// Gets the user ID from claims as a string
        /// </summary>
        /// <param name="user">The ClaimsPrincipal</param>
        /// <returns>The user ID as a string</returns>
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        /// <summary>
        /// Gets the user ID from claims as an integer
        /// </summary>
        /// <param name="user">The ClaimsPrincipal</param>
        /// <returns>The user ID as an integer</returns>
        /// <exception cref="InvalidOperationException">Thrown when user ID claim is missing or invalid</exception>
        public static int GetUserIdAsInt(this ClaimsPrincipal user)
        {
            string userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                throw new InvalidOperationException("User ID claim not found");
            }

            if (int.TryParse(userIdString, out int userId))
            {
                return userId;
            }
            
            throw new InvalidOperationException("User ID is not a valid integer");
        }

        /// <summary>
        /// Checks if the principal has the specified role
        /// </summary>
        /// <param name="user">The ClaimsPrincipal</param>
        /// <param name="role">The role to check</param>
        /// <returns>True if user has the specified role, false otherwise</returns>
        public static bool IsInRole(this ClaimsPrincipal user, string role)
        {
            return user.HasClaim(ClaimTypes.Role, role);
        }
    }
} 