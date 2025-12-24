using Backend.DTOs.Targets;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class TargetService : ITargetService
{
    private readonly ITargetRepository _targets;
    private readonly IBaseRepository<Target> _targetBase;
    private readonly IDeviceRepository _devices;
    private readonly IBaseRepository<Device> _deviceBase;

    public TargetService(
        ITargetRepository targets,
        IBaseRepository<Target> targetBase,
        IDeviceRepository devices,
        IBaseRepository<Device> deviceBase)
    {
        _targets = targets;
        _targetBase = targetBase;
        _devices = devices;
        _deviceBase = deviceBase;
    }

    //get all the targets that  the user ca nsee - mabey nothing
    public async Task<List<TargetResponse>> GetTargetsForUserAsync(User currentUser, int? areaId = null)
    {
        IQueryable<Target> q = _targets.Query().AsNoTracking();

        if (currentUser.Role == UserRole.USER)
        {
            q = q.Where(t => false);
        }
        else if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var myAreaIds = currentUser.ManagedAreas.Select(a => a.Id).ToList();
            q = q.Where(t => myAreaIds.Contains(t.AreaId));
        }
        else if (currentUser.Role == UserRole.GLOBAL_ADMIN && areaId.HasValue)
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


    //create target
    public async Task<TargetResponse> CreateAsync(CreateTargetRequest request, User currentUser)
    {
        if (currentUser.Role == UserRole.USER)
            throw new UnauthorizedAccessException("User cannot create targets");

        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var myAreaIds = currentUser.ManagedAreas.Select(a => a.Id).ToList();
            if (!myAreaIds.Contains(request.AreaId))
                throw new UnauthorizedAccessException("Cannot create target outside your area");
        }

        var areaExists = await _targets.AreaExistsAsync(request.AreaId);
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

        await _targetBase.AddAsync(target);
        await _targetBase.SaveChangesAsync();

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

    //update the target - not usinf it now in the front
    public async Task<TargetResponse> UpdateAsync(int targetId, UpdateTargetRequest request, User currentUser)
    {
        var target = await _targetBase.GetByIdAsync(targetId);
        if (target == null) throw new KeyNotFoundException("Target not found");

        if (currentUser.Role == UserRole.USER)
            throw new UnauthorizedAccessException("User cannot update targets");

        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var myAreaIds = currentUser.ManagedAreas.Select(a => a.Id).ToList();
            if (!myAreaIds.Contains(target.AreaId))
                throw new UnauthorizedAccessException("Target not in your area");
        }

        target.Name = request.Name;
        target.Description = request.Description;

        await _targetBase.SaveChangesAsync();

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


    //delete target
    public async Task DeleteAsync(int targetId, User currentUser)
    {
        var target = await _targetBase.GetByIdAsync(targetId);
        if (target == null) return;

        if (currentUser.Role == UserRole.USER)
            throw new UnauthorizedAccessException("User cannot delete targets");

        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var myAreaIds = currentUser.ManagedAreas.Select(a => a.Id).ToList();
            if (!myAreaIds.Contains(target.AreaId))
                throw new UnauthorizedAccessException("Target not in your area");
        }

        if (target.DeviceId != null)
        {
            var device = await _deviceBase.GetByIdAsync(target.DeviceId.Value);
            if (device != null)
            {
                device.TargetId = null;
                device.IsActive = false;
                device.OrientationAngle = null;
                await _deviceBase.SaveChangesAsync();
            }
        }

        _targetBase.Remove(target);
        await _targetBase.SaveChangesAsync();
    }
}
