using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class TargetRepository : ITargetRepository
{
    private readonly AppDbContext _db;

    public TargetRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<Target> Query()
    {
        return _db.Targets.AsQueryable();
    }


    public async Task<bool> AreaExistsAsync(int areaId)
    {
        return await _db.Areas.AnyAsync(a => a.Id == areaId);
    }

    public async Task<Target?> GetWithDeviceAsync(int targetId)
    {
        return await _db.Targets
            .Include(t => t.Device)
            .FirstOrDefaultAsync(t => t.Id == targetId);
    }
}
