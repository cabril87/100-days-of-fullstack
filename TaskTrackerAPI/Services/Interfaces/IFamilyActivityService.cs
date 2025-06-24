/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskTrackerAPI.DTOs.Family;

namespace TaskTrackerAPI.Services.Interfaces;

public interface IFamilyActivityService
{
    /// <summary>
    /// Logs a family activity
    /// </summary>
    /// <param name="createDto">Activity details</param>
    /// <param name="userId">ID of the user creating the activity</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogActivityAsync(FamilyActivityCreateDTO createDto, int userId);
    
    /// <summary>
    /// Gets an activity by ID
    /// </summary>
    /// <param name="id">Activity ID</param>
    /// <param name="userId">ID of the user requesting the activity</param>
    /// <returns>Activity details</returns>
    Task<FamilyActivityDTO?> GetByIdAsync(int id, int userId);
    
    /// <summary>
    /// Gets all activities for a family with pagination
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetAllByFamilyIdAsync(
        int familyId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets filtered activities for a family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="filter">Filter criteria</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetFilteredAsync(
        int familyId, 
        FamilyActivityFilterDTO filter, 
        int userId);
        
    /// <summary>
    /// Searches activities with the given search term
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="searchTerm">Search term to match in descriptions</param>
    /// <param name="userId">ID of the user performing the search</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of matching activities</returns>
    Task<FamilyActivityPagedResultDTO> SearchAsync(
        int familyId, 
        string searchTerm, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by actor ID (who performed the action)
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actorId">ID of the actor</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByActorIdAsync(
        int familyId, 
        int actorId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by target ID (who was affected by the action)
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="targetId">ID of the target</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByTargetIdAsync(
        int familyId, 
        int targetId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by action type
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="actionType">Type of action</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByActionTypeAsync(
        int familyId, 
        string actionType, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    /// <summary>
    /// Gets activities by entity (task, achievement, etc.)
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="entityType">Type of entity</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="userId">ID of the user requesting the activities</param>
    /// <param name="pageNumber">Page number</param>
    /// <param name="pageSize">Page size</param>
    /// <returns>Paged result of activities</returns>
    Task<FamilyActivityPagedResultDTO> GetByEntityAsync(
        int familyId, 
        string entityType, 
        int entityId, 
        int userId, 
        int pageNumber = 1, 
        int pageSize = 20);
        
    // Automatic activity logging methods
    
    /// <summary>
    /// Logs a task completion activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user who completed the task</param>
    /// <param name="taskId">ID of the completed task</param>
    /// <param name="taskTitle">Title of the completed task</param>
    /// <param name="pointsEarned">Points earned from completion</param>
    /// <param name="category">Task category</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogTaskCompletionAsync(
        int familyId, 
        int userId, 
        int taskId, 
        string taskTitle, 
        int pointsEarned = 0, 
        string? category = null);
        
    /// <summary>
    /// Logs an achievement unlock activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user who unlocked the achievement</param>
    /// <param name="achievementName">Name of the unlocked achievement</param>
    /// <param name="pointsEarned">Points earned from the achievement</param>
    /// <param name="difficulty">Achievement difficulty</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogAchievementUnlockedAsync(
        int familyId, 
        int userId, 
        string achievementName, 
        int pointsEarned = 0, 
        string? difficulty = null);
        
    /// <summary>
    /// Logs a family member joining activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="newMemberId">ID of the new member</param>
    /// <param name="invitedByUserId">ID of the user who invited them (optional)</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogMemberJoinedAsync(
        int familyId, 
        int newMemberId, 
        int? invitedByUserId = null);
        
    /// <summary>
    /// Logs a streak milestone activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user who achieved the streak</param>
    /// <param name="streakDays">Number of consecutive days</param>
    /// <param name="streakType">Type of streak (task completion, login, etc.)</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogStreakMilestoneAsync(
        int familyId, 
        int userId, 
        int streakDays, 
        string streakType = "task_completion");
        
    /// <summary>
    /// Logs a point earning activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the user who earned points</param>
    /// <param name="pointsEarned">Number of points earned</param>
    /// <param name="reason">Reason for earning points</param>
    /// <param name="sourceType">Source type (task, achievement, bonus, etc.)</param>
    /// <param name="sourceId">ID of the source entity (optional)</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogPointsEarnedAsync(
        int familyId, 
        int userId, 
        int pointsEarned, 
        string reason, 
        string sourceType = "manual", 
        int? sourceId = null);
        
    /// <summary>
    /// Logs a family milestone activity
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="milestoneType">Type of milestone</param>
    /// <param name="description">Description of the milestone</param>
    /// <param name="triggeredByUserId">ID of the user who triggered the milestone (optional)</param>
    /// <param name="metadata">Additional milestone data</param>
    /// <returns>Created activity</returns>
    Task<FamilyActivityDTO> LogFamilyMilestoneAsync(
        int familyId, 
        string milestoneType, 
        string description, 
        int? triggeredByUserId = null, 
        Dictionary<string, object>? metadata = null);
} 