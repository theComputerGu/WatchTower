using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class PlaceRepository : IPlaceRepository
    {
        private readonly AppDbContext _db;

        public PlaceRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<Area>> GetAreasWithPolygonAsync()
        {
            return await _db.Areas
                .AsNoTracking()
                .Where(a => !string.IsNullOrWhiteSpace(a.PolygonGeoJson))
                .ToListAsync();
        }

        public async Task<Place?> GetPlaceWithDeviceAsync(int placeId)
        {
            return await _db.Places
                .Include(p => p.Device)
                .FirstOrDefaultAsync(p => p.Id == placeId);
        }

        public async Task<List<Place>> GetPlacesWithDeviceAsync()
        {
            return await _db.Places
                .AsNoTracking()
                .Include(p => p.Device)
                .ToListAsync();
        }

        public async Task AddPlaceAsync(Place place)
        {
            _db.Places.Add(place);
            await _db.SaveChangesAsync();
        }

        public async Task RemovePlaceAsync(Place place)
        {
            _db.Places.Remove(place);
            await _db.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _db.SaveChangesAsync();
        }

        public async Task<Place?> GetWithAreaAsync(int placeId)
        {
            return await _db.Places
                .Include(p => p.Area)
                .FirstOrDefaultAsync(p => p.Id == placeId);
        }

    }
}
