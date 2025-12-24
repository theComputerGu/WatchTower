using Backend.Models;

public interface IDeviceUserRepository
{
    Task<List<Guid>> GetUserIdsForDeviceAsync(int deviceId);
    Task<List<User>> GetUsersForDeviceAsync(int deviceId);
    Task<DeviceUser?> GetAsync(int deviceId, Guid userId);
    Task AddRangeAsync(List<DeviceUser> links);
    void Remove(DeviceUser link);
    Task SaveChangesAsync();
}
