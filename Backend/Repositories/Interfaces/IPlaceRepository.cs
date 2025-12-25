using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IPlaceRepository
    {
        Task<List<Area>> GetAreasWithPolygonAsync();
        Task<Place?> GetPlaceWithDeviceAsync(int placeId);
        Task<List<Place>> GetPlacesWithDeviceAsync();
        Task<Place?> GetWithAreaAsync(int placeId);
    }
}
