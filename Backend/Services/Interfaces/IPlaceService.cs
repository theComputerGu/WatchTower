using Backend.DTOs.Places;
using Backend.Models;
using Backend.Models.Enums; // 👈 זה החסר!

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

    Task UpdatePlaceTypeAsync(
    int placeId,
    PlaceType newType,
    User currentUser
    );


    Task DeletePlaceAsync(
        int placeId,
        User currentUser
    );

}
