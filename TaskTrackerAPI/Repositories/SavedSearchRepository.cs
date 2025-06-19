/*
 * SavedSearchRepository.cs
 * Repository implementation for saved search operations
 * Enterprise-grade saved search repository with family sharing capabilities
 */

using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;

namespace TaskTrackerAPI.Repositories;

/// <summary>
/// Repository implementation for saved search operations
/// </summary>
public class SavedSearchRepository : ISavedSearchRepository
{
    private readonly ApplicationDbContext _context;

    public SavedSearchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>List of saved searches</returns>
    public async Task<IEnumerable<SavedSearch>> GetSavedSearchesAsync(int userId)
    {
        return await _context.SavedSearches
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get shared saved searches for a family
    /// </summary>
    /// <param name="familyId">ID of the family</param>
    /// <param name="userId">ID of the requesting user for permission check</param>
    /// <returns>List of family shared searches</returns>
    public async Task<IEnumerable<SavedSearch>> GetFamilySavedSearchesAsync(int familyId, int userId)
    {
        // First verify user is in the family
        bool userInFamily = await _context.FamilyMembers
            .AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);

        if (!userInFamily)
        {
            return new List<SavedSearch>();
        }

        // Get all family member user IDs
        List<int> familyUserIds = await _context.FamilyMembers
            .Where(fm => fm.FamilyId == familyId)
            .Select(fm => fm.UserId)
            .ToListAsync();

        // Return searches from family members that are marked as public/shared
        return await _context.SavedSearches
            .Where(s => familyUserIds.Contains(s.UserId) && s.FamilyId == familyId)
            .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Get a saved search by ID
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the requesting user for ownership verification</param>
    /// <returns>Saved search entity</returns>
    public async Task<SavedSearch?> GetSavedSearchByIdAsync(int searchId, int userId)
    {
        return await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == searchId && s.UserId == userId);
    }

    /// <summary>
    /// Create a new saved search
    /// </summary>
    /// <param name="savedSearch">Saved search entity to create</param>
    /// <returns>Created saved search entity</returns>
    public async Task<SavedSearch> CreateSavedSearchAsync(SavedSearch savedSearch)
    {
        _context.SavedSearches.Add(savedSearch);
        await _context.SaveChangesAsync();
        return savedSearch;
    }

    /// <summary>
    /// Update an existing saved search
    /// </summary>
    /// <param name="savedSearch">Saved search entity to update</param>
    /// <returns>Updated saved search entity</returns>
    public async Task<SavedSearch?> UpdateSavedSearchAsync(SavedSearch savedSearch)
    {
        SavedSearch? existing = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == savedSearch.Id && s.UserId == savedSearch.UserId);

        if (existing == null)
        {
            return null;
        }

        // Update properties
        existing.Name = savedSearch.Name;
        existing.Query = savedSearch.Query;
        existing.EntityTypes = savedSearch.EntityTypes;
        existing.Filters = savedSearch.Filters;
        existing.Sort = savedSearch.Sort;

        await _context.SaveChangesAsync();
        return existing;
    }

    /// <summary>
    /// Delete a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user for ownership verification</param>
    /// <returns>True if successful</returns>
    public async Task<bool> DeleteSavedSearchAsync(int searchId, int userId)
    {
        SavedSearch? savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == searchId && s.UserId == userId);

        if (savedSearch == null)
        {
            return false;
        }

        _context.SavedSearches.Remove(savedSearch);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Get most used saved searches for a user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="limit">Maximum number of searches</param>
    /// <returns>Most used saved searches</returns>
    public async Task<IEnumerable<SavedSearch>> GetMostUsedSavedSearchesAsync(int userId, int limit = 10)
    {
        return await _context.SavedSearches
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    /// <summary>
    /// Search within saved searches by name or query
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="searchTerm">Term to search for</param>
    /// <returns>Matching saved searches</returns>
    public async Task<IEnumerable<SavedSearch>> SearchSavedSearchesAsync(int userId, string searchTerm)
    {
        return await _context.SavedSearches
            .Where(s => s.UserId == userId && 
                       (s.Name.Contains(searchTerm) || s.Query.Contains(searchTerm)))
            .OrderByDescending(s => s.LastUsedAt ?? s.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Share a saved search with family
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user sharing the search</param>
    /// <param name="familyId">ID of the family to share with</param>
    /// <returns>True if successful</returns>
    public async Task<bool> ShareSavedSearchWithFamilyAsync(int searchId, int userId, int familyId)
    {
        var savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == searchId && s.UserId == userId);

        if (savedSearch == null)
        {
            return false;
        }

        // Verify user is in the family
        var userInFamily = await _context.FamilyMembers
            .AnyAsync(fm => fm.FamilyId == familyId && fm.UserId == userId);

        if (!userInFamily)
        {
            return false;
        }

        savedSearch.FamilyId = familyId;
        savedSearch.IsPublic = true;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Unshare a saved search from family
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user unsharing the search</param>
    /// <returns>True if successful</returns>
    public async Task<bool> UnshareSavedSearchAsync(int searchId, int userId)
    {
        var savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == searchId && s.UserId == userId);

        if (savedSearch == null)
        {
            return false;
        }

        savedSearch.FamilyId = null;
        savedSearch.IsPublic = false;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Increment usage count for a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user executing the search</param>
    /// <returns>True if successful</returns>
    public async Task<bool> IncrementUsageCountAsync(int searchId, int userId)
    {
        var savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == searchId);

        if (savedSearch == null)
        {
            return false;
        }

        // Check if user has access to this search
        var hasAccess = await CanUserAccessSavedSearchAsync(searchId, userId);
        if (!hasAccess)
        {
            return false;
        }

        savedSearch.UsageCount++;
        savedSearch.LastUsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Check if user has permission to access a saved search
    /// </summary>
    /// <param name="searchId">ID of the saved search</param>
    /// <param name="userId">ID of the user</param>
    /// <returns>True if user has access</returns>
    public async Task<bool> CanUserAccessSavedSearchAsync(int searchId, int userId)
    {
        var savedSearch = await _context.SavedSearches
            .FirstOrDefaultAsync(s => s.Id == searchId);

        if (savedSearch == null)
        {
            return false;
        }

        // User can access if:
        // 1. They own the search
        if (savedSearch.UserId == userId)
        {
            return true;
        }

        // 2. It's shared with a family they belong to
        if (savedSearch.FamilyId.HasValue && savedSearch.IsPublic)
        {
            var userInFamily = await _context.FamilyMembers
                .AnyAsync(fm => fm.FamilyId == savedSearch.FamilyId && fm.UserId == userId);
            
            return userInFamily;
        }

        return false;
    }
} 