using Backend.DTOs.Targets;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/targets")]
[Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
public class TargetsController : ControllerBase
{
    private readonly ITargetService _targetService;

    public TargetsController(ITargetService targetService)
    {
        _targetService = targetService;
    }

    //get all the targets that  the user ca nsee - mabey nothing
    [HttpGet]
    public async Task<IActionResult> GetTargets([FromQuery] int? areaId = null)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var targets = await _targetService.GetTargetsForUserAsync(user, areaId);
        return Ok(targets);
    }


    //create target
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTargetRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var created = await _targetService.CreateAsync(request, user);
        return Ok(created);
    }


    //update the target
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTargetRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var updated = await _targetService.UpdateDetailsAsync(id, request, user);
        return Ok(updated);
    }

    //target postion for updates:
    [HttpPatch("{id}/position")]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public async Task<IActionResult> UpdatePosition(int id,[FromBody] UpdateTargetPositionRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        try
        {
            await _targetService.UpdatePositionAsync(id, request.Latitude, request.Longitude, user);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }

    }



    //delete target
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _targetService.DeleteAsync(id, user);
        return NoContent();
    }
}
