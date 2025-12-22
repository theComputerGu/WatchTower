using Backend.DTOs.Users;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // GLOBAL ADMIN – כל המשתמשים
        [HttpGet]
        [Authorize(Roles = "GLOBAL_ADMIN")]
        public async Task<ActionResult<List<UserListResponse>>> GetAll()
        {
            var currentUserId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            return await _userService.GetAllAsync(currentUserId);
        }

        // GLOBAL ADMIN – עדכון משתמש
        [HttpPut("{id}")]
        [Authorize(Roles = "GLOBAL_ADMIN")]
        public async Task<IActionResult> Update(Guid id, UpdateUserRequest request)
        {
            await _userService.UpdateUserAsync(id, request);
            return NoContent();
        }

        // AREA ADMIN – משתמשים רלוונטיים בלבד
        [HttpGet("my")]
        [Authorize(Roles = "AREA_ADMIN")]
        public async Task<IActionResult> GetMyUsers()
        {
            var currentUser = HttpContext.Items["User"] as User;
            if (currentUser == null) return Unauthorized();

            var users = await _userService.GetUsersInMyAreasAsync(currentUser.Id);
            return Ok(users);
        }
    }
}
