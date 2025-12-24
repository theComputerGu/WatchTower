using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<User>> GetAllExceptAsync(Guid userId)
    {
        return await _context.Users
            .Include(u => u.ManagedAreas)
            .Where(u => u.Id != userId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<User?> GetByIdWithAreasAsync(Guid userId)
    {
        return await _context.Users
            .Include(u => u.ManagedAreas)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<User?> GetByIdAsync(Guid userId)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId);
    }

    public async Task<List<User>> GetRegularUsersAsync()
    {
        return await _context.Users
            .Where(u => u.Role == Models.Enums.UserRole.USER)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Area?> GetAreaByIdAsync(int areaId)
    {
        return await _context.Areas
            .FirstOrDefaultAsync(a => a.Id == areaId);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.Users
            .AnyAsync(u => u.Username == username);
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
