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
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services;

public class FamilyAchievementService : IFamilyAchievementService
{
    private readonly IFamilyAchievementRepository _achievementRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly ITaskItemRepository _taskRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<FamilyAchievementService> _logger;

    public FamilyAchievementService(
        IFamilyAchievementRepository achievementRepository,
        IFamilyRepository familyRepository,
        ITaskItemRepository taskRepository,
        IMapper mapper,
        ILogger<FamilyAchievementService> logger)
    {
        _achievementRepository = achievementRepository;
        _familyRepository = familyRepository;
        _taskRepository = taskRepository;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<FamilyAchievementDTO>> GetAllAsync()
    {
        IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<FamilyAchievementDTO>>(achievements);
    }

    public async Task<FamilyAchievementDTO?> GetByIdAsync(int id)
    {
        FamilyAchievement? achievement = await _achievementRepository.GetByIdAsync(id);
        return achievement != null ? _mapper.Map<FamilyAchievementDTO>(achievement) : null;
    }

    public async Task<IEnumerable<FamilyAchievementDTO>> GetByFamilyIdAsync(int familyId, int userId)
    {
        // Verify user is member of family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access achievements for family {FamilyId} without being a member", userId, familyId);
            return Enumerable.Empty<FamilyAchievementDTO>();
        }

        IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetByFamilyIdAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyAchievementDTO>>(achievements);
    }

    public async Task<IEnumerable<FamilyAchievementDTO>> GetCompletedByFamilyIdAsync(int familyId, int userId)
    {
        // Verify user is member of family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access completed achievements for family {FamilyId} without being a member", userId, familyId);
            return Enumerable.Empty<FamilyAchievementDTO>();
        }

        IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetCompletedByFamilyIdAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyAchievementDTO>>(achievements);
    }

    public async Task<IEnumerable<FamilyAchievementDTO>> GetInProgressByFamilyIdAsync(int familyId, int userId)
    {
        // Verify user is member of family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access in-progress achievements for family {FamilyId} without being a member", userId, familyId);
            return Enumerable.Empty<FamilyAchievementDTO>();
        }

        IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetInProgressByFamilyIdAsync(familyId);
        return _mapper.Map<IEnumerable<FamilyAchievementDTO>>(achievements);
    }

    public async Task<FamilyAchievementDTO> CreateAsync(FamilyAchievementCreateDTO achievementDto, int userId)
    {
        // Verify user has permission to manage achievements
        if (!await _familyRepository.HasPermissionAsync(achievementDto.FamilyId, userId, "manage_achievements"))
        {
            _logger.LogWarning("User {UserId} attempted to create achievement for family {FamilyId} without permission", userId, achievementDto.FamilyId);
            throw new UnauthorizedAccessException("You don't have permission to create achievements for this family");
        }

        FamilyAchievement achievement = _mapper.Map<FamilyAchievement>(achievementDto);
        achievement.CreatedAt = DateTime.UtcNow;

        FamilyAchievement createdAchievement = await _achievementRepository.CreateAsync(achievement);
        return _mapper.Map<FamilyAchievementDTO>(createdAchievement);
    }

    public async Task<FamilyAchievementDTO?> UpdateAsync(int id, FamilyAchievementUpdateDTO achievementDto, int userId)
    {
        FamilyAchievement? achievement = await _achievementRepository.GetByIdAsync(id);
        if (achievement == null)
            return null;

        // Verify user has permission to manage achievements
        if (!await _familyRepository.HasPermissionAsync(achievement.FamilyId, userId, "manage_achievements"))
        {
            _logger.LogWarning("User {UserId} attempted to update achievement {AchievementId} without permission", userId, id);
            return null;
        }

        // Update achievement fields
        if (achievementDto.Name != null)
            achievement.Name = achievementDto.Name;
            
        if (achievementDto.Description != null)
            achievement.Description = achievementDto.Description;
            
        if (achievementDto.PointValue.HasValue)
            achievement.PointValue = achievementDto.PointValue.Value;
            
        if (achievementDto.IconUrl != null)
            achievement.IconUrl = achievementDto.IconUrl;
            
        if (achievementDto.ProgressTarget.HasValue)
            achievement.ProgressTarget = achievementDto.ProgressTarget.Value;
            
        achievement.UpdatedAt = DateTime.UtcNow;

        FamilyAchievement? updatedAchievement = await _achievementRepository.UpdateAsync(achievement);
        return updatedAchievement != null ? _mapper.Map<FamilyAchievementDTO>(updatedAchievement) : null;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        FamilyAchievement? achievement = await _achievementRepository.GetByIdAsync(id);
        if (achievement == null)
            return false;

        // Verify user has permission to manage achievements
        if (!await _familyRepository.HasPermissionAsync(achievement.FamilyId, userId, "manage_achievements"))
        {
            _logger.LogWarning("User {UserId} attempted to delete achievement {AchievementId} without permission", userId, id);
            return false;
        }

        return await _achievementRepository.DeleteAsync(id);
    }

    public async Task<bool> UpdateProgressAsync(int achievementId, int progressIncrease, int memberId, int userId)
    {
        FamilyAchievement? achievement = await _achievementRepository.GetByIdAsync(achievementId);
        if (achievement == null)
            return false;

        // Verify user is a member of the family
        if (!await _familyRepository.IsMemberAsync(achievement.FamilyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to update progress for achievement {AchievementId} without being a family member", userId, achievementId);
            return false;
        }

        // Update achievement progress
        await _achievementRepository.UpdateProgressAsync(achievementId, progressIncrease);
        
        // Add member contribution
        await _achievementRepository.AddMemberContributionAsync(achievementId, memberId, progressIncrease);

        return true;
    }

    public async Task<IEnumerable<FamilyLeaderboardDTO>> GetLeaderboardAsync(int limit = 10)
    {
        IEnumerable<Family> families = await _familyRepository.GetAllAsync();
        List<FamilyLeaderboardDTO> leaderboard = new List<FamilyLeaderboardDTO>();

        foreach (Family family in families)
        {
            int totalPoints = await _achievementRepository.GetFamilyPointsTotalAsync(family.Id);
            IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetCompletedByFamilyIdAsync(family.Id);
            
            leaderboard.Add(new FamilyLeaderboardDTO
            {
                FamilyId = family.Id,
                FamilyName = family.Name,
                TotalPoints = totalPoints,
                CompletedAchievements = achievements.Count(),
                LastUpdated = DateTime.UtcNow
            });
        }

        // Sort by total points descending and take the top families
        return leaderboard
            .OrderByDescending(f => f.TotalPoints)
            .ThenByDescending(f => f.CompletedAchievements)
            .Take(limit);
    }

    public async Task<FamilyLeaderboardDTO?> GetFamilyStatsAsync(int familyId, int userId)
    {
        // Verify user is a member of the family
        if (!await _familyRepository.IsMemberAsync(familyId, userId))
        {
            _logger.LogWarning("User {UserId} attempted to access family stats for family {FamilyId} without being a member", userId, familyId);
            return null;
        }

        Family? family = await _familyRepository.GetByIdAsync(familyId);
        if (family == null)
            return null;

        int totalPoints = await _achievementRepository.GetFamilyPointsTotalAsync(familyId);
        IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetCompletedByFamilyIdAsync(familyId);

        return new FamilyLeaderboardDTO
        {
            FamilyId = family.Id,
            FamilyName = family.Name,
            TotalPoints = totalPoints,
            CompletedAchievements = achievements.Count(),
            LastUpdated = DateTime.UtcNow
        };
    }

    public async Task<bool> TrackTaskCompletionAsync(int taskId, int memberId, int userId)
    {
        TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
        if (task == null)
            return false;

        // Find the family of the member
        FamilyMember? member = await _familyRepository.GetMemberByIdAsync(memberId);
        if (member == null)
            return false;

        // Get in-progress achievements for the family
        IEnumerable<FamilyAchievement> achievements = await _achievementRepository.GetInProgressByFamilyIdAsync(member.FamilyId);
        
        // Find task-related achievements and update their progress
        foreach (FamilyAchievement achievement in achievements)
        {
            // This is a simplified example - in a real app, you'd have more complex logic
            // to match tasks to achievement types
            if (achievement.Type == AchievementType.Family || 
                achievement.Type == AchievementType.Daily ||
                achievement.Type == AchievementType.Weekly)
            {
                await UpdateProgressAsync(achievement.Id, 1, memberId, userId);
            }
        }

        return true;
    }
} 