using Backend.DTOs.Map;
using Backend.Models;

namespace Backend.Services.Interfaces;

public interface IMapService
{
    Task<MapSnapshotResponse> GetMapAsync(User user,int? areaId,string? deviceType,string? status);
}
