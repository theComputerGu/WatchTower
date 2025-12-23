using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface IUserRepository
{
    Task<List<User>> GetAllExceptAsync(Guid userId);

    Task<User?> GetByIdWithAreasAsync(Guid userId);

    Task<User?> GetByIdAsync(Guid userId);

    Task<List<User>> GetRegularUsersAsync();

    Task<Area?> GetAreaByIdAsync(int areaId);

    Task<User?> GetByEmailAsync(string email);

    Task<bool> EmailExistsAsync(string email);

    Task<bool> UsernameExistsAsync(string username);

    Task AddAsync(User user);

    Task SaveChangesAsync();
}
