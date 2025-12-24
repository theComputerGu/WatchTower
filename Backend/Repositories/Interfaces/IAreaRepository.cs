using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IAreaRepository
    {
        Task<List<Area>> GetAllAsync();
        Task<List<Area>> GetUnassignedAsync();
   
    }
}
