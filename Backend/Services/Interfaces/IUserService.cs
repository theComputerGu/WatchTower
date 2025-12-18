using Backend.DTOs.Users;

namespace Backend.Services.Interfaces
{
    public interface IUserService
    {
        Task<List<UserListResponse>> GetAllAsync(Guid currentUserId);
        Task UpdateUserAsync(Guid userId, UpdateUserRequest request);
    }
}
