using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IFamilyMemberRepository
{
    Task<IEnumerable<FamilyMember>> GetAllAsync();
    Task<FamilyMember?> GetByIdAsync(int id);
    Task<FamilyMember?> GetByIdWithDetailsAsync(int id);
    Task<FamilyMember> CreateAsync(FamilyMember member);
    Task<FamilyMember?> UpdateAsync(FamilyMember member);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsByIdAsync(int id);
    Task<IEnumerable<FamilyMember>> GetByFamilyIdAsync(int familyId);
    Task<IEnumerable<FamilyMember>> GetByUserIdAsync(int userId);
    Task<bool> IsFamilyMemberOwnedByUserAsync(int familyMemberId, int userId);
}