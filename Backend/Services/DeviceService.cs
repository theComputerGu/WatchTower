using Backend.DTOs.Devices;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
namespace Backend.Services;

public class DeviceService : IDeviceService
{
    private readonly IDeviceRepository _deviceRepository;
    private readonly AppDbContext _db;

    public DeviceService(IDeviceRepository deviceRepository,AppDbContext db)
    {
        _deviceRepository = deviceRepository;
        _db = db;
    }


    // get the devices that relate to the current user
    public async Task<List<DeviceResponse>> GetDevicesForUserAsync(User currentUser)
    {
        IQueryable<Device> query = _db.Devices.AsNoTracking().Include(d => d.Target);

        // non-global admin can see devices only in his managed area
        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;
            query = query.Where(d => d.AreaId == areaId);
        }

        return await query.Select(d => new DeviceResponse
        {
            Id = d.Id,
            Type = d.Type,
            PlaceId = d.PlaceId,
            AreaId = d.AreaId,
            Latitude = d.Latitude,
            Longitude = d.Longitude,
            IsActive = d.IsActive,
            OrientationAngle = d.OrientationAngle,
            TargetId = d.TargetId,
            TargetName = d.Target != null ? d.Target.Name : null
        }).ToListAsync();
    }


    //Update device type
    public async Task<DeviceResponse> UpdateDeviceTypeAsync(int deviceId,DeviceType newType,User currentUser)
    {
        var device = await LoadDeviceWithAuth(deviceId, currentUser);

        device.Type = newType;
        await _deviceRepository.SaveAsync();

        return await ToResponse(device.Id);
    }


    // load the device and verify authorization
    private async Task<Device> LoadDeviceWithAuth(
        int deviceId,
        User currentUser)
    {
        var device = await _deviceRepository.GetByIdWithTargetAsync(deviceId);

        if (device == null)
            throw new KeyNotFoundException("Device not found");

        // area admin / regular user can access only devices in his area
        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;

            if (device.AreaId != areaId)
                throw new UnauthorizedAccessException("Device not in your area");
        }

        return device;
    }


    // Assign target to device
    public async Task<DeviceResponse> AssignTargetAsync(int deviceId,int targetId,User currentUser)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var device = await LoadDeviceWithAuth(deviceId, currentUser);

        var target = await _db.Targets.Include(t => t.Device).FirstOrDefaultAsync(t => t.Id == targetId);

        if (target == null)
            throw new KeyNotFoundException("Target not found");

        // authorization check for non-global admin
        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;

            if (device.AreaId != areaId)
                throw new UnauthorizedAccessException("Device not in your area");

            if (target.AreaId != areaId)
                throw new UnauthorizedAccessException("Target not in your area");
        }

        // target already assigned to another device
        if (target.DeviceId != null && target.DeviceId != device.Id)
            throw new InvalidOperationException("Target already has a device assigned");

        // disconnect old target from device (safety, even if FE does not allow it)
        if (device.TargetId != null && device.TargetId != target.Id)
        {
            var oldTarget = await _db.Targets
                .FirstOrDefaultAsync(t => t.Id == device.TargetId.Value);

            if (oldTarget != null)
                oldTarget.DeviceId = null;

            device.TargetId = null;
        }

        // connect target to device
        device.TargetId = target.Id;
        target.DeviceId = device.Id;

        device.IsActive = true;

        // calculate orientation angle between device and target
        device.OrientationAngle = CalcAngle(
            device.Latitude,
            device.Longitude,
            target.Latitude,
            target.Longitude);

        await _deviceRepository.SaveAsync();
        await tx.CommitAsync();

        return await ToResponse(device.Id);
    }


    // Disconnect target from device
    public async Task<DeviceResponse> UnassignTargetAsync(int deviceId,User currentUser)
    {
        await using var tx = await _db.Database.BeginTransactionAsync();

        var device = await LoadDeviceWithAuth(deviceId, currentUser);

        if (device.TargetId != null)
        {
            var target = await _db.Targets
                .FirstOrDefaultAsync(t => t.Id == device.TargetId.Value);

            if (target != null)
                target.DeviceId = null;

            device.TargetId = null;
        }

        device.IsActive = false;
        device.OrientationAngle = null;

        await _deviceRepository.SaveAsync();
        await tx.CommitAsync();

        return await ToResponse(device.Id);
    }



    // Assiggn users to device
    public async Task AssignUsersAsync(int deviceId,List<Guid> userIds,User currentUser)
    {
        _ = await LoadDeviceWithAuth(deviceId, currentUser);

        var users = await _db.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync();

        if (users.Count != userIds.Count)
            throw new InvalidOperationException("One or more users not found");

        // existing users already connected to device
        var existingUserIds = await _db.DeviceUsers
            .Where(du => du.DeviceId == deviceId)
            .Select(du => du.UserId)
            .ToListAsync();

        // users to add
        var toAdd = userIds
            .Where(uid => !existingUserIds.Contains(uid))
            .Select(uid => new DeviceUser
            {
                DeviceId = deviceId,
                UserId = uid
            })
            .ToList();

        if (toAdd.Count > 0)
            _db.DeviceUsers.AddRange(toAdd);

        await _deviceRepository.SaveAsync();
    }


    //Create Device
    public async Task<DeviceResponse> CreateAsync(CreateDeviceRequest request,User currentUser)
    {
        var place = await _db.Places
            .Include(p => p.Area)
            .FirstOrDefaultAsync(p => p.Id == request.PlaceId);

        if (place == null)
            throw new InvalidOperationException("Place not found");

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;

            if (place.AreaId != areaId)
                throw new UnauthorizedAccessException("Place not in your area");
        }

        var device = new Device
        {
            Type = request.Type,
            PlaceId = place.Id,
            AreaId = place.AreaId,
            Latitude = place.Latitude,
            Longitude = place.Longitude,
            IsActive = false
        };

        await _deviceRepository.AddAsync(device);
        await _deviceRepository.SaveAsync();

        return await ToResponse(device.Id);
    }



    //Delete Device
    public async Task DeleteAsync(
        int deviceId,
        User currentUser)
    {
        var device = await LoadDeviceWithAuth(deviceId, currentUser);

        // disconnect target
        if (device.TargetId != null)
        {
            var target = await _db.Targets
                .FirstOrDefaultAsync(t => t.Id == device.TargetId);

            if (target != null)
                target.DeviceId = null;
        }

        // disconnect users
        var links = await _db.DeviceUsers
            .Where(du => du.DeviceId == deviceId)
            .ToListAsync();

        if (links.Count > 0)
            _db.DeviceUsers.RemoveRange(links);

        await _deviceRepository.RemoveAsync(device);
        await _deviceRepository.SaveAsync();
    }


    // Remove user from device
    public async Task RemoveUserAsync(
        int deviceId,
        Guid userId,
        User currentUser)
    {
        _ = await LoadDeviceWithAuth(deviceId, currentUser);

        var link = await _db.DeviceUsers
            .FirstOrDefaultAsync(du =>
                du.DeviceId == deviceId &&
                du.UserId == userId);

        if (link == null)
            return;

        _db.DeviceUsers.Remove(link);
        await _deviceRepository.SaveAsync();
    }


    // Get users for device
    public async Task<List<User>> GetUsersForDeviceAsync(
        int deviceId,
        User currentUser)
    {
        _ = await LoadDeviceWithAuth(deviceId, currentUser);

        return await _db.DeviceUsers
            .Where(du => du.DeviceId == deviceId)
            .Include(du => du.User)
            .Select(du => du.User)
            .AsNoTracking()
            .ToListAsync();
    }


    // build device response DTO
    private async Task<DeviceResponse> ToResponse(int deviceId)
    {
        var d = await _db.Devices
            .AsNoTracking()
            .Include(d => d.Target)
            .FirstAsync(d => d.Id == deviceId);

        return new DeviceResponse
        {
            Id = d.Id,
            Type = d.Type,
            PlaceId = d.PlaceId,
            AreaId = d.AreaId,
            Latitude = d.Latitude,
            Longitude = d.Longitude,
            IsActive = d.IsActive,
            OrientationAngle = d.OrientationAngle,
            TargetId = d.TargetId,
            TargetName = d.Target != null ? d.Target.Name : null
        };
    }

    // calculate angle between device and target
    private static double CalcAngle(
        double fromLat,
        double fromLon,
        double toLat,
        double toLon)
    {
        var dy = toLat - fromLat;
        var dx = toLon - fromLon;
        var radians = Math.Atan2(dy, dx);
        var degrees = radians * (180.0 / Math.PI);

        if (degrees < 0)
            degrees += 360.0;

        return degrees;
    }
}
