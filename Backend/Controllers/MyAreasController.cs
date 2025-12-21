using Backend.DTOs.Areas;
using Backend.Models;
using Backend.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/areas/my")]
[Authorize(Roles = "AREA_ADMIN")]
public class MyAreasController : ControllerBase
{
    [HttpGet]
    public ActionResult<List<AreaResponse>> GetMyAreas()
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null)
            return Unauthorized();

        var areas = user.ManagedAreas.Select(a => new AreaResponse
        {
            Id = a.Id,
            Name = a.Name,
            Description = a.Description,
            PolygonGeoJson = a.PolygonGeoJson,
            AreaAdminUserId = a.AreaAdminUserId,
            AreaAdminName = user.Username
        }).ToList();

        return Ok(areas);
    }
}
