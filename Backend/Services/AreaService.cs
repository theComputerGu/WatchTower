using Backend.DTOs.Areas;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class AreaService : IAreaService
    {
        private readonly IAreaRepository _areas;
        private readonly IBaseRepository<Area> _areaBase;

        public AreaService(
            IAreaRepository areas,
            IBaseRepository<Area> areaBase)
        {
            _areas = areas;
            _areaBase = areaBase;
        }

        //get all areas
        public async Task<List<AreaResponse>> GetAllAsync()
        {
            var areas = await _areas.GetAllAsync();

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

            await _areaBase.AddAsync(area);
            await _areaBase.SaveChangesAsync();

            return area.Id;
        }

        //edit area
        public async Task UpdateAsync(int areaId, CreateAreaRequest request)
        {
            var area = await _areaBase.GetByIdAsync(areaId);
            if (area == null)
                return;

            area.Name = request.Name;
            area.Description = request.Description;
            area.PolygonGeoJson = request.PolygonGeoJson;

            await _areaBase.SaveChangesAsync();
        }

        //delete area
        public async Task DeleteAsync(int areaId)
        {
            var area = await _areaBase.GetByIdAsync(areaId);
            if (area == null)
                return;

            _areaBase.Remove(area);
            await _areaBase.SaveChangesAsync();
        }

        //relate are to admin area
        public async Task AssignAdminAsync(int areaId, Guid userId)
        {
            var area = await _areaBase.GetByIdAsync(areaId);
            if (area == null)
                return;

            area.AreaAdminUserId = userId;
            await _areaBase.SaveChangesAsync();
        }

        //get areas that not relate to the current admin
        public async Task<List<AreaResponse>> GetUnassignedAsync()
        {
            var areas = await _areas.GetUnassignedAsync();

            return areas.Select(a => new AreaResponse
            {
                Id = a.Id,
                Name = a.Name,
                Description = a.Description,
                PolygonGeoJson = a.PolygonGeoJson,
                AreaAdminUserId = null,
                AreaAdminName = null
            }).ToList();
        }
    }
}
