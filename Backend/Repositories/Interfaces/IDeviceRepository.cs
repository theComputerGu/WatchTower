using Backend.Models;
namespace Backend.Repositories.Interfaces;

public interface IDeviceRepository
{
    Task<List<Device>> GetByAreaAsync(int areaId);
    Task<List<Device>> GetAllWithTargetsAsync();
    Task<Device?> GetWithTargetAsync(int deviceId);
    Task AddAsync(Device device);
    Task RemoveAsync(Device device);
    Task SaveAsync();
    Task<Device?> GetByIdAsync(int deviceId);
}
