using Backend.Data;
using Backend.DTOs.Areas;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AreaService : IAreaService
    {
        private readonly AppDbContext _context;

        public AreaService(AppDbContext context)
        {
            _context = context;
        }

        //get all areas
        public async Task<List<AreaResponse>> GetAllAsync()
        {
            var areas = await _context.Areas
                .Include(a => a.AreaAdminUser)
                .AsNoTracking()
                .ToListAsync();

            return areas.Select(a => new AreaResponse
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                PolygonGeoJson = a.PolygonGeoJson,
                AreaAdminUserId = a.AreaAdminUserId,
                AreaAdminName = a.AreaAdminUser?.Username
            }).ToList();
        }

        //crate area
        public async Task<int> CreateAsync(CreateAreaRequest request)
        {
            var area = new Area
            {
                Name = request.Name,
                Description = request.Description,
                PolygonGeoJson = request.PolygonGeoJson
            };

            _context.Areas.Add(area);
            await _context.SaveChangesAsync();

            return area.Id;
        }

        //edit area
        public async Task UpdateAsync(int areaId, CreateAreaRequest request)
        {
            var area = await _context.Areas.FindAsync(areaId);
            if (area == null)
                throw new Exception("Area not found");

            area.Name = request.Name;
            area.Description = request.Description;
            area.PolygonGeoJson = request.PolygonGeoJson;

            await _context.SaveChangesAsync();
        }

        //delete area
        public async Task DeleteAsync(int areaId)
        {
            var area = await _context.Areas.FindAsync(areaId);
            if (area == null)
                throw new Exception("Area not found");

            _context.Areas.Remove(area);
            await _context.SaveChangesAsync();
        }

        //relate are to admin area
        public async Task AssignAdminAsync(int areaId, Guid userId)
        {
            var area = await _context.Areas.FindAsync(areaId);
            if (area == null)
                throw new Exception("Area not found");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            if (user.Role != UserRole.AREA_ADMIN)
                throw new Exception("User is not AREA_ADMIN");

            area.AreaAdminUserId = user.Id;
            await _context.SaveChangesAsync();
        }
    }
}
