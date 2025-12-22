using Backend.DTOs.Devices;
using Backend.Models;
using Backend.Models.Enums;

namespace Backend.Services.Interfaces;

public interface IDeviceService
{
    Task<List<DeviceResponse>> GetDevicesForUserAsync(User currentUser);
    Task<DeviceResponse> UpdateDeviceTypeAsync(int deviceId, DeviceType newType, User currentUser);
    Task<DeviceResponse> AssignTargetAsync(int deviceId, int targetId, User currentUser);
    Task<DeviceResponse> UnassignTargetAsync(int deviceId, User currentUser);
    Task AssignUsersAsync(int deviceId, List<Guid> userIds, User currentUser);
    Task RemoveUserAsync(int deviceId, Guid userId, User currentUser);
    Task<List<User>> GetUsersForDeviceAsync(
    int deviceId,
    User currentUser);

    Task<DeviceResponse> CreateAsync(
    CreateDeviceRequest request,
    User currentUser
);

Task DeleteAsync(int deviceId, User currentUser);
}
