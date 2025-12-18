using Backend.DTOs.Users;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "GLOBAL_ADMIN")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserListResponse>>> GetAll()
        {
            var currentUserId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            return await _userService.GetAllAsync(currentUserId);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateUserRequest request)
        {
            await _userService.UpdateUserAsync(id, request);
            return NoContent();
        }
    }
}
