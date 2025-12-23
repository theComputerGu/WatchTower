using Backend.Data;
using Backend.DTOs.Map;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class MapService : IMapService
{
    private readonly AppDbContext _db;

    public MapService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MapSnapshotResponse> GetMapAsync(
        User user,
        int? areaId,
        string? deviceType,
        string? status)
    {
        // ========================
        // Base queries
        // ========================
        var areasQuery = _db.Areas.AsQueryable();
        var devicesQuery = _db.Devices.AsQueryable();
        var targetsQuery = _db.Targets.AsQueryable();

        // ========================
        // Role-based scope
        // ========================
        if (user.Role == UserRole.AREA_ADMIN)
        {
            var areaIds = user.ManagedAreas.Select(a => a.Id).ToList();

            areasQuery = areasQuery.Where(a => areaIds.Contains(a.Id));
            devicesQuery = devicesQuery.Where(d => areaIds.Contains(d.AreaId));
            targetsQuery = targetsQuery.Where(t => areaIds.Contains(t.AreaId));
        }
        else if (user.Role == UserRole.USER)
        {
            var deviceIds = await _db.DeviceUsers
                .Where(du => du.UserId == user.Id)
                .Select(du => du.DeviceId)
                .ToListAsync();

            devicesQuery = devicesQuery.Where(d => deviceIds.Contains(d.Id));

            var areaIds = await devicesQuery
                .Select(d => d.AreaId)
                .Distinct()
                .ToListAsync();

            areasQuery = areasQuery.Where(a => areaIds.Contains(a.Id));
            targetsQuery = targetsQuery.Where(t => areaIds.Contains(t.AreaId));
        }

        // ========================
        // Filters
        // ========================
        if (areaId.HasValue)
        {
            devicesQuery = devicesQuery.Where(d => d.AreaId == areaId);
            targetsQuery = targetsQuery.Where(t => t.AreaId == areaId);
            areasQuery = areasQuery.Where(a => a.Id == areaId);
        }

        if (!string.IsNullOrEmpty(deviceType) &&
            Enum.TryParse<DeviceType>(deviceType, true, out var parsedType))
        {
            devicesQuery = devicesQuery.Where(d => d.Type == parsedType);
        }

        if (!string.IsNullOrEmpty(status))
        {
            devicesQuery = status.ToLower() switch
            {
                "active" => devicesQuery.Where(d => d.IsActive),
                "offline" => devicesQuery.Where(d => !d.IsActive),
                _ => devicesQuery
            };
        }

        // ========================
        // Execute queries
        // ========================
        var areas = await areasQuery.ToListAsync();
        var devices = await devicesQuery
    .Include(d => d.Target)
    .ToListAsync();
        var targets = await targetsQuery.ToListAsync();

        // ========================
        // Build response
        // ========================
        return new MapSnapshotResponse
        {
            Areas = areas.Select(a => new MapAreaDto
            {
                Id = a.Id,
                Name = a.Name,
                PolygonGeoJson = a.PolygonGeoJson
            }).ToList(),

            Devices = devices.Select(d => new MapDeviceDto
            {
                Id = d.Id,
                Type = d.Type.ToString(),
                Latitude = d.Latitude,
                Longitude = d.Longitude,
                IsActive = d.IsActive,
                AreaId = d.AreaId,

                TargetId = d.TargetId,
                TargetLatitude = d.Target != null ? d.Target.Latitude : null,
                TargetLongitude = d.Target != null ? d.Target.Longitude : null
            }).ToList(),

            Targets = targets.Select(t => new MapTargetDto
            {
                Id = t.Id,
                Name = t.Name,
                Latitude = t.Latitude,
                Longitude = t.Longitude,
                AreaId = t.AreaId
            }).ToList(),

            Stats = new MapStatsDto
            {
                Areas = areas.Count,
                Cameras = devices.Count(d => d.Type == DeviceType.Camera),
                Radars = devices.Count(d => d.Type == DeviceType.Radar),
                Active = devices.Count(d => d.IsActive),
                Offline = devices.Count(d => !d.IsActive)
            }
        };
    }
}
