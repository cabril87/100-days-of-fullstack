using AutoMapper;
using TaskTrackerAPI.DTOs.Notifications;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public NotificationService(
        INotificationRepository notificationRepository,
        IUserRepository userRepository,
        IMapper mapper)
    {
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<NotificationDTO>> GetAllNotificationsAsync(int userId)
    {
        IEnumerable<Notification> notifications = await _notificationRepository.GetNotificationsByUserIdAsync(userId);
        IEnumerable<NotificationDTO> notificationDtos = _mapper.Map<IEnumerable<NotificationDTO>>(notifications);
        return notificationDtos;
    }

    public async Task<IEnumerable<NotificationDTO>> GetFilteredNotificationsAsync(int userId, NotificationFilterDTO filter)
    {
        IEnumerable<Notification> notifications = await _notificationRepository.GetFilteredNotificationsAsync(userId, filter);
        IEnumerable<NotificationDTO> notificationDtos = _mapper.Map<IEnumerable<NotificationDTO>>(notifications);
        return notificationDtos;
    }

    public async Task<NotificationDTO?> GetNotificationByIdAsync(int userId, int notificationId)
    {
        if (!await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId))
        {
            return null;
        }

        Notification? notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
        if (notification == null)
            return null;
        NotificationDTO notificationDto = _mapper.Map<NotificationDTO>(notification);
        return notificationDto;
    }

    public async Task<NotificationDTO?> CreateNotificationAsync(int userId, CreateNotificationDTO notificationDto)
    {
        return await CreateNotificationForUserAsync(userId, userId, notificationDto);
    }

    public async Task<NotificationDTO?> CreateNotificationForUserAsync(int creatorUserId, int targetUserId, CreateNotificationDTO notificationDto)
    {
        // Verify the target user exists
        User? user = await _userRepository.GetUserByIdAsync(targetUserId);
        if (user == null)
        {
            return null;
        }

        Notification notification = _mapper.Map<Notification>(notificationDto);
        notification.UserId = targetUserId;
        notification.CreatedAt = DateTime.UtcNow;

        await _notificationRepository.CreateNotificationAsync(notification);
        NotificationDTO result = _mapper.Map<NotificationDTO>(notification);
        return result;
    }

    public async Task<NotificationDTO?> MarkNotificationAsReadAsync(int userId, int notificationId)
    {
        if (!await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId))
        {
            return null;
        }

        await _notificationRepository.MarkNotificationAsReadAsync(notificationId);
        Notification? notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
        if (notification == null)
            return null;
        NotificationDTO notificationDto = _mapper.Map<NotificationDTO>(notification);
        return notificationDto;
    }

    public async Task<int> MarkAllNotificationsAsReadAsync(int userId)
    {
        return await _notificationRepository.MarkAllNotificationsAsReadAsync(userId);
    }

    public async Task DeleteNotificationAsync(int userId, int notificationId)
    {
        if (!await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId))
        {
            return;
        }

        Notification? notification = await _notificationRepository.GetNotificationByIdAsync(notificationId);
        if (notification != null)
        {
            await _notificationRepository.DeleteNotificationAsync(notification);
        }
    }

    public async Task DeleteAllNotificationsAsync(int userId)
    {
        await _notificationRepository.DeleteAllNotificationsAsync(userId);
    }

    public async Task<NotificationCountDTO> GetNotificationCountsAsync(int userId)
    {
        return await _notificationRepository.GetNotificationCountsAsync(userId);
    }

    public async Task<int> GetUnreadNotificationCountAsync(int userId)
    {
        return await _notificationRepository.GetUnreadNotificationCountAsync(userId);
    }

    public async Task<bool> IsNotificationOwnedByUserAsync(int notificationId, int userId)
    {
        return await _notificationRepository.IsNotificationOwnedByUserAsync(notificationId, userId);
    }

    Task<IEnumerable<NotificationDTO>> INotificationService.GetAllNotificationsAsync(int userId)
    {
        throw new NotImplementedException();
    }


    Task<NotificationDTO?> INotificationService.GetNotificationByIdAsync(int userId, int notificationId)
    {
        throw new NotImplementedException();
    }

    Task<NotificationDTO?> INotificationService.MarkNotificationAsReadAsync(int userId, int notificationId)
    {
        throw new NotImplementedException();
    }

    Task<NotificationCountDTO> INotificationService.GetNotificationCountsAsync(int userId)
    {
        throw new NotImplementedException();
    }
} 