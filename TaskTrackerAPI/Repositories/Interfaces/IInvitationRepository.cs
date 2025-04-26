using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Repositories.Interfaces;

public interface IInvitationRepository
{
    Task<IEnumerable<Invitation>> GetAllAsync();
    Task<Invitation?> GetByIdAsync(int id);
    Task<IEnumerable<Invitation>> GetByFamilyIdAsync(int familyId);
    Task<IEnumerable<Invitation>> GetByEmailAsync(string email);
    Task<Invitation> CreateAsync(Invitation invitation);
    Task<Invitation?> UpdateAsync(Invitation invitation);
    Task<bool> DeleteAsync(int id);
    Task<Invitation?> GetByTokenAsync(string token);
    Task<bool> ExistsActiveInvitationAsync(int familyId, string email);
    Task<bool> MarkAsAcceptedAsync(int id);
} 