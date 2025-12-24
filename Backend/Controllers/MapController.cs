using Backend.Services.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/map")]
[Authorize]
public class MapController : ControllerBase
{
    private readonly IMapService _mapService;

    public MapController(IMapService mapService)
    {
        _mapService = mapService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMap([FromQuery] int? areaId,[FromQuery] string? deviceType,[FromQuery] string? status)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null)
            return Unauthorized();

        var result = await _mapService.GetMapAsync(user,areaId,deviceType,status);

        return Ok(result);
    }
}
