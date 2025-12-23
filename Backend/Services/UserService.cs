using Backend.DTOs.Users;
using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _users;

        public UserService(IUserRepository users)
        {
            _users = users;
        }

        //getting all the table of the users with all parameters
        public async Task<List<UserListResponse>> GetAllAsync(Guid currentUserId)
        {
            var users = await _users.GetAllExceptAsync(currentUserId);

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


        //update status of user to admin area or to regular user
        public async Task UpdateUserAsync(Guid userId, UpdateUserRequest request)
        {
            var user = await _users.GetByIdWithAreasAsync(userId);

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

                await _users.SaveChangesAsync();
                return;
            }

            if (request.Role == UserRole.AREA_ADMIN)
            {
                user.Role = UserRole.AREA_ADMIN;

                if (!request.AreaId.HasValue)
                {
                    DetachAllManagedAreas();
                    await _users.SaveChangesAsync();
                    return;
                }

                var area = await _users.GetAreaByIdAsync(request.AreaId.Value);
                if (area == null)
                    throw new Exception("Area not found");

                // if (area.AreaAdminUserId != null && area.AreaAdminUserId != user.Id)
                //     throw new Exception("Area already has an admin");
                DetachAllManagedAreas();

                user.ManagedAreas.Add(area);
                area.AreaAdminUserId = user.Id;

                await _users.SaveChangesAsync();
                return;
            }

            throw new Exception("Unsupported role");
        }


        public async Task<List<UserSimpleResponse>> GetUsersInMyAreasAsync(Guid currentUserId)
        {
            var admin = await _users.GetByIdWithAreasAsync(currentUserId);

            if (admin == null)
                throw new Exception("User not found");

            if (admin.Role != UserRole.AREA_ADMIN)
                throw new UnauthorizedAccessException();

            var users = await _users.GetRegularUsersAsync();

            return users.Select(u => new UserSimpleResponse
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                Role = u.Role.ToString()
            }).ToList();
        }

    }
}
