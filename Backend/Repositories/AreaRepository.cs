using Backend.Data;
using Backend.Models;
using Backend.Repositories.Base;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
namespace Backend.Repositories;

public class AreaRepository: BaseRepository<Area>, IAreaRepository
{
    
    public AreaRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<Area>> GetAllAsync()
    {
        return await Set
            .Include(a => a.AreaAdminUser)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Area>> GetUnassignedAsync()
    {
        return await Set
            .Where(a => a.AreaAdminUserId == null)
            .AsNoTracking()
            .ToListAsync();
    }


    public async Task<Area?> FindAreaContainingPointAsync(double latitude, double longitude)
{
    var reader = new GeoJsonReader();

    var point = new Point(longitude, latitude)
    {
        SRID = 4326
    };

    var areas = await Set
        .Where(a => !string.IsNullOrWhiteSpace(a.PolygonGeoJson))
        .ToListAsync();

    foreach (var area in areas)
    {
        try
        {
            var feature = reader.Read<NetTopologySuite.Features.Feature>(
                area.PolygonGeoJson
            );

            if (feature?.Geometry == null)
                continue;

            var geometry = feature.Geometry;
            geometry.SRID = 4326;

            if (geometry.Contains(point))
                return area;
        }
        catch (Exception ex)
        {
            continue;
        }
    }

    return null;
}


}
