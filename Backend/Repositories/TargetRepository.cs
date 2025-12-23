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

    public async Task<Target?> GetByIdAsync(int id)
    {
        return await _db.Targets.FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<bool> AreaExistsAsync(int areaId)
    {
        return await _db.Areas.AnyAsync(a => a.Id == areaId);
    }

    public async Task AddAsync(Target target)
    {
        await _db.Targets.AddAsync(target);
    }

    public void Remove(Target target)
    {
        _db.Targets.Remove(target);
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
