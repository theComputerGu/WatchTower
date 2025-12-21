using Backend.Data;
using Backend.DTOs.Places;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json.Linq;

namespace Backend.Services;

public class PlaceService : IPlaceService
{
    private readonly AppDbContext _db;

    public PlaceService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PlaceResponse> CreatePlaceAsync(
    CreatePlaceRequest request,
    User currentUser)
{
    Area matchedArea;

    if (currentUser.Role == UserRole.GLOBAL_ADMIN)
{
    var areas = await _db.Areas
        .AsNoTracking()
        .Where(a => !string.IsNullOrWhiteSpace(a.PolygonGeoJson))
        .ToListAsync();

    matchedArea = areas.FirstOrDefault(area =>
        IsPointInsidePolygon(
            request.Latitude,
            request.Longitude,
            area.PolygonGeoJson));

    if (matchedArea == null)
        throw new InvalidOperationException(
            "Place is not inside any area");
}

    else
    {
        matchedArea = currentUser.ManagedAreas.Single();

        if (!IsPointInsidePolygon(
                request.Latitude,
                request.Longitude,
                matchedArea.PolygonGeoJson))
        {
            throw new UnauthorizedAccessException(
                "Place is not inside your area");
        }
    }

    var resolvedType = request.Type ?? PlaceType.None;

    var place = new Place
    {
        Latitude = request.Latitude,
        Longitude = request.Longitude,
        AreaId = matchedArea.Id,
        Type = resolvedType
    };

    _db.Places.Add(place);
    await _db.SaveChangesAsync();


    switch (resolvedType)
    {
        case PlaceType.Camera:
            _db.Cameras.Add(new Camera
            {
                PlaceId = place.Id
            });
            break;

        case PlaceType.Radar:
            _db.Radars.Add(new Radar
            {
                PlaceId = place.Id
            });
            break;

        case PlaceType.None:
        default:
        
            break;
    }

    await _db.SaveChangesAsync();

 
    return new PlaceResponse
    {
        Id = place.Id,
        Latitude = place.Latitude,
        Longitude = place.Longitude,
        Type = place.Type,
        AreaId = place.AreaId
    };
}


    public async Task<List<PlaceResponse>> GetPlacesForUserAsync(User currentUser)
    {
        IQueryable<Place> query = _db.Places
            .AsNoTracking()
            .Include(p => p.Camera)
            .Include(p => p.Radar);

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;
            query = query.Where(p => p.AreaId == areaId);
        }

        return await query.Select(p => new PlaceResponse
        {
            Id = p.Id,
            Latitude = p.Latitude,
            Longitude = p.Longitude,
            Type = p.Type,
            AreaId = p.AreaId,
            CameraId = p.Camera != null ? p.Camera.Id : null,
            RadarId  = p.Radar  != null ? p.Radar.Id  : null
        }).ToListAsync();
    }


    private bool IsPointInsidePolygon(
        double lat,
        double lng,
        string polygonGeoJson)
    {
        try
        {
            var json = JObject.Parse(polygonGeoJson);

        
            if (json["type"]?.ToString() == "Feature")
            {
                json = (JObject)json["geometry"]!;
            }

            var reader = new GeoJsonReader();
            var geometry = reader.Read<Geometry>(json.ToString());
            geometry.SRID = 4326;

            var point = new Point(lng, lat)
            {
                SRID = 4326
            };

            bool contains = geometry.Contains(point);
            bool covers   = geometry.Covers(point);

            Console.WriteLine($"Contains={contains}, Covers={covers}");


            return covers;
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ ERROR in IsPointInsidePolygon");
            Console.WriteLine(ex.Message);
            return false;
        }
    }


    public async Task UpdatePlaceTypeAsync(
    int placeId,
    PlaceType newType,
    User currentUser)
{
    var place = await _db.Places
        .Include(p => p.Camera)
        .Include(p => p.Radar)
        .FirstOrDefaultAsync(p => p.Id == placeId);

    if (place == null)
        throw new KeyNotFoundException("Place not found");


    if (currentUser.Role != UserRole.GLOBAL_ADMIN)
    {
        var areaId = currentUser.ManagedAreas.Single().Id;
        if (place.AreaId != areaId)
            throw new UnauthorizedAccessException();
    }


    if (place.Camera != null)
        _db.Cameras.Remove(place.Camera);

    if (place.Radar != null)
        _db.Radars.Remove(place.Radar);


    place.Type = newType;

  
    if (newType == PlaceType.Camera)
        _db.Cameras.Add(new Camera { PlaceId = place.Id });
    else if (newType == PlaceType.Radar)
        _db.Radars.Add(new Radar { PlaceId = place.Id });

    await _db.SaveChangesAsync();
}



public async Task DeletePlaceAsync(
    int placeId,
    User currentUser)
{
    var place = await _db.Places
        .Include(p => p.Camera)
        .Include(p => p.Radar)
        .FirstOrDefaultAsync(p => p.Id == placeId);

    if (place == null)
        throw new KeyNotFoundException("Place not found");

    if (currentUser.Role != UserRole.GLOBAL_ADMIN)
    {
        var areaId = currentUser.ManagedAreas.Single().Id;
        if (place.AreaId != areaId)
            throw new UnauthorizedAccessException(
                "You are not allowed to delete this place");
    }


    if (place.Camera != null)
        _db.Cameras.Remove(place.Camera);

    if (place.Radar != null)
        _db.Radars.Remove(place.Radar);


    _db.Places.Remove(place);

    await _db.SaveChangesAsync();
}


}
