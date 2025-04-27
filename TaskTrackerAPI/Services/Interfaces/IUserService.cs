using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDTO?> GetUserByIdAsync(int id);
        Task<IEnumerable<UserDTO>> GetAllUsersAsync();
        Task<UserDTO> UpdateUserAsync(int userId, UserProfileUpdateDTO updateDto);
        Task DeleteUserAsync(int userId);
        Task<bool> IsValidUserCredentialsAsync(string email, string password);
    }
} 