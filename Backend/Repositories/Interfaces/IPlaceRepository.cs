using Backend.Models;

namespace Backend.Repositories.Interfaces
{
    public interface IPlaceRepository
    {
        Task<List<Area>> GetAreasWithPolygonAsync();
        Task<Place?> GetPlaceWithDeviceAsync(int placeId);
        Task<List<Place>> GetPlacesWithDeviceAsync();
        Task AddPlaceAsync(Place place);
        Task RemovePlaceAsync(Place place);
        Task SaveChangesAsync();
        Task<Place?> GetWithAreaAsync(int placeId);
    }
}
