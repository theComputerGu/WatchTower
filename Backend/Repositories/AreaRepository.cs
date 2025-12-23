using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories
{
    public class AreaRepository : IAreaRepository
    {
        private readonly AppDbContext _context;

        public AreaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Area>> GetAllAsync()
        {
            return await _context.Areas
                .Include(a => a.AreaAdminUser)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<Area>> GetUnassignedAsync()
        {
            return await _context.Areas
                .Where(a => a.AreaAdminUserId == null)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Area?> GetByIdAsync(int areaId)
        {
            return await _context.Areas.FindAsync(areaId);
        }

        public async Task AddAsync(Area area)
        {
            _context.Areas.Add(area);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveAsync(Area area)
        {
            _context.Areas.Remove(area);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
