using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IFamilyRoleRepository
{
    Task<IEnumerable<FamilyRole>> GetAllAsync();
    Task<FamilyRole?> GetByIdAsync(int id);
    Task<FamilyRole?> GetByNameAsync(string name);
    Task<FamilyRole> CreateAsync(FamilyRole role);
    Task<FamilyRole?> UpdateAsync(FamilyRole role);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsByIdAsync(int id);
    Task<bool> ExistsByNameAsync(string name);
    Task<List<FamilyRolePermission>> GetPermissionsAsync(int roleId);
    Task<bool> AddPermissionAsync(FamilyRolePermission permission);
    Task<bool> RemovePermissionAsync(int permissionId);
} 