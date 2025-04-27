using TaskTrackerAPI.DTOs.Notifications;

namespace TaskTrackerAPI.Services.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationDTO>> GetAllNotificationsAsync(int userId);
    Task<IEnumerable<NotificationDTO>> GetFilteredNotificationsAsync(int userId, NotificationFilterDTO filter);
    Task<NotificationDTO?> GetNotificationByIdAsync(int userId, int notificationId);
    Task<NotificationDTO?> CreateNotificationAsync(int userId, CreateNotificationDTO notificationDto);
    Task<NotificationDTO?> CreateNotificationForUserAsync(int creatorUserId, int targetUserId, CreateNotificationDTO notificationDto);
    Task<NotificationDTO?> MarkNotificationAsReadAsync(int userId, int notificationId);
    Task<int> MarkAllNotificationsAsReadAsync(int userId);
    Task DeleteNotificationAsync(int userId, int notificationId);
    Task DeleteAllNotificationsAsync(int userId);
    Task<NotificationCountDTO> GetNotificationCountsAsync(int userId);
    Task<int> GetUnreadNotificationCountAsync(int userId);
    Task<bool> IsNotificationOwnedByUserAsync(int notificationId, int userId);
} 