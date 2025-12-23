using Backend.Models;
namespace Backend.Repositories.Interfaces;

public interface IDeviceRepository
{
    Task<Device?> GetByIdAsync(int id);
    Task<Device?> GetByIdWithTargetAsync(int id);
    Task<List<Device>> GetByAreaAsync(int areaId);
    Task AddAsync(Device device);
    Task RemoveAsync(Device device);
    Task SaveAsync();
}
