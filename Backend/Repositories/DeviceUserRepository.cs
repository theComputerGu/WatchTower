using Backend.Data;
using Backend.Models;
using Backend.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories;

public class DeviceUserRepository : IDeviceUserRepository
{
    private readonly AppDbContext _db;

    public DeviceUserRepository(AppDbContext db)
    {
        _db = db;
    }

    //all the users to the device  -per id
    public async Task<List<Guid>> GetUserIdsForDeviceAsync(int deviceId)
        => await _db.DeviceUsers
            .Where(du => du.DeviceId == deviceId)
            .Select(du => du.UserId)
            .ToListAsync();

    //all the users to the device - per object
    public async Task<List<User>> GetUsersForDeviceAsync(int deviceId)
        => await _db.DeviceUsers
            .Include(du => du.User)
            .Where(du => du.DeviceId == deviceId)
            .Select(du => du.User)
            .AsNoTracking()
            .ToListAsync();

    //checking relation between user and device
    public async Task<DeviceUser?> GetAsync(int deviceId, Guid userId)
        => await _db.DeviceUsers
            .FirstOrDefaultAsync(du =>
                du.DeviceId == deviceId &&
                du.UserId == userId);

    //relate device <--> user
    public async Task AddRangeAsync(List<DeviceUser> links)
        => await _db.DeviceUsers.AddRangeAsync(links);

    //remove relae user device
    public void Remove(DeviceUser link)
        => _db.DeviceUsers.Remove(link);

    //save dele + add + remoe
    public async Task SaveChangesAsync()
        => await _db.SaveChangesAsync();
}
