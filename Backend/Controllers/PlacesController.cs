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

    //create Place
    [HttpPost]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> CreatePlace([FromBody] CreatePlaceRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var place = await _placeService.CreatePlaceAsync(request, user);
        return Ok(place);
    }



    //get all places
    [HttpGet]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> GetPlaces()
    {

        var user = HttpContext.Items["User"] as User;
        if (user == null)
        {
            return Unauthorized();
        }


        var places = await _placeService.GetPlacesForUserAsync(user);
        return Ok(places);
    }

    //update postion
    [HttpPatch("{id}/position")]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> UpdatePlacePosition(
        int id,
        [FromBody] UpdatePlacePositionRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _placeService.UpdatePlacePositionAsync(
            id,
            request.Latitude,
            request.Longitude,
            user);

        return NoContent();
    }

    //update place type
    [HttpPatch("{id}/device")]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> UpdatePlaceDevice(int id,[FromBody] UpdatePlaceTypeRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _placeService.UpdatePlaceDeviceAsync(id,request.Type,user);

        return NoContent();
    }



    //delete place
    [HttpDelete("{placeId}")]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> DeletePlace(int placeId)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _placeService.DeletePlaceAsync(placeId, user);
        return NoContent();
    }



}
