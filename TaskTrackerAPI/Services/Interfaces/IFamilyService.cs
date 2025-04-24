using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyService
{
    Task<IEnumerable<FamilyDTO>> GetAllAsync();
    Task<FamilyDTO?> GetByIdAsync(int id);
    Task<IEnumerable<FamilyDTO>> GetByUserIdAsync(int userId);
    Task<FamilyDTO> CreateAsync(FamilyCreateDTO familyDto, int userId);
    Task<FamilyDTO?> UpdateAsync(int id, FamilyUpdateDTO familyDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> AddMemberAsync(int familyId, int userId, int roleId, int requestingUserId);
    Task<bool> RemoveMemberAsync(int familyId, int memberId, int requestingUserId);
    Task<bool> UpdateMemberRoleAsync(int familyId, int memberId, int roleId, int requestingUserId);
    Task<IEnumerable<FamilyMemberDTO>> GetMembersAsync(int familyId, int userId);
    Task<bool> HasPermissionAsync(int familyId, int userId, string permission);
    Task<FamilyMemberDTO> CompleteMemberProfileAsync(int memberId, int userId, CompleteProfileDTO profileDto);
    Task<IEnumerable<FamilyMemberDTO>> GetPendingMembersAsync();
    Task<FamilyMemberDTO> ApproveMemberAsync(int memberId, int adminId);
    Task<bool> RejectMemberAsync(int memberId, int adminId, string reason);
} 