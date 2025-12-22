using Backend.DTOs.Devices;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/devices")]
[Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;

    public DevicesController(IDeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDevices()
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var devices = await _deviceService.GetDevicesForUserAsync(user);
        return Ok(devices);
    }

    [HttpPatch("{id}/type")]
    public async Task<IActionResult> UpdateType(int id, [FromBody] UpdateDeviceTypeRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var updated = await _deviceService.UpdateDeviceTypeAsync(id, request.Type, user);
        return Ok(updated);
    }

    [HttpPost("{id}/target")]
    public async Task<IActionResult> AssignTarget(int id, [FromBody] AssignTargetRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var updated = await _deviceService.AssignTargetAsync(id, request.TargetId, user);
        return Ok(updated);
    }

    [HttpDelete("{id}/target")]
    public async Task<IActionResult> UnassignTarget(int id)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var updated = await _deviceService.UnassignTargetAsync(id, user);
        return Ok(updated);
    }

    [HttpPost("{id}/users")]
    public async Task<IActionResult> AssignUsers(
        int id,
        [FromBody] AssignUsersRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _deviceService.AssignUsersAsync(id, request.UserIds, user);
        return NoContent();
    }

    [HttpDelete("{id}/users/{userId}")]
    public async Task<IActionResult> RemoveUser(
        int id,
        Guid userId)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _deviceService.RemoveUserAsync(id, userId, user);
        return NoContent();
    }

    [HttpGet("{id}/users")]
    public async Task<IActionResult> GetDeviceUsers(int id)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var users = await _deviceService.GetUsersForDeviceAsync(id, user);

        return Ok(users.Select(u => new
        {
            u.Id,
            u.Username,
            u.Email,
            u.Role
        }));
    }


    [HttpPost]
    public async Task<IActionResult> CreateDevice(
        [FromBody] CreateDeviceRequest request)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        var created = await _deviceService.CreateAsync(request, user);
        return Ok(created);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDevice(int id)
    {
        var user = HttpContext.Items["User"] as User;
        if (user == null) return Unauthorized();

        await _deviceService.DeleteAsync(id, user);
        return NoContent();
    }




}
