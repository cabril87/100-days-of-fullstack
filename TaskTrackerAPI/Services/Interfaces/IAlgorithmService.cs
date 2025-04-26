using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services.Interfaces
{
    public interface IAlgorithmService
    {
        // Task Prioritization and Optimization
        Task<IEnumerable<TaskItem>> GetSmartPrioritizedTasksAsync(int userId);
        
        // Task Grouping and Organization
        Task<Dictionary<FamilyMember, List<TaskItem>>> GetFamilyLoadBalancingAsync(int familyId);
        Task<Dictionary<PrincipleDefinition, List<TaskItem>>> GetPrincipleTaskMatchingAsync(int userId);
        Task<List<List<TaskItem>>> GetContextualTaskGroupingAsync(int userId);
        Task<List<List<TaskItem>>> GetTaskDependencySequenceAsync(int userId);
        
        // Time and Effort Estimation
        Task<Dictionary<string, object>> GetTimeEstimationAsync(int userId, int taskId);
        
        // Suggestions and Recommendations
        Task<List<TaskItem>> GetRecurringTaskSuggestionsAsync(int userId);
        Task<List<TaskItem>> GetTaskSuggestionsBasedOnUserHabitsAsync(int userId);
        Task<List<string>> GetProductivityInsightsAsync(int userId);
    }
} 