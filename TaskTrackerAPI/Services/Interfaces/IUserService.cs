/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
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