using Backend.DTOs.Places;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/places")]
[Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
public class PlacesController : ControllerBase
{
    private readonly IPlaceService _placeService;

    public PlacesController(IPlaceService placeService)
    {
        _placeService = placeService;
    }

    [HttpPost]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> CreatePlace(
        [FromBody] CreatePlaceRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var place = await _placeService.CreatePlaceAsync(request, user);
        return Ok(place);
    }

[HttpGet]
[Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
public async Task<IActionResult> GetPlaces()
{

    Console.WriteLine("===== AUTH DEBUG =====");
Console.WriteLine($"IsAuthenticated: {User.Identity?.IsAuthenticated}");
Console.WriteLine($"User.Identity.Name: {User.Identity?.Name}");

foreach (var claim in User.Claims)
{
    Console.WriteLine($"CLAIM -> {claim.Type} = {claim.Value}");
}
Console.WriteLine("======================");
    var user = HttpContext.Items["User"] as User;
    if (user == null)
    {
        Console.WriteLine("❌ HttpContext.Items['User'] is null");
        return Unauthorized();
    }

    Console.WriteLine("===== AUTH DEBUG =====");
    Console.WriteLine($"UserId: {user.Id}");
    Console.WriteLine($"User.Role (DB): {user.Role}");

    foreach (var claim in User.Claims)
    {
        Console.WriteLine($"CLAIM -> {claim.Type} = {claim.Value}");
    }
    Console.WriteLine("======================");

    var places = await _placeService.GetPlacesForUserAsync(user);
    return Ok(places);
}

[HttpPatch("{id}/type")]
[Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
public async Task<IActionResult> UpdatePlaceType(
    int id,
    [FromBody] UpdatePlaceTypeRequest request)
{
    var user = HttpContext.Items["User"] as User;
    if (user == null) return Unauthorized();

    await _placeService.UpdatePlaceTypeAsync(
        id,
        request.Type,
        user);

    return NoContent();
}


}
