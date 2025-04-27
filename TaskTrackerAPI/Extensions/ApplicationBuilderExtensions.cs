using Microsoft.AspNetCore.Builder;
using TaskTrackerAPI.Middleware;

namespace TaskTrackerAPI.Extensions
{
    
    /// Extension methods for <see cref="IApplicationBuilder"/>
    
    public static class ApplicationBuilderExtensions
    {
        
        /// Adds global exception handling middleware to the application pipeline
        
        /// <param name="builder">The application builder</param>
        /// <returns>The application builder with exception handling configured</returns>
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
} 