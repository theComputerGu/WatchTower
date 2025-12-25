using Backend.DTOs.Targets;
using Backend.Models;

namespace Backend.Services.Interfaces;

public interface ITargetService
{
    Task<TargetResponse> CreateAsync(
        CreateTargetRequest request,
        User currentUser);

    Task<TargetResponse> UpdateDetailsAsync(
        int targetId,
        UpdateTargetRequest request,
        User currentUser);

    Task UpdatePositionAsync(
        int targetId,
        double latitude,
        double longitude,
        User currentUser);

    Task DeleteAsync(
        int targetId,
        User currentUser);

    Task<List<TargetResponse>> GetTargetsForUserAsync(
        User currentUser,
        int? areaId = null);
}
