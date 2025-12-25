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
    private readonly IAreaRepository _areaRepository;

    public TargetService(
        ITargetRepository targets,
        IBaseRepository<Target> targetBase,
        IDeviceRepository devices,
        IBaseRepository<Device> deviceBase,
        IAreaRepository areaRepository)
        
    {
        _targets = targets;
        _targetBase = targetBase;
        _devices = devices;
        _deviceBase = deviceBase;
        _areaRepository = areaRepository;
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
    public async Task<TargetResponse> CreateAsync(
    CreateTargetRequest request,
    User currentUser)
    {
        if (currentUser.Role == UserRole.USER)
            throw new UnauthorizedAccessException("User cannot create targets");

 
        var area = await _areaRepository.FindAreaContainingPointAsync(
            request.Latitude,
            request.Longitude
        );

        if (area == null)
            throw new InvalidOperationException("Target must be inside an area");

   
        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var myAreaIds = currentUser.ManagedAreas.Select(a => a.Id);
            if (!myAreaIds.Contains(area.Id))
                throw new UnauthorizedAccessException(
                    "Cannot create target outside your area"
                );
        }

        var target = new Target
        {
            Name = request.Name,
            Description = request.Description,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AreaId = area.Id 
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
    public async Task<TargetResponse> UpdateDetailsAsync(int targetId, UpdateTargetRequest request, User currentUser)
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



    //target position
    public async Task UpdatePositionAsync(
    int targetId,
    double latitude,
    double longitude,
    User currentUser)
    {
        var target = await _targetBase.GetByIdAsync(targetId);
        if (target == null)
            throw new KeyNotFoundException("Target not found");

        if (currentUser.Role == UserRole.USER)
            throw new UnauthorizedAccessException();

     
        var newArea = await _areaRepository
            .FindAreaContainingPointAsync(latitude, longitude);

        if (newArea == null)
            throw new InvalidOperationException(
                "Target must be inside an area");

 
        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var myAreaIds = currentUser.ManagedAreas
                .Select(a => a.Id);

            if (!myAreaIds.Contains(newArea.Id))
                throw new UnauthorizedAccessException(
                    "Cannot move target outside your area");
        }

        target.Latitude = latitude;
        target.Longitude = longitude;
        target.AreaId = newArea.Id;

        await _targetBase.SaveChangesAsync();
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
