using Backend.Data;
using Backend.DTOs.Map;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
namespace Backend.Services;
using Microsoft.EntityFrameworkCore;


public class MapService : IMapService
{
    private readonly AppDbContext _db;

    public MapService(AppDbContext db)
    {
        _db = db;
    }


    //main function
    public async Task<MapSnapshotResponse> GetMapAsync(User user,int? areaId,string? deviceType,string? status)
    {

        var scope = InitQueries();
        scope = await ApplyRoleScopeAsync(user, scope);
        scope = ApplyViewFilters(areaId, deviceType, status, scope);

        return await BuildSnapshotAsync(scope.Areas,scope.Devices,scope.Targets);
    }




    //queries
    private sealed class MapQueryScope
    {
        public IQueryable<Area> Areas { get; init; } = default!;
        public IQueryable<Device> Devices { get; init; } = default!;
        public IQueryable<Target> Targets { get; init; } = default!;
    }




    //init
    private MapQueryScope InitQueries()
    {
        return new MapQueryScope
        {
            Areas   = _db.Areas.AsQueryable(),
            Devices = _db.Devices.AsQueryable(),
            Targets = _db.Targets.AsQueryable()
        };
    }





    //role checking
    private async Task<MapQueryScope> ApplyRoleScopeAsync(User user,MapQueryScope scope)
    {
        // GLOBAL_ADMIN – sees everything
        if (user.Role == UserRole.GLOBAL_ADMIN)
            return scope;

        // AREA_ADMIN – sees only managed areas
        if (user.Role == UserRole.AREA_ADMIN)
        {
            var areaIds = user.ManagedAreas.Select(a => a.Id).ToList();

            return new MapQueryScope
            {
                Areas   = scope.Areas.Where(a => areaIds.Contains(a.Id)),
                Devices = scope.Devices.Where(d => areaIds.Contains(d.AreaId)),
                Targets = scope.Targets.Where(t => areaIds.Contains(t.AreaId))
            };
        }

        // USER – sees only assigned devices and derived areas
        var deviceIds = await _db.DeviceUsers.Where(du => du.UserId == user.Id).Select(du => du.DeviceId).ToListAsync();

        var devices = scope.Devices
            .Where(d => deviceIds.Contains(d.Id));

        var areaIdsFromDevices = await devices.Select(d => d.AreaId).Distinct().ToListAsync();

        return new MapQueryScope
        {
            Devices = devices,
            Areas   = scope.Areas.Where(a => areaIdsFromDevices.Contains(a.Id)),
            Targets = scope.Targets.Where(t => areaIdsFromDevices.Contains(t.AreaId))
        };
    }





    //filters
    private MapQueryScope ApplyViewFilters(int? areaId,string? deviceType,string? status,MapQueryScope scope)
    {
        // Filter by area
        if (areaId.HasValue)
        {
            scope = new MapQueryScope
            {
                Areas   = scope.Areas.Where(a => a.Id == areaId),
                Devices = scope.Devices.Where(d => d.AreaId == areaId),
                Targets = scope.Targets.Where(t => t.AreaId == areaId)
            };
        }

        // Filter by device type
        if (!string.IsNullOrEmpty(deviceType) &&
            Enum.TryParse<DeviceType>(deviceType, true, out var parsedType))
        {
            scope = new MapQueryScope
            {
                Areas   = scope.Areas,
                Targets = scope.Targets,
                Devices = scope.Devices.Where(d => d.Type == parsedType)
            };
        }

        // Filter by status
        if (!string.IsNullOrEmpty(status))
        {
            scope = new MapQueryScope
            {
                Areas   = scope.Areas,
                Targets = scope.Targets,
                Devices = status.ToLower() switch
                {
                    "active"  => scope.Devices.Where(d => d.IsActive),
                    "offline" => scope.Devices.Where(d => !d.IsActive),
                    _         => scope.Devices
                }
            };
        }

        return scope;
    }






    //return dtos
    private async Task<MapSnapshotResponse> BuildSnapshotAsync(IQueryable<Area> areasQuery,IQueryable<Device> devicesQuery,IQueryable<Target> targetsQuery)
    {
        var areas = await areasQuery.ToListAsync();
        var devices = await devicesQuery.Include(d => d.Target).ToListAsync();
        var targets = await targetsQuery.ToListAsync();

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
                TargetLatitude = d.Target?.Latitude,
                TargetLongitude = d.Target?.Longitude
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
                Areas   = areas.Count,
                Cameras = devices.Count(d => d.Type == DeviceType.Camera),
                Radars  = devices.Count(d => d.Type == DeviceType.Radar),
                Active  = devices.Count(d => d.IsActive),
                Offline = devices.Count(d => !d.IsActive)
            }
        };
    }
}








// //bringing the map of the user based on what hw wants to see
//     public async Task<MapSnapshotResponse> GetMapAsync(User user,int? areaId,string? deviceType,string? status)
//     {
      
//         var areasQuery = _db.Areas.AsQueryable();
//         var devicesQuery = _db.Devices.AsQueryable();
//         var targetsQuery = _db.Targets.AsQueryable();


//        //cheking if the current user is area admin
//         if (user.Role == UserRole.AREA_ADMIN)
//         {
//             var areaIds = user.ManagedAreas.Select(a => a.Id).ToList();

//             areasQuery = areasQuery.Where(a => areaIds.Contains(a.Id));
//             devicesQuery = devicesQuery.Where(d => areaIds.Contains(d.AreaId));
//             targetsQuery = targetsQuery.Where(t => areaIds.Contains(t.AreaId));
//         }

//         //cheking if the current user is user regular
//         else if (user.Role == UserRole.USER)
//         {
//             var deviceIds = await _db.DeviceUsers.Where(du => du.UserId == user.Id).Select(du => du.DeviceId).ToListAsync();

//             devicesQuery = devicesQuery.Where(d => deviceIds.Contains(d.Id));

//             //taking the areas from the devices that that user connect 
//             var areaIds = await devicesQuery.Select(d => d.AreaId).Distinct().ToListAsync();

//             areasQuery = areasQuery.Where(a => areaIds.Contains(a.Id));
//             targetsQuery = targetsQuery.Where(t => areaIds.Contains(t.AreaId));
//         }

//        //filtering for area
//         if (areaId.HasValue)
//         {
//             devicesQuery = devicesQuery.Where(d => d.AreaId == areaId);
//             targetsQuery = targetsQuery.Where(t => t.AreaId == areaId);
//             areasQuery = areasQuery.Where(a => a.Id == areaId);
//         }

//         //filtring the devices for cameras or radars
//         if (!string.IsNullOrEmpty(deviceType) &&Enum.TryParse<DeviceType>(deviceType, true, out var parsedType))
//         {
//             devicesQuery = devicesQuery.Where(d => d.Type == parsedType);
//         }

//         //filtering for status actove or not
//         if (!string.IsNullOrEmpty(status))
//         {
//             devicesQuery = status.ToLower() switch
//             {
//                 "active" => devicesQuery.Where(d => d.IsActive),
//                 "offline" => devicesQuery.Where(d => !d.IsActive),
//                 _ => devicesQuery
//             };
//         }

       
//         var areas = await areasQuery.ToListAsync();
//         var devices = await devicesQuery.Include(d => d.Target).ToListAsync();
//         var targets = await targetsQuery.ToListAsync();


//         return new MapSnapshotResponse
//         {
//             Areas = areas.Select(a => new MapAreaDto
//             {
//                 Id = a.Id,
//                 Name = a.Name,
//                 PolygonGeoJson = a.PolygonGeoJson
//             }).ToList(),

//             Devices = devices.Select(d => new MapDeviceDto
//             {
//                 Id = d.Id,
//                 Type = d.Type.ToString(),
//                 Latitude = d.Latitude,
//                 Longitude = d.Longitude,
//                 IsActive = d.IsActive,
//                 AreaId = d.AreaId,
//                 TargetId = d.TargetId,
//                 TargetLatitude = d.Target != null ? d.Target.Latitude : null,
//                 TargetLongitude = d.Target != null ? d.Target.Longitude : null
//             }).ToList(),

//             Targets = targets.Select(t => new MapTargetDto
//             {
//                 Id = t.Id,
//                 Name = t.Name,
//                 Latitude = t.Latitude,
//                 Longitude = t.Longitude,
//                 AreaId = t.AreaId
//             }).ToList(),

//             Stats = new MapStatsDto
//             {
//                 Areas = areas.Count,
//                 Cameras = devices.Count(d => d.Type == DeviceType.Camera),
//                 Radars = devices.Count(d => d.Type == DeviceType.Radar),
//                 Active = devices.Count(d => d.IsActive),
//                 Offline = devices.Count(d => !d.IsActive)
//             }
//         };
//     }