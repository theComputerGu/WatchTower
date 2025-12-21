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

    // =====================================================
    // CREATE PLACE
    // =====================================================
    public async Task<PlaceResponse> CreatePlaceAsync(
        CreatePlaceRequest request,
        User currentUser)
    {
        Area? matchedArea = null;

        Console.WriteLine("===== CREATE PLACE DEBUG =====");
        Console.WriteLine($"User: {currentUser.Email} ({currentUser.Role})");
        Console.WriteLine($"Point: lat={request.Latitude}, lng={request.Longitude}");

        if (currentUser.Role == UserRole.GLOBAL_ADMIN)
        {
            var areas = await _db.Areas.AsNoTracking().ToListAsync();

            foreach (var area in areas)
            {
                if (string.IsNullOrWhiteSpace(area.PolygonGeoJson))
                    continue;

                bool inside = IsPointInsidePolygon(
                    request.Latitude,
                    request.Longitude,
                    area.PolygonGeoJson
                );

                Console.WriteLine($"Checking area {area.Id} → inside={inside}");

                if (inside)
                {
                    matchedArea = area;
                    break;
                }
            }

            if (matchedArea == null)
                throw new InvalidOperationException(
                    "Place is not inside any area – please choose another location");
        }
        else
        {
            var area = currentUser.ManagedAreas.Single();

            if (!IsPointInsidePolygon(
                    request.Latitude,
                    request.Longitude,
                    area.PolygonGeoJson))
            {
                throw new UnauthorizedAccessException(
                    "Place is not inside your area");
            }

            matchedArea = area;
        }

        var place = new Place
        {
            AreaId = matchedArea!.Id,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Type = request.Type
        };

        _db.Places.Add(place);
        await _db.SaveChangesAsync();

        if (request.Type == PlaceType.Camera)
            _db.Cameras.Add(new Camera { PlaceId = place.Id });
        else
            _db.Radars.Add(new Radar { PlaceId = place.Id });

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

    // =====================================================
    // GET PLACES FOR USER
    // =====================================================
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

    // =====================================================
    // HELPER – Feature-aware point-in-polygon
    // =====================================================
    private bool IsPointInsidePolygon(
        double lat,
        double lng,
        string polygonGeoJson)
    {
        try
        {
            var json = JObject.Parse(polygonGeoJson);

            // 🔹 אם זה Feature – שלוף geometry
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

            // Covers עדיף – גם על הגבול
            return covers;
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ ERROR in IsPointInsidePolygon");
            Console.WriteLine(ex.Message);
            return false;
        }
    }
}
