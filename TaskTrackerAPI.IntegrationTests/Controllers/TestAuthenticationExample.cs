using System.Net;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace TaskTrackerAPI.IntegrationTests.Controllers
{
    public class TestAuthenticationExample : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public TestAuthenticationExample(CustomWebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
            
            // Add the authentication header
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "TestToken");
        }

        [Fact]
        public async Task GetSecureEndpoint_WithTestAuth_ReturnsSuccess()
        {
            // Arrange - Using the TestAuthHandler, we can access secured endpoints

            // Act - Try to access a secured endpoint
            var response = await _client.GetAsync("/api/categories");

            // Assert - Should return success as we're using the TestAuthHandler
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        
        [Fact]
        public async Task GetCategories_ReturnsSuccess()
        {
            // Act
            var response = await _client.GetAsync("/api/categories");
            
            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            // Just check we're getting some content
            var content = await response.Content.ReadAsStringAsync();
            Assert.NotEmpty(content);
        }
    }
} 