using Backend.Data;
using Backend.DTOs.Users;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        //getting all the table of the users with all parameters
        public async Task<List<UserListResponse>> GetAllAsync(Guid currentUserId)
        {
            var users = await _context.Users
                .Include(u => u.ManagedAreas)
                .Where(u => u.Id != currentUserId)
                .AsNoTracking()
                .ToListAsync();

            return users.Select(u =>
            {
                var area = u.ManagedAreas.FirstOrDefault();

                return new UserListResponse
                {
                    Id = u.Id,
                    Email = u.Email,
                    Username = u.Username,
                    Role = u.Role,
                    AreaId = area?.Id,
                    AreaName = area?.Name,
                    IsActive = u.IsActive
                };
            }).ToList();
        }


        //update status of user to admin area
        public async Task UpdateUserAsync(Guid userId, UpdateUserRequest request)
        {
            var user = await _context.Users
                .Include(u => u.ManagedAreas)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                throw new Exception("User not found");

            if (user.Role == UserRole.GLOBAL_ADMIN)
                throw new Exception("Cannot modify GLOBAL_ADMIN user");

            void DetachAllManagedAreas()
            {
                foreach (var a in user.ManagedAreas)
                    a.AreaAdminUserId = null;

                user.ManagedAreas.Clear();
            }

            if (request.Role == UserRole.USER)
            {
                user.Role = UserRole.USER;
                DetachAllManagedAreas();

                await _context.SaveChangesAsync();
                return;
            }

            if (request.Role == UserRole.AREA_ADMIN)
            {
                user.Role = UserRole.AREA_ADMIN;

                if (!request.AreaId.HasValue)
                {
                    DetachAllManagedAreas();
                    await _context.SaveChangesAsync();
                    return;
                }

                var area = await _context.Areas.FirstOrDefaultAsync(a => a.Id == request.AreaId.Value);
                if (area == null)
                    throw new Exception("Area not found");

                if (area.AreaAdminUserId != null && area.AreaAdminUserId != user.Id)
                    throw new Exception("Area already has an admin");
                DetachAllManagedAreas();

                user.ManagedAreas.Add(area);
                area.AreaAdminUserId = user.Id;

                await _context.SaveChangesAsync();
                return;
            }

            throw new Exception("Unsupported role");
        }

    }
}
