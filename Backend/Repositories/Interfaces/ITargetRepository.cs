using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface ITargetRepository
{
    IQueryable<Target> Query();
    Task<bool> AreaExistsAsync(int areaId);

    Task<Target?> GetWithDeviceAsync(int targetId);
}
