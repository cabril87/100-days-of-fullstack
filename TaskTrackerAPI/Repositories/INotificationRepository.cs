using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories
{
    public interface INotificationRepository
    {
        Task<IEnumerable<Notification>> GetAllNotificationsAsync();
        Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(int userId);
        Task<IEnumerable<Notification>> GetUnreadNotificationsByUserIdAsync(int userId);
        Task<Notification> GetNotificationByIdAsync(int id);
        Task<bool> CreateNotificationAsync(Notification notification);
        Task<bool> UpdateNotificationAsync(Notification notification);
        Task<bool> DeleteNotificationAsync(int id);
        Task<bool> MarkAsReadAsync(int id);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<Dictionary<string, int>> GetCountsByTypeAsync(int userId);
        Task<bool> IsOwnerAsync(int notificationId, int userId);
        Task<IEnumerable<Notification>> FilterNotificationsAsync(
            int userId, 
            bool? isRead = null, 
            string notificationType = null, 
            DateTime? fromDate = null, 
            DateTime? toDate = null, 
            string searchTerm = null);
    }
} 