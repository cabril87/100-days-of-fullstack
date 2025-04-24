using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IFamilyRepository
{
    Task<IEnumerable<Family>> GetAllAsync();
    Task<Family?> GetByIdAsync(int id);
    Task<IEnumerable<Family>> GetByUserIdAsync(int userId);
    Task<Family> CreateAsync(Family family);
    Task<Family?> UpdateAsync(Family family);
    Task<bool> DeleteAsync(int id);
    Task<bool> AddMemberAsync(int familyId, int userId, int roleId);
    Task<bool> RemoveMemberAsync(int familyId, int userId);
    Task<bool> UpdateMemberRoleAsync(int familyId, int userId, int roleId);
    Task<IEnumerable<FamilyMember>> GetMembersAsync(int familyId);
    Task<bool> FamilyExistsAsync(int familyId);
    Task<bool> IsMemberAsync(int familyId, int userId);
    Task<bool> HasPermissionAsync(int familyId, int userId, string permission);
    Task<FamilyMember?> GetMemberByIdAsync(int memberId);
    Task<FamilyMember?> GetMemberByUserIdAsync(int userId);
    Task<IEnumerable<FamilyMember>> GetPendingMembersAsync();
    Task<bool> UpdateMemberAsync(FamilyMember member);
    Task<bool> DeleteMemberAsync(int memberId);
} 