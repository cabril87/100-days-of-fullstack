using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyAchievementService
{
    Task<IEnumerable<FamilyAchievementDTO>> GetAllAsync();
    Task<FamilyAchievementDTO?> GetByIdAsync(int id);
    Task<IEnumerable<FamilyAchievementDTO>> GetByFamilyIdAsync(int familyId, int userId);
    Task<IEnumerable<FamilyAchievementDTO>> GetCompletedByFamilyIdAsync(int familyId, int userId);
    Task<IEnumerable<FamilyAchievementDTO>> GetInProgressByFamilyIdAsync(int familyId, int userId);
    Task<FamilyAchievementDTO> CreateAsync(FamilyAchievementCreateDTO achievementDto, int userId);
    Task<FamilyAchievementDTO?> UpdateAsync(int id, FamilyAchievementUpdateDTO achievementDto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    
    Task<bool> UpdateProgressAsync(int achievementId, int progressIncrease, int memberId, int userId);
    Task<IEnumerable<FamilyLeaderboardDTO>> GetLeaderboardAsync(int limit = 10);
    Task<FamilyLeaderboardDTO?> GetFamilyStatsAsync(int familyId, int userId);
    
    // Task completion tracking
    Task<bool> TrackTaskCompletionAsync(int taskId, int memberId, int userId);
} 