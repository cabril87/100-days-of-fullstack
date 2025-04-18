using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.IO;

namespace TaskTrackerAPI.ServiceTests
{
    public static class ServiceTestsSetup
    {
        public static IConfiguration GetTestConfiguration()
        {
            // Load the test configuration from appsettings.test.json
            return new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.test.json", optional: false)
                .Build();
        }

        public static IServiceCollection ConfigureTestServices(this IServiceCollection services)
        {
            // Configure services for testing
            services.AddSingleton(GetTestConfiguration());
            
            // Add any other service configurations needed for testing
            
            return services;
        }
    }
} 