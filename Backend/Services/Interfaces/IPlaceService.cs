using Backend.DTOs.Places;
using Backend.Models;

namespace Backend.Services.Interfaces;

public interface IPlaceService
{
    Task<PlaceResponse> CreatePlaceAsync(
        CreatePlaceRequest request,
        User currentUser
    );

    Task<List<PlaceResponse>> GetPlacesForUserAsync(
        User currentUser
    );
}
