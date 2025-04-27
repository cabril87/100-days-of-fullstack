using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface ITaskSharingService
    {
        Task<FamilyTaskItemDTO?> AssignTaskToFamilyMemberAsync(int taskId, int familyMemberId, int userId, bool requiresApproval);
        Task<bool> UnassignTaskFromFamilyMemberAsync(int taskId, int userId);
        Task<IEnumerable<FamilyTaskItemDTO>> GetTasksAssignedToFamilyMemberAsync(int familyMemberId, int userId);
        Task<IEnumerable<FamilyTaskItemDTO>> GetFamilyTasksAsync(int familyId, int userId);
        Task<bool> ApproveTaskAsync(int taskId, int userId, TaskApprovalDTO approvalDto);
        Task<FamilyTaskItemDTO?> GetFamilyTaskByIdAsync(int taskId, int userId);
    }
} 