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

    // =========================
    // CREATE PLACE
    // =========================
    public async Task<PlaceResponse> CreatePlaceAsync(
        CreatePlaceRequest request,
        User currentUser)
    {
        Area matchedArea;

        // GLOBAL ADMIN – חיפוש אזור לפי פוליגון
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
        // AREA ADMIN – רק באזור שלו
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

        var place = new Place
        {
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AreaId = matchedArea.Id
        };

        _db.Places.Add(place);
        await _db.SaveChangesAsync();

        // אם נבחר סוג – יוצרים Device
        if (request.Type.HasValue &&
            request.Type != PlaceType.None)
        {
            var deviceType =
                request.Type == PlaceType.Camera
                    ? DeviceType.Camera
                    : DeviceType.Radar;

            var device = new Device
            {
                Type = deviceType,
                PlaceId = place.Id,
                AreaId = matchedArea.Id,
                Latitude = place.Latitude,
                Longitude = place.Longitude,
                IsActive = false // אין Target → לא פעיל
            };

            _db.Devices.Add(device);
            await _db.SaveChangesAsync();
        }

        return new PlaceResponse
        {
            Id = place.Id,
            Latitude = place.Latitude,
            Longitude = place.Longitude,
            AreaId = place.AreaId,
            DeviceId = place.Device?.Id,
            DeviceType = place.Device?.Type
        };
    }

    // =========================
    // GET PLACES
    // =========================
    public async Task<List<PlaceResponse>> GetPlacesForUserAsync(
        User currentUser)
    {
        IQueryable<Place> query = _db.Places
            .AsNoTracking()
            .Include(p => p.Device);

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
            AreaId = p.AreaId,
            DeviceId = p.Device != null ? p.Device.Id : null,
            DeviceType = p.Device != null ? p.Device.Type : null
        }).ToListAsync();
    }

    // =========================
    // UPDATE PLACE TYPE
    // =========================
    public async Task UpdatePlaceTypeAsync(
        int placeId,
        PlaceType newType,
        User currentUser)
    {
        var place = await _db.Places
            .Include(p => p.Device)
            .FirstOrDefaultAsync(p => p.Id == placeId);

        if (place == null)
            throw new KeyNotFoundException("Place not found");

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;
            if (place.AreaId != areaId)
                throw new UnauthorizedAccessException();
        }

        // אם יש Device – מוחקים אותו
        if (place.Device != null)
        {
            _db.Devices.Remove(place.Device);
        }

        // אם סוג חדש ≠ None – יוצרים Device חדש
        if (newType != PlaceType.None)
        {
            var deviceType =
                newType == PlaceType.Camera
                    ? DeviceType.Camera
                    : DeviceType.Radar;

            var device = new Device
            {
                Type = deviceType,
                PlaceId = place.Id,
                AreaId = place.AreaId,
                Latitude = place.Latitude,
                Longitude = place.Longitude,
                IsActive = false
            };

            _db.Devices.Add(device);
        }

        await _db.SaveChangesAsync();
    }

    // =========================
    // DELETE PLACE
    // =========================
    public async Task DeletePlaceAsync(
        int placeId,
        User currentUser)
    {
        var place = await _db.Places
            .Include(p => p.Device)
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

        if (place.Device != null)
            _db.Devices.Remove(place.Device);

        _db.Places.Remove(place);
        await _db.SaveChangesAsync();
    }

    // =========================
    // GEO HELPER
    // =========================
    private bool IsPointInsidePolygon(
        double lat,
        double lng,
        string polygonGeoJson)
    {
        try
        {
            var json = JObject.Parse(polygonGeoJson);

            if (json["type"]?.ToString() == "Feature")
                json = (JObject)json["geometry"]!;

            var reader = new GeoJsonReader();
            var geometry = reader.Read<Geometry>(json.ToString());
            geometry.SRID = 4326;

            var point = new Point(lng, lat)
            {
                SRID = 4326
            };

            return geometry.Covers(point);
        }
        catch
        {
            return false;
        }
    }
}
