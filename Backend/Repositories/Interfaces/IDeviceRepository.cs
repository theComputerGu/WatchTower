using Backend.Models;
namespace Backend.Repositories.Interfaces;

public interface IDeviceRepository
{
    Task<List<Device>> GetByAreaAsync(int areaId);
    Task<List<Device>> GetAllWithTargetsAsync();
    Task<Device?> GetWithTargetAsync(int deviceId);

}
