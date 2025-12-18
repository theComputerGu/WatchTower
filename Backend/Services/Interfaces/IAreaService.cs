using Backend.DTOs.Areas;

namespace Backend.Services.Interfaces
{
    public interface IAreaService
    {
        Task<List<AreaResponse>> GetAllAsync();
        Task<int> CreateAsync(CreateAreaRequest request);
        Task UpdateAsync(int areaId, CreateAreaRequest request);
        Task DeleteAsync(int areaId);
        Task AssignAdminAsync(int areaId, Guid userId);

        Task<List<AreaResponse>> GetUnassignedAsync();
    }
}
