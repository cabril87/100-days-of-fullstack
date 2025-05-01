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
// Services/Interfaces/IAuthService.cs
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IAuthService
{
    // Authentication methods
    Task<UserDTO> RegisterUserAsync(UserCreateDTO userDto);
    Task<TokensResponseDTO> LoginAsync(UserLoginDTO loginDto, string ipAddress);
    Task<TokensResponseDTO> RefreshTokenAsync(string refreshToken, string ipAddress);

    // User profile methods
    Task<UserDTO> GetUserProfileAsync(int userId);
    Task UpdateUserProfileAsync(int userId, UserProfileUpdateDTO updateDto);
    Task DeleteUserAsync(int userId, int currentUserId);
    Task ChangePasswordAsync(int userId, PasswordChangeDTO changePasswordDto, string ipAddress);

    // Admin operations
    Task<IEnumerable<UserDTO>> GetAllUsersAsync();
    Task UpdateUserRoleAsync(int userId, string role, int adminId);

    // Token generation
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}