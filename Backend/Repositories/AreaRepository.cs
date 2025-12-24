using Backend.Data;
using Backend.Models;
using Backend.Repositories.Base;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class AreaRepository: BaseRepository<Area>, IAreaRepository
{
    public AreaRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<List<Area>> GetAllAsync()
    {
        return await Set
            .Include(a => a.AreaAdminUser)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Area>> GetUnassignedAsync()
    {
        return await Set
            .Where(a => a.AreaAdminUserId == null)
            .AsNoTracking()
            .ToListAsync();
    }
}
