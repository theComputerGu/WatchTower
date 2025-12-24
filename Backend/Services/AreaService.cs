using Backend.DTOs.Areas;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services
{
    public class AreaService : IAreaService
    {
        private readonly IAreaRepository _areaRepository;

        public AreaService(IAreaRepository areaRepository)
        {
            _areaRepository = areaRepository;
        }

        //get all areas
        public async Task<List<AreaResponse>> GetAllAsync()
        {
            var areas = await _areaRepository.GetAllAsync();

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

            await _areaRepository.AddAsync(area);

            return area.Id;
        }

        //edit area
        public async Task UpdateAsync(int areaId, CreateAreaRequest request)
        {
            var area = await _areaRepository.GetByIdAsync(areaId);
            // if (area == null)
            //     throw new Exception("Area not found");

            area.Name = request.Name;
            area.Description = request.Description;
            area.PolygonGeoJson = request.PolygonGeoJson;

            await _areaRepository.SaveChangesAsync();
        }

        //delete area
        public async Task DeleteAsync(int areaId)
        {
            var area = await _areaRepository.GetByIdAsync(areaId);
            // if (area == null)
            //     throw new Exception("Area not found");

            await _areaRepository.RemoveAsync(area);
        }

        //relate are to admin area
        public async Task AssignAdminAsync(int areaId, Guid userId)
        {
            var area = await _areaRepository.GetByIdAsync(areaId);
            // if (area == null)
            //     throw new Exception("Area not found");

            area.AreaAdminUserId = userId;
            await _areaRepository.SaveChangesAsync();
        }

        //get areas that not relate to the current admin
        public async Task<List<AreaResponse>> GetUnassignedAsync()
        {
            var areas = await _areaRepository.GetUnassignedAsync();

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
