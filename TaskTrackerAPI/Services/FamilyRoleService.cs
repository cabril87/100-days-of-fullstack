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
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class FamilyRoleService : IFamilyRoleService
{
    private readonly IFamilyRoleRepository _roleRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyRoleService> _logger;

    public FamilyRoleService(
        IFamilyRoleRepository roleRepository,
        IMapper mapper,
        ILogger<FamilyRoleService> logger)
    {
        _roleRepository = roleRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyRoleDTO>> GetAllAsync()
    {
        IEnumerable<FamilyRole> roles = await _roleRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<FamilyRoleDTO>>(roles);
    }

    public async Task<FamilyRoleDTO?> GetByIdAsync(int id)
    {
        FamilyRole? role = await _roleRepository.GetByIdAsync(id);
        return role != null ? _mapper.Map<FamilyRoleDTO>(role) : null;
    }

    public async Task<FamilyRoleDTO?> GetByNameAsync(string name)
    {
        FamilyRole? role = await _roleRepository.GetByNameAsync(name);
        return role != null ? _mapper.Map<FamilyRoleDTO>(role) : null;
    }

    public async Task<FamilyRoleDTO> CreateAsync(FamilyRoleCreateDTO roleDto)
    {
        if (await _roleRepository.ExistsByNameAsync(roleDto.Name))
        {
            _logger.LogWarning("Attempted to create a role with existing name: {Name}", roleDto.Name);
            throw new InvalidOperationException($"Role with name '{roleDto.Name}' already exists");
        }

        FamilyRole role = _mapper.Map<FamilyRole>(roleDto);
        role.CreatedAt = DateTime.UtcNow;

        // Create permissions
        role.Permissions = roleDto.Permissions.Select(p => new FamilyRolePermission
        {
            Name = p,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        FamilyRole? createdRole = await _roleRepository.CreateAsync(role);
        if (createdRole == null)
        {
            _logger.LogError("Failed to create family role: {Name}", roleDto.Name);
            throw new InvalidOperationException("Failed to create family role");
        }
        
        return _mapper.Map<FamilyRoleDTO>(createdRole);
    }

    public async Task<FamilyRoleDTO?> UpdateAsync(int id, FamilyRoleUpdateDTO roleDto)
    {
        FamilyRole? role = await _roleRepository.GetByIdAsync(id);
        if (role == null)
            return null;

        if (roleDto.Name != null && 
            roleDto.Name != role.Name && 
            await _roleRepository.ExistsByNameAsync(roleDto.Name))
        {
            _logger.LogWarning("Attempted to update role name to existing name: {Name}", roleDto.Name);
            throw new InvalidOperationException($"Role with name '{roleDto.Name}' already exists");
        }

        _mapper.Map(roleDto, role);
        role.UpdatedAt = DateTime.UtcNow;

        // Update permissions if provided
        if (roleDto.Permissions != null)
        {
            // Remove existing permissions
            role.Permissions.Clear();
            
            // Add new permissions
            foreach (string permission in roleDto.Permissions)
            {
                role.Permissions.Add(new FamilyRolePermission
                {
                    Name = permission,
                    RoleId = role.Id,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        FamilyRole? updatedRole = await _roleRepository.UpdateAsync(role);
        return updatedRole != null ? _mapper.Map<FamilyRoleDTO>(updatedRole) : null;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        FamilyRole? role = await _roleRepository.GetByIdAsync(id);
        if (role == null)
            return false;

        if (role.IsDefault)
        {
            _logger.LogWarning("Attempted to delete a default role: {Id}", id);
            throw new InvalidOperationException("Default roles cannot be deleted");
        }

        return await _roleRepository.DeleteAsync(id);
    }

    public async Task<bool> AddPermissionAsync(int roleId, string permission)
    {
        FamilyRole? role = await _roleRepository.GetByIdAsync(roleId);
        if (role == null)
            return false;

        if (role.Permissions.Any(p => p.Name == permission))
            return true; // Permission already exists

        role.Permissions.Add(new FamilyRolePermission
        {
            Name = permission,
            RoleId = roleId,
            CreatedAt = DateTime.UtcNow
        });

        await _roleRepository.UpdateAsync(role);
        return true;
    }

    public async Task<bool> RemovePermissionAsync(int roleId, string permission)
    {
        FamilyRole? role = await _roleRepository.GetByIdAsync(roleId);
        if (role == null)
            return false;

        FamilyRolePermission? permissionToRemove = role.Permissions.FirstOrDefault(p => p.Name == permission);
        if (permissionToRemove == null)
            return true; // Permission doesn't exist, so it's already "removed"

        role.Permissions.Remove(permissionToRemove);
        await _roleRepository.UpdateAsync(role);
        return true;
    }

    public async Task<IEnumerable<string>> GetPermissionsAsync(int roleId)
    {
        FamilyRole? role = await _roleRepository.GetByIdAsync(roleId);
        if (role == null)
            return new List<string>();

        return role.Permissions.Select(p => p.Name).ToList();
    }
} 