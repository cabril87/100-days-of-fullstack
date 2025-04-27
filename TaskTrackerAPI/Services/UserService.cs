using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<UserDTO?> GetUserByIdAsync(int id)
        {
            User? user = await _userRepository.GetUserByIdAsync(id);
            return user != null ? _mapper.Map<UserDTO>(user) : null;
        }

        public async Task<IEnumerable<UserDTO>> GetAllUsersAsync()
        {
            IEnumerable<User> users = await _userRepository.GetAllUsersAsync();
            return _mapper.Map<IEnumerable<UserDTO>>(users);
        }

        public async Task<UserDTO> UpdateUserAsync(int userId, UserProfileUpdateDTO updateDto)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            
            // Check if username is taken (if it's being changed)
            if (updateDto.Username != null && 
                updateDto.Username != user.Username &&
                await _userRepository.UserExistsByUsernameAsync(updateDto.Username))
            {
                throw new ArgumentException("Username is already taken");
            }
            
            // Check if email is taken (if it's being changed)
            if (updateDto.Email != null && 
                updateDto.Email != user.Email &&
                await _userRepository.UserExistsByEmailAsync(updateDto.Email))
            {
                throw new ArgumentException("Email is already registered");
            }
            
            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(updateDto.Username))
                user.Username = updateDto.Username;
                
            if (!string.IsNullOrWhiteSpace(updateDto.Email))
                user.Email = updateDto.Email;
                
            if (updateDto.FirstName != null)
                user.FirstName = updateDto.FirstName;
                
            if (updateDto.LastName != null)
                user.LastName = updateDto.LastName;
                
            user.UpdatedAt = DateTime.UtcNow;
            
            await _userRepository.UpdateUserAsync(user);
            
            return _mapper.Map<UserDTO>(user);
        }

        public async Task DeleteUserAsync(int userId)
        {
            User? user = await _userRepository.GetUserByIdAsync(userId);
            
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }
            
            await _userRepository.DeleteUserAsync(userId);
        }

        public async Task<bool> IsValidUserCredentialsAsync(string email, string password)
        {
            return await _userRepository.IsValidUserCredentialsAsync(email, password);
        }

        Task<UserDTO?> IUserService.GetUserByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        Task<IEnumerable<UserDTO>> IUserService.GetAllUsersAsync()
        {
            throw new NotImplementedException();
        }

    }
} 