using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IFamilyAchievementRepository
{
    Task<IEnumerable<FamilyAchievement>> GetAllAsync();
    Task<FamilyAchievement?> GetByIdAsync(int id);
    Task<IEnumerable<FamilyAchievement>> GetByFamilyIdAsync(int familyId);
    Task<IEnumerable<FamilyAchievement>> GetCompletedByFamilyIdAsync(int familyId);
    Task<IEnumerable<FamilyAchievement>> GetInProgressByFamilyIdAsync(int familyId);
    Task<FamilyAchievement> CreateAsync(FamilyAchievement achievement);
    Task<FamilyAchievement?> UpdateAsync(FamilyAchievement achievement);
    Task<bool> DeleteAsync(int id);
    
    Task<bool> UpdateProgressAsync(int achievementId, int progressIncrease);
    Task<bool> AddMemberContributionAsync(int achievementId, int memberId, int points);
    Task<IEnumerable<FamilyAchievementMember>> GetMemberContributionsAsync(int achievementId);
    Task<int> GetFamilyPointsTotalAsync(int familyId);
} 