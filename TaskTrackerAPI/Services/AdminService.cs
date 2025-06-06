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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using AutoMapper;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service for admin operations including user creation and family management
    /// </summary>
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IFamilyRepository _familyRepository;
        private readonly IFamilyMemberRepository _familyMemberRepository;
        private readonly IFamilyRoleRepository _familyRoleRepository;
        private readonly IAuthService _authService;
        private readonly IMapper _mapper;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            IUserRepository userRepository,
            IFamilyRepository familyRepository,
            IFamilyMemberRepository familyMemberRepository,
            IFamilyRoleRepository familyRoleRepository,
            IAuthService authService,
            IMapper mapper,
            ILogger<AdminService> logger)
        {
            _userRepository = userRepository;
            _familyRepository = familyRepository;
            _familyMemberRepository = familyMemberRepository;
            _familyRoleRepository = familyRoleRepository;
            _authService = authService;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new user with optional family assignment (Admin only)
        /// </summary>
        public async Task<AdminUserCreateResponseDTO> CreateUserWithFamilyAssignmentAsync(int adminUserId, AdminUserCreateDTO userCreateDto)
        {
            try
            {
                _logger.LogInformation($"Admin user {adminUserId} creating new user: {userCreateDto.Username}");

                // Validate admin permissions
                User? adminUser = await _userRepository.GetByIdAsync(adminUserId);
                if (adminUser == null)
                {
                    throw new UnauthorizedAccessException("Admin user not found");
                }

                // Create the user using the auth service
                UserCreateDTO userCreateRequest = new UserCreateDTO
                {
                    Username = userCreateDto.Username,
                    Email = userCreateDto.Email,
                    Password = userCreateDto.Password,
                    ConfirmPassword = userCreateDto.ConfirmPassword,
                    FirstName = userCreateDto.FirstName,
                    LastName = userCreateDto.LastName,
                    AgeGroup = userCreateDto.AgeGroup,
                    DateOfBirth = userCreateDto.DateOfBirth
                };

                // Register the user through auth service
                UserDTO createdUser = await _authService.RegisterUserAsync(userCreateRequest);

                _logger.LogInformation($"Successfully created user {createdUser.Id}: {createdUser.Username}");

                // Prepare response
                AdminUserCreateResponseDTO response = new AdminUserCreateResponseDTO
                {
                    User = createdUser,
                    Message = $"User '{createdUser.Username}' created successfully"
                };

                // Handle family assignment if specified
                if (userCreateDto.FamilyId.HasValue)
                {
                    await AssignUserToFamilyAsync(createdUser.Id, userCreateDto.FamilyId.Value, userCreateDto.FamilyRoleId, adminUserId);
                    
                    // Get family info for response
                    Family? family = await _familyRepository.GetByIdAsync(userCreateDto.FamilyId.Value);
                    FamilyRole? familyRole = userCreateDto.FamilyRoleId.HasValue 
                        ? await _familyRoleRepository.GetByIdAsync(userCreateDto.FamilyRoleId.Value)
                        : await _familyRoleRepository.GetByNameAsync("Member"); // Default role

                    if (family != null && familyRole != null)
                    {
                        response.FamilyAssignment = new FamilyAssignmentDTO
                        {
                            FamilyId = family.Id,
                            FamilyName = family.Name,
                            RoleId = familyRole.Id,
                            RoleName = familyRole.Name
                        };
                        response.Message += $" and assigned to family '{family.Name}' as '{familyRole.Name}'";
                    }
                }

                _logger.LogInformation($"Admin user creation completed: {response.Message}");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to create user via admin: {userCreateDto.Username}");
                throw;
            }
        }

        /// <summary>
        /// Gets all families that the admin has access to (Admin only)
        /// </summary>
        public async Task<List<AdminFamilySelectionDTO>> GetAdminAccessibleFamiliesAsync(int adminUserId)
        {
            try
            {
                _logger.LogInformation($"Getting accessible families for admin user {adminUserId}");

                // Get families where the admin is an admin or has management permissions
                IEnumerable<Family> adminFamilies = await _familyRepository.GetFamiliesUserIsAdminOfAsync(adminUserId);
                IEnumerable<Family> managementFamilies = await _familyRepository.GetFamiliesUserHasManagementPrivilegesAsync(adminUserId);

                // Combine and deduplicate
                List<Family> allAccessibleFamilies = adminFamilies
                    .Concat(managementFamilies)
                    .GroupBy(f => f.Id)
                    .Select(g => g.First())
                    .ToList();

                List<AdminFamilySelectionDTO> result = new List<AdminFamilySelectionDTO>();

                foreach (Family family in allAccessibleFamilies)
                {
                    IEnumerable<FamilyMember> members = await _familyMemberRepository.GetByFamilyIdAsync(family.Id);
                    int memberCount = members.Count();
                    
                    result.Add(new AdminFamilySelectionDTO
                    {
                        Id = family.Id,
                        Name = family.Name,
                        Description = family.Description,
                        MemberCount = memberCount,
                        CreatedAt = family.CreatedAt
                    });
                }

                _logger.LogInformation($"Found {result.Count} accessible families for admin user {adminUserId}");
                return result.OrderBy(f => f.Name).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to get accessible families for admin user {adminUserId}");
                throw;
            }
        }

        /// <summary>
        /// Gets all available family roles for assignment
        /// </summary>
        public async Task<List<FamilyRoleDTO>> GetFamilyRolesAsync()
        {
            try
            {
                _logger.LogInformation("Getting all family roles");

                IEnumerable<FamilyRole> roles = await _familyRoleRepository.GetAllAsync();
                List<FamilyRoleDTO> result = _mapper.Map<List<FamilyRoleDTO>>(roles);

                _logger.LogInformation($"Found {result.Count} family roles");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get family roles");
                throw;
            }
        }

        /// <summary>
        /// Helper method to assign user to family
        /// </summary>
        private async Task AssignUserToFamilyAsync(int userId, int familyId, int? roleId, int adminUserId)
        {
            try
            {
                _logger.LogInformation($"Assigning user {userId} to family {familyId}");

                // Validate family exists and admin has access
                Family? family = await _familyRepository.GetByIdAsync(familyId);
                if (family == null)
                {
                    throw new ArgumentException($"Family with ID {familyId} not found");
                }

                // Check if admin has permission to add members to this family
                bool adminCanManage = await _familyRepository.IsUserAdminOfFamilyAsync(adminUserId, familyId);
                if (!adminCanManage)
                {
                    throw new UnauthorizedAccessException($"Admin user {adminUserId} does not have permission to manage family {familyId}");
                }

                // Get role or use default "Member" role
                FamilyRole? role;
                if (roleId.HasValue)
                {
                    role = await _familyRoleRepository.GetByIdAsync(roleId.Value);
                    if (role == null)
                    {
                        throw new ArgumentException($"Family role with ID {roleId} not found");
                    }
                }
                else
                {
                    role = await _familyRoleRepository.GetByNameAsync("Member");
                    if (role == null)
                    {
                        throw new InvalidOperationException("Default 'Member' role not found in database");
                    }
                }

                // Check if user is already a member
                IEnumerable<FamilyMember> existingMembers = await _familyMemberRepository.GetByUserIdAsync(userId);
                bool isAlreadyMember = existingMembers.Any(m => m.FamilyId == familyId);
                if (isAlreadyMember)
                {
                    throw new InvalidOperationException($"User {userId} is already a member of family {familyId}");
                }

                // Create family member
                FamilyMember familyMember = new FamilyMember
                {
                    UserId = userId,
                    FamilyId = familyId,
                    RoleId = role.Id,
                    JoinedAt = DateTime.UtcNow,
                    RelationshipToAdmin = FamilyRelationshipType.Other // Can be customized based on role
                };

                await _familyMemberRepository.CreateAsync(familyMember);
                _logger.LogInformation($"Successfully assigned user {userId} to family {familyId} with role {role.Name}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to assign user {userId} to family {familyId}");
                throw;
            }
        }
    }
} 