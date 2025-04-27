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
}