using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Notifications;

namespace TaskTrackerAPI.Interfaces
{
    public interface INotificationService
    {
        /// <summary>
        /// Get all notifications for a specific user
        /// </summary>
        Task<IEnumerable<NotificationDTO>> GetUserNotificationsAsync(int userId);

        /// <summary>
        /// Get a notification by its ID
        /// </summary>
        Task<NotificationDTO> GetNotificationByIdAsync(int notificationId);

        /// <summary>
        /// Get the count of unread notifications for a user
        /// </summary>
        Task<int> GetUnreadNotificationCountAsync(int userId);

        /// <summary>
        /// Get notification counts by category/type for a user
        /// </summary>
        Task<NotificationCountsDTO> GetNotificationCountsAsync(int userId);

        /// <summary>
        /// Filter notifications based on criteria
        /// </summary>
        Task<IEnumerable<NotificationDTO>> FilterNotificationsAsync(int userId, NotificationFilterDTO filter);

        /// <summary>
        /// Create a new notification
        /// </summary>
        Task<NotificationDTO> CreateNotificationAsync(NotificationCreateDTO notification, int createdByUserId);

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        Task<NotificationDTO> MarkNotificationAsReadAsync(int notificationId);

        /// <summary>
        /// Mark all notifications as read for a user
        /// </summary>
        Task MarkAllNotificationsAsReadAsync(int userId);

        /// <summary>
        /// Delete a notification
        /// </summary>
        Task DeleteNotificationAsync(int notificationId);

        /// <summary>
        /// Delete all notifications for a user
        /// </summary>
        Task DeleteAllUserNotificationsAsync(int userId);
    }
} 