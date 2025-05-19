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
using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace TaskTrackerAPI.Repositories;

public class InvitationRepository : IInvitationRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InvitationRepository> _logger;

    public InvitationRepository(ApplicationDbContext context, ILogger<InvitationRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Invitation>> GetAllAsync()
    {
        return await _context.Invitations
            .Include(i => i.Family)
            .Include(i => i.Role)
            .Include(i => i.CreatedBy)
            .ToListAsync();
    }

    public async Task<Invitation?> GetByIdAsync(int id)
    {
        return await _context.Invitations
            .Include(i => i.Family)
            .Include(i => i.Role)
            .Include(i => i.CreatedBy)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<IEnumerable<Invitation>> GetByFamilyIdAsync(int familyId)
    {
        return await _context.Invitations
            .Include(i => i.Family)
            .Include(i => i.Role)
            .Include(i => i.CreatedBy)
            .Where(i => i.FamilyId == familyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Invitation>> GetByEmailAsync(string email)
    {
        return await _context.Invitations
            .Include(i => i.Family)
            .Include(i => i.Role)
            .Include(i => i.CreatedBy)
            .Where(i => i.Email == email && !i.IsAccepted && i.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
    }

    public async Task<Invitation> CreateAsync(Invitation invitation)
    {
        // Set expiration date if not already set
        if (invitation.ExpiresAt == default)
        {
            invitation.ExpiresAt = DateTime.UtcNow.AddDays(7);
        }

        _context.Invitations.Add(invitation);
        await _context.SaveChangesAsync();
        return invitation;
    }

    public async Task<Invitation?> UpdateAsync(Invitation invitation)
    {
        _context.Invitations.Update(invitation);
        await _context.SaveChangesAsync();
        return invitation;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        Invitation? invitation = await _context.Invitations.FindAsync(id);
        if (invitation == null)
        {
            return false;
        }

        _context.Invitations.Remove(invitation);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Invitation?> GetByTokenAsync(string token)
    {
        return await _context.Invitations
            .Include(i => i.Family)
            .Include(i => i.Role)
            .Include(i => i.CreatedBy)
            .FirstOrDefaultAsync(i => i.Token == token && !i.IsAccepted && i.ExpiresAt > DateTime.UtcNow);
    }

    public async Task<bool> ExistsActiveInvitationAsync(int familyId, string email)
    {
        return await _context.Invitations
            .AnyAsync(i => i.FamilyId == familyId &&
                           i.Email == email &&
                           !i.IsAccepted &&
                           i.ExpiresAt > DateTime.UtcNow);
    }

    public async Task<bool> MarkAsAcceptedAsync(int id)
    {
        Invitation? invitation = await _context.Invitations.FindAsync(id);
        if (invitation == null)
        {
            return false;
        }

        invitation.IsAccepted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<IEnumerable<Invitation>> GetPendingInvitationsByEmailAsync(string email)
    {
        _logger.LogInformation("Getting pending invitations for email: {Email}", email);
        
        try {
            var invitations = await _context.Invitations
                .Include(i => i.Family)
                .Include(i => i.Role)
                .Include(i => i.CreatedBy)
                .Where(i => i.Email.ToLower() == email.ToLower() && 
                       !i.IsAccepted && 
                       i.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();
                
            _logger.LogInformation("Found {Count} pending invitations for email {Email}", invitations.Count, email);
            
            // Verify family and role references are properly loaded
            foreach (var invitation in invitations)
            {
                if (invitation.Family == null)
                {
                    _logger.LogWarning("Invitation {Id} has null Family, attempting to load explicitly", invitation.Id);
                    invitation.Family = await _context.Families.FindAsync(invitation.FamilyId);
                }
                
                if (invitation.Role == null)
                {
                    _logger.LogWarning("Invitation {Id} has null Role, attempting to load explicitly", invitation.Id);
                    invitation.Role = await _context.FamilyRoles.FindAsync(invitation.RoleId);
                }
                
                if (invitation.CreatedBy == null)
                {
                    _logger.LogWarning("Invitation {Id} has null CreatedBy, attempting to load explicitly", invitation.Id);
                    invitation.CreatedBy = await _context.Users.FindAsync(invitation.CreatedById);
                }
            }
            
            return invitations;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error getting pending invitations for email {Email}", email);
            return new List<Invitation>();
        }
    }
}