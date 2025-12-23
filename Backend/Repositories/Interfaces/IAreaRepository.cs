using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IAreaRepository
    {
        Task<List<Area>> GetAllAsync();
        Task<List<Area>> GetUnassignedAsync();
        Task<Area?> GetByIdAsync(int areaId);
        Task AddAsync(Area area);
        Task RemoveAsync(Area area);
        Task SaveChangesAsync();
    }
}
