using Backend.DTOs.Areas;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using Backend.Models.Enums;
namespace Backend.Controllers
{
    [ApiController]
    [Route("api/areas")]
    [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
    public class AreasController : ControllerBase
    {
        private readonly IAreaService _areaService;

        public AreasController(IAreaService areaService)
        {
            _areaService = areaService;
        }

        //get all areas
        [HttpGet]
        [Authorize(Roles = "GLOBAL_ADMIN,AREA_ADMIN")]
        public async Task<ActionResult<List<AreaResponse>>> GetAll()
        {
            var user = HttpContext.Items["User"] as User;
            if (user == null)
                return Unauthorized();

            if (user.Role == UserRole.GLOBAL_ADMIN)
            {
                return await _areaService.GetAllAsync();
            }

            // AREA_ADMIN
            return user.ManagedAreas.Select(a => new AreaResponse
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                PolygonGeoJson = a.PolygonGeoJson,
                AreaAdminUserId = a.AreaAdminUserId,
                AreaAdminName = user.Username
            }).ToList();
        }


        //create area
        [HttpPost]
        public async Task<IActionResult> Create(CreateAreaRequest request)
        {
            var id = await _areaService.CreateAsync(request);
            return CreatedAtAction(nameof(GetAll), new { id }, null);
        }

        //edit area
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CreateAreaRequest request)
        {
            await _areaService.UpdateAsync(id, request);
            return NoContent();
        }

        //delete area
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _areaService.DeleteAsync(id);
            return NoContent();
        }

        //relate area to admin
        [HttpPut("{id:int}/assign-admin/{userId}")]
        public async Task<IActionResult> AssignAdmin(int id, Guid userId)
        {
            await _areaService.AssignAdminAsync(id, userId);
            return NoContent();
        }

        // get areas without admin
        [HttpGet("unassigned")]
        public async Task<ActionResult<List<AreaResponse>>> GetUnassigned()
        {
            return await _areaService.GetUnassignedAsync();
        }
    }
}
