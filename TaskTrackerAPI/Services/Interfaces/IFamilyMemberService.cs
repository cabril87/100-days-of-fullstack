using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyMemberService
{
    Task<IEnumerable<FamilyPersonDTO>> GetAllAsync();
    Task<FamilyPersonDTO?> GetByIdAsync(int id);
    Task<FamilyPersonDetailDTO?> GetDetailsByIdAsync(int id);
    Task<FamilyPersonDTO> CreateAsync(CreateFamilyPersonDTO memberDto, int userId);
    Task<FamilyPersonDTO?> UpdateAsync(int id, UpdateFamilyPersonDTO memberDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<bool> IsUserMemberOfFamilyAsync(int userId, int familyId);
} 