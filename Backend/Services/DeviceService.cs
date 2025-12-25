using Backend.DTOs.Devices;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class DeviceService : IDeviceService
{
    private readonly IDeviceRepository _deviceRepo;
    private readonly IBaseRepository<Device> _deviceBase;
    private readonly ITargetRepository _targetRepo;
    private readonly IBaseRepository<Target> _targetBase;
    private readonly IPlaceRepository _placeRepo;
    private readonly IUserRepository _userRepo;
    private readonly IDeviceUserRepository _deviceUserRepo;

    public DeviceService(
        IDeviceRepository deviceRepo,
        IBaseRepository<Device> deviceBase,
        ITargetRepository targetRepo,
        IBaseRepository<Target> targetBase,
        IPlaceRepository placeRepo,
        IUserRepository userRepo,
        IDeviceUserRepository deviceUserRepo)
    {
        _deviceRepo = deviceRepo;
        _deviceBase = deviceBase;
        _targetRepo = targetRepo;
        _targetBase = targetBase;
        _placeRepo = placeRepo;
        _userRepo = userRepo;
        _deviceUserRepo = deviceUserRepo;
    }


    // get the devices that relate to the current user
    public async Task<List<DeviceResponse>> GetDevicesForUserAsync(User currentUser)
    {
        List<Device> devices;

        if (currentUser.Role == UserRole.GLOBAL_ADMIN)
        {
            devices = await _deviceRepo.GetAllWithTargetsAsync();
        }
        else
        {
            var areaId = currentUser.ManagedAreas.Single().Id;
            devices = await _deviceRepo.GetByAreaAsync(areaId);
        }

        return devices.Select(d => new DeviceResponse
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
        }).ToList();
    }


    //Update device type
    public async Task<DeviceResponse> UpdateDeviceTypeAsync(int deviceId,DeviceType newType,User currentUser)
    {
        var device = await LoadDeviceWithAuth(deviceId, currentUser);

    
        if (device.Type == newType)
            return await ToResponse(device.Id);

        device.Type = newType;

        await _deviceBase.SaveChangesAsync();

        return await ToResponse(device.Id);
    }



    // load the device and verify authorization
    private async Task<Device> LoadDeviceWithAuth(
        int deviceId,
        User currentUser)
    {
        var device = await _deviceRepo.GetWithTargetAsync(deviceId);

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
        var device = await LoadDeviceWithAuth(deviceId, currentUser);

        var target = await _targetRepo.GetWithDeviceAsync(targetId);

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
            var oldTarget = await _targetBase.GetByIdAsync(device.TargetId.Value);

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

        await _deviceBase.SaveChangesAsync();
        await _targetBase.SaveChangesAsync();

        return await ToResponse(device.Id);
    }


    // Disconnect target from device
    public async Task<DeviceResponse> UnassignTargetAsync(int deviceId,User currentUser)
    {
        var device = await LoadDeviceWithAuth(deviceId, currentUser);

        if (device.TargetId != null)
        {
            var target = await _targetBase.GetByIdAsync(device.TargetId.Value);

            if (target != null)
                target.DeviceId = null;

            device.TargetId = null;
        }

        device.IsActive = false;
        device.OrientationAngle = null;

        await _deviceBase.SaveChangesAsync();
        await _targetBase.SaveChangesAsync();

        return await ToResponse(device.Id);
    }



    // Assiggn users to device
    public async Task AssignUsersAsync(int deviceId,List<Guid> userIds,User currentUser)
    {
        _ = await LoadDeviceWithAuth(deviceId, currentUser);

        var users = await Task.WhenAll(
            userIds.Select(id => _userRepo.GetByIdAsync(id)));

        if (users.Any(u => u == null))
            throw new InvalidOperationException("One or more users not found");

        var existingUserIds = await _deviceUserRepo
            .GetUserIdsForDeviceAsync(deviceId);

        var toAdd = userIds
            .Where(uid => !existingUserIds.Contains(uid))
            .Select(uid => new DeviceUser
            {
                DeviceId = deviceId,
                UserId = uid
            })
            .ToList();

        if (toAdd.Count > 0)
            await _deviceUserRepo.AddRangeAsync(toAdd);

        await _deviceUserRepo.SaveChangesAsync();
    }


    //Create Device
    public async Task<DeviceResponse> CreateAsync(CreateDeviceRequest request,User currentUser)
    {
        var place = await _placeRepo.GetWithAreaAsync(request.PlaceId);

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

        await _deviceBase.AddAsync(device);
        await _deviceBase.SaveChangesAsync();

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
            var target = await _targetBase.GetByIdAsync(device.TargetId.Value);

            if (target != null)
                target.DeviceId = null;
        }

        _deviceBase.Remove(device);
        await _deviceBase.SaveChangesAsync();
        await _targetBase.SaveChangesAsync();
    }


    // Remove user from device
    public async Task RemoveUserAsync(
        int deviceId,
        Guid userId,
        User currentUser)
    {
        _ = await LoadDeviceWithAuth(deviceId, currentUser);

        var link = await _deviceUserRepo.GetAsync(deviceId, userId);

        if (link == null)
            return;

        _deviceUserRepo.Remove(link);
        await _deviceUserRepo.SaveChangesAsync();
    }


    // Get users for device
    public async Task<List<User>> GetUsersForDeviceAsync(int deviceId,User currentUser)
    {
        _ = await LoadDeviceWithAuth(deviceId, currentUser);

        return await _deviceUserRepo.GetUsersForDeviceAsync(deviceId);
    }


    // build device response DTO
    private async Task<DeviceResponse> ToResponse(int deviceId)
    {
        var d = await _deviceRepo.GetWithTargetAsync(deviceId);

        return new DeviceResponse
        {
            Id = d!.Id,
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
