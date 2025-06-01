using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.DTOs.Boards;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace TaskTrackerAPI.Hubs
{
    /// <summary>
    /// Template Marketplace Hub for real-time template updates
    /// Provides live updates for template publications, ratings, and marketplace activities
    /// </summary>
    [Authorize]
    public class TemplateMarketplaceHub : Hub
    {
        private readonly IBoardTemplateService _templateService;
        private readonly ILogger<TemplateMarketplaceHub> _logger;
        private const string MarketplaceGroupName = "TemplateMarketplace";

        public TemplateMarketplaceHub(
            IBoardTemplateService templateService,
            ILogger<TemplateMarketplaceHub> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        /// <summary>
        /// Join the template marketplace for real-time updates
        /// </summary>
        public async Task JoinMarketplaceAsync()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                await Groups.AddToGroupAsync(Context.ConnectionId, MarketplaceGroupName);
                
                _logger.LogInformation($"User {userId} joined template marketplace");
                
                // Send current marketplace statistics
                await SendMarketplaceStatsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining template marketplace");
                await Clients.Caller.SendAsync("Error", "Failed to join marketplace");
            }
        }

        /// <summary>
        /// Leave the template marketplace
        /// </summary>
        public async Task LeaveMarketplaceAsync()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, MarketplaceGroupName);
                
                _logger.LogInformation($"User {userId} left template marketplace");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving template marketplace");
            }
        }

        /// <summary>
        /// Notify when a new template is published to the marketplace
        /// </summary>
        public async Task NotifyTemplatePublishedAsync(int templateId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var template = await _templateService.GetTemplateByIdAsync(templateId, userId);
                
                if (template != null && template.IsPublic)
                {
                    await Clients.Group(MarketplaceGroupName).SendAsync("TemplatePublished", new
                    {
                        Template = template,
                        PublishedBy = userId,
                        PublishedAt = DateTime.UtcNow
                    });

                    _logger.LogInformation($"Template {templateId} published by user {userId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying template publication: {ex.Message}");
            }
        }

        /// <summary>
        /// Notify when a template is updated
        /// </summary>
        public async Task NotifyTemplateUpdatedAsync(int templateId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var template = await _templateService.GetTemplateByIdAsync(templateId, userId);
                
                if (template != null && template.IsPublic)
                {
                    await Clients.Group(MarketplaceGroupName).SendAsync("TemplateUpdated", new
                    {
                        Template = template,
                        UpdatedBy = userId,
                        UpdatedAt = DateTime.UtcNow
                    });

                    _logger.LogInformation($"Template {templateId} updated by user {userId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying template update: {ex.Message}");
            }
        }

        /// <summary>
        /// Notify when a template receives a new rating
        /// </summary>
        public async Task NotifyTemplateRatedAsync(int templateId, int rating)
        {
            try
            {
                var userId = GetCurrentUserId();
                var template = await _templateService.GetTemplateByIdAsync(templateId, userId);
                
                if (template != null && template.IsPublic)
                {
                    // Get updated statistics
                    var stats = await _templateService.GetTemplateStatisticsAsync(templateId, userId);
                    
                    await Clients.Group(MarketplaceGroupName).SendAsync("TemplateRated", new
                    {
                        TemplateId = templateId,
                        NewRating = rating,
                        RatedBy = userId,
                        UpdatedStats = stats,
                        RatedAt = DateTime.UtcNow
                    });

                    _logger.LogInformation($"Template {templateId} rated {rating}/5 by user {userId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying template rating: {ex.Message}");
            }
        }

        /// <summary>
        /// Notify when a template is used (board created from template)
        /// </summary>
        public async Task NotifyTemplateUsedAsync(int templateId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var template = await _templateService.GetTemplateByIdAsync(templateId, userId);
                
                if (template != null && template.IsPublic)
                {
                    // Get updated usage statistics
                    var stats = await _templateService.GetTemplateStatisticsAsync(templateId, userId);
                    
                    await Clients.Group(MarketplaceGroupName).SendAsync("TemplateUsed", new
                    {
                        TemplateId = templateId,
                        UsedBy = userId,
                        UpdatedStats = stats,
                        UsedAt = DateTime.UtcNow
                    });

                    _logger.LogInformation($"Template {templateId} used by user {userId}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying template usage: {ex.Message}");
            }
        }

        /// <summary>
        /// Notify when a template is reported
        /// </summary>
        public async Task NotifyTemplateReportedAsync(int templateId, string reason)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Notify administrators (this would typically be sent to admin group)
                await Clients.Group("Administrators").SendAsync("TemplateReported", new
                {
                    TemplateId = templateId,
                    Reason = reason,
                    ReportedBy = userId,
                    ReportedAt = DateTime.UtcNow
                });

                _logger.LogInformation($"Template {templateId} reported by user {userId}: {reason}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying template report: {ex.Message}");
            }
        }

        /// <summary>
        /// Send marketplace analytics update
        /// </summary>
        public async Task NotifyMarketplaceAnalyticsAsync()
        {
            try
            {
                var userId = GetCurrentUserId();
                var analytics = await _templateService.GetMarketplaceAnalyticsAsync(userId);
                
                await Clients.Group(MarketplaceGroupName).SendAsync("MarketplaceAnalytics", new
                {
                    Analytics = analytics,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error notifying marketplace analytics: {ex.Message}");
            }
        }

        /// <summary>
        /// Search templates with live results
        /// </summary>
        public async Task SearchTemplatesAsync(string searchTerm, string? category = null)
        {
            try
            {
                var templates = await _templateService.SearchTemplatesAsync(searchTerm);
                
                await Clients.Caller.SendAsync("SearchResults", new
                {
                    SearchTerm = searchTerm,
                    Category = category,
                    Results = templates,
                    SearchedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error performing template search: {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Search failed");
            }
        }

        /// <summary>
        /// Get popular templates (trending)
        /// </summary>
        public async Task GetTrendingTemplatesAsync()
        {
            try
            {
                var templates = await _templateService.GetPopularTemplatesAsync();
                
                await Clients.Caller.SendAsync("TrendingTemplates", new
                {
                    Templates = templates,
                    RetrievedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting trending templates: {ex.Message}");
                await Clients.Caller.SendAsync("Error", "Failed to load trending templates");
            }
        }

        /// <summary>
        /// Send current marketplace statistics to joining user
        /// </summary>
        private async Task SendMarketplaceStatsAsync()
        {
            try
            {
                var userId = GetCurrentUserId();
                var analytics = await _templateService.GetMarketplaceAnalyticsAsync(userId);
                
                await Clients.Caller.SendAsync("MarketplaceStats", new
                {
                    Analytics = analytics,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending marketplace stats: {ex.Message}");
            }
        }

        /// <summary>
        /// Handle client disconnection
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                var userId = GetCurrentUserId();
                _logger.LogInformation($"User {userId} disconnected from Template Marketplace Hub");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling disconnection");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Get current user ID from claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
} 