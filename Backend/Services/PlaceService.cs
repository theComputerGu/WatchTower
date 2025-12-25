using Backend.DTOs.Places;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using Newtonsoft.Json.Linq;

namespace Backend.Services;

public class PlaceService : IPlaceService
{
    private readonly IPlaceRepository _placeRepository;
    private readonly IBaseRepository<Place> _placeBase;
    private readonly IDeviceRepository _deviceRepository;
    private readonly IBaseRepository<Device> _deviceBase;


    public PlaceService(
        IPlaceRepository placeRepository,
        IBaseRepository<Place> placeBase,
        IDeviceRepository deviceRepository,
        IBaseRepository<Device> deviceBase)
    {
        _placeRepository = placeRepository;
        _placeBase = placeBase;
        _deviceRepository = deviceRepository;
        _deviceBase = deviceBase;
    }

    //create place
    public async Task<PlaceResponse> CreatePlaceAsync(CreatePlaceRequest request,User currentUser)
    {
        Area? matchedArea;

        //serach of the polygon - global admin
        if (currentUser.Role == UserRole.GLOBAL_ADMIN)
        {
            var areas = await _placeRepository.GetAreasWithPolygonAsync();

            matchedArea = areas.FirstOrDefault(area =>
                IsPointInsidePolygon(
                    request.Latitude,
                    request.Longitude,
                    area.PolygonGeoJson));

            if (matchedArea == null)
                throw new InvalidOperationException(
                    "Place is not inside any area");
        }

        //serach of the polygon area admin
        else
        {
            matchedArea = currentUser.ManagedAreas.Single();

            if (!IsPointInsidePolygon(
                request.Latitude,
                request.Longitude,
                matchedArea.PolygonGeoJson))
            {
                throw new UnauthorizedAccessException("Place is not inside your area");
            }
        }

        var place = new Place
        {
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            AreaId = matchedArea.Id
        };

        await _placeBase.AddAsync(place);
        await _placeBase.SaveChangesAsync();

        // creatintion of the device
        if (request.Type.HasValue && request.Type != PlaceType.None)
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
                IsActive = false
            };

            await _deviceBase.AddAsync(device);
            await _deviceBase.SaveChangesAsync();
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

    //Get places
    public async Task<List<PlaceResponse>> GetPlacesForUserAsync(User currentUser)
    {
        //query that gives all the places + include devices
        var places = await _placeRepository.GetPlacesWithDeviceAsync();

        if (currentUser.Role != UserRole.GLOBAL_ADMIN)
        {
            var areaId = currentUser.ManagedAreas.Single().Id;
            places = places.Where(p => p.AreaId == areaId).ToList();
        }

        return places.Select(p => new PlaceResponse
        {
            Id = p.Id,
            Latitude = p.Latitude,
            Longitude = p.Longitude,
            AreaId = p.AreaId,
            DeviceId = p.Device != null ? p.Device.Id : null,
            DeviceType = p.Device != null ? p.Device.Type : null
        }).ToList();
    }


    //update place position
    public async Task UpdatePlacePositionAsync(int placeId,double latitude,double longitude,User currentUser)
    {
        
        var place = await _placeRepository.GetPlaceWithDeviceAsync(placeId);

        if (place == null)
            throw new KeyNotFoundException("Place not found");

        
        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var managedAreaIds = currentUser.ManagedAreas.Select(a => a.Id);
            if (!managedAreaIds.Contains(place.AreaId))
                throw new UnauthorizedAccessException();
        }

    
        place.Latitude = latitude;
        place.Longitude = longitude;

      
        if (place.Device != null)
        {
            place.Device.Latitude = latitude;
            place.Device.Longitude = longitude;
        }

        await _placeBase.SaveChangesAsync();
    }





    //Update place type - not using it in the front
    public async Task UpdatePlaceDeviceAsync(int placeId,PlaceType newType,User currentUser)
    {
      
        var place = await _placeRepository.GetPlaceWithDeviceAsync(placeId);

        if (place == null)
            throw new KeyNotFoundException("Place not found");

 
        if (currentUser.Role == UserRole.AREA_ADMIN)
        {
            var managedAreaIds = currentUser.ManagedAreas.Select(a => a.Id);
            if (!managedAreaIds.Contains(place.AreaId))
                throw new UnauthorizedAccessException();
        }

   
        Target? existingTarget = place.Device?.Target;
        bool wasActive = place.Device?.IsActive ?? false;

   
        if (place.Device != null)
        {
            _deviceBase.Remove(place.Device);
            await _deviceBase.SaveChangesAsync();
        }

   
        if (newType == PlaceType.None)
            return;

      
        var deviceType =
            newType == PlaceType.Camera
                ? DeviceType.Camera
                : DeviceType.Radar;

        var newDevice = new Device
        {
            Type = deviceType,
            PlaceId = place.Id,
            AreaId = place.AreaId,
            Latitude = place.Latitude,
            Longitude = place.Longitude,
            IsActive = wasActive
        };

        await _deviceBase.AddAsync(newDevice);
        await _deviceBase.SaveChangesAsync();

     
        if (existingTarget != null)
        {
            existingTarget.DeviceId = newDevice.Id;
            await _deviceBase.SaveChangesAsync();
        }
    }



    //delete place
    public async Task DeletePlaceAsync(int placeId,User currentUser)
    {
        var place = await _placeRepository.GetPlaceWithDeviceAsync(placeId);

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
            _deviceBase.Remove(place.Device);

        _placeBase.Remove(place);
        await _placeBase.SaveChangesAsync();
    }

    //helper: geo
    private bool IsPointInsidePolygon(double lat,double lng,string polygonGeoJson)
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
