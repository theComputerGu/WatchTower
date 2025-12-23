using Backend.Data;
using Backend.DTOs.Targets;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TargetService : ITargetService
{
    private readonly AppDbContext _db;

    public TargetService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<TargetResponse>> GetTargetsForUserAsync(User currentUser, int? areaId = null)
    {
        IQueryable<Target> q = _db.Targets.AsNoTracking();

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var myAreaId = currentUser.ManagedAreas.Single().Id;
            q = q.Where(t => t.AreaId == myAreaId);
        }
        else if (areaId.HasValue)
        {
            q = q.Where(t => t.AreaId == areaId.Value);
        }

        return await q.Select(t => new TargetResponse
        {
            Id = t.Id,
            AreaId = t.AreaId,
            Name = t.Name,
            Description = t.Description,
            Latitude = t.Latitude,
            Longitude = t.Longitude,
            DeviceId = t.DeviceId
        }).ToListAsync();
    }

    public async Task<TargetResponse> CreateAsync(CreateTargetRequest request, User currentUser)
    {
       
        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var myAreaId = currentUser.ManagedAreas.Single().Id;
            if (request.AreaId != myAreaId)
                throw new UnauthorizedAccessException("Cannot create target outside your area");
        }

        var areaExists = await _db.Areas.AnyAsync(a => a.Id == request.AreaId);
        if (!areaExists)
            throw new InvalidOperationException("Area not found");

        var target = new Target
        {
            Name = request.Name,
            Description = request.Description,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AreaId = request.AreaId
        };

        _db.Targets.Add(target);
        await _db.SaveChangesAsync();

        return new TargetResponse
        {
            Id = target.Id,
            AreaId = target.AreaId,
            Name = target.Name,
            Description = target.Description,
            Latitude = target.Latitude,
            Longitude = target.Longitude,
            DeviceId = target.DeviceId
        };
    }

    public async Task<TargetResponse> UpdateAsync(int targetId, UpdateTargetRequest request, User currentUser)
    {
        var target = await _db.Targets.FirstOrDefaultAsync(t => t.Id == targetId);
        if (target == null) throw new KeyNotFoundException("Target not found");

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var myAreaId = currentUser.ManagedAreas.Single().Id;
            if (target.AreaId != myAreaId)
                throw new UnauthorizedAccessException("Target not in your area");
        }

        target.Name = request.Name;
        target.Description = request.Description;

        await _db.SaveChangesAsync();

        return new TargetResponse
        {
            Id = target.Id,
            AreaId = target.AreaId,
            Name = target.Name,
            Description = target.Description,
            Latitude = target.Latitude,
            Longitude = target.Longitude,
            DeviceId = target.DeviceId
        };
    }

    public async Task DeleteAsync(int targetId, User currentUser)
    {
        var target = await _db.Targets.FirstOrDefaultAsync(t => t.Id == targetId);
        if (target == null) return;

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var myAreaId = currentUser.ManagedAreas.Single().Id;
            if (target.AreaId != myAreaId)
                throw new UnauthorizedAccessException("Target not in your area");
        }

    
        if (target.DeviceId != null)
        {
            var device = await _db.Devices.FirstOrDefaultAsync(d => d.Id == target.DeviceId.Value);
            if (device != null)
            {
                device.TargetId = null;
                device.IsActive = false;
                device.OrientationAngle = null;
            }
        }

        _db.Targets.Remove(target);
        await _db.SaveChangesAsync();
    }
}
