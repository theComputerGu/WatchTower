using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class DeviceRepository : IDeviceRepository
{
    private readonly AppDbContext _db;

    public DeviceRepository(AppDbContext db)
    {
        _db = db;
    }


    public async Task<Device?> GetByIdWithTargetAsync(int id)
        => await _db.Devices
            .Include(d => d.Target)
            .FirstOrDefaultAsync(d => d.Id == id);

    public async Task<List<Device>> GetByAreaAsync(int areaId)
        => await _db.Devices
            .Where(d => d.AreaId == areaId)
            .ToListAsync();

    public async Task<List<Device>> GetAllWithTargetsAsync()
    {
        return await _db.Devices
            .Include(d => d.Target)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Device?> GetWithTargetAsync(int deviceId)
    {
        return await _db.Devices
            .Include(d => d.Target)
            .FirstOrDefaultAsync(d => d.Id == deviceId);
    }

}
