using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyRoleService
{
    Task<IEnumerable<FamilyRoleDTO>> GetAllAsync();
    Task<FamilyRoleDTO?> GetByIdAsync(int id);
    Task<FamilyRoleDTO?> GetByNameAsync(string name);
    Task<FamilyRoleDTO> CreateAsync(FamilyRoleCreateDTO roleDto);
    Task<FamilyRoleDTO?> UpdateAsync(int id, FamilyRoleUpdateDTO roleDto);
    Task<bool> DeleteAsync(int id);
    Task<bool> AddPermissionAsync(int roleId, string permission);
    Task<bool> RemovePermissionAsync(int roleId, string permission);
    Task<IEnumerable<string>> GetPermissionsAsync(int roleId);
} 