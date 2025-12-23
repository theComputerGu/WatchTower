using Backend.Models;

namespace Backend.Repositories.Interfaces;

public interface ITargetRepository
{
    IQueryable<Target> Query();

    Task<Target?> GetByIdAsync(int id);

    Task<bool> AreaExistsAsync(int areaId);

    Task AddAsync(Target target);

    void Remove(Target target);

    Task SaveChangesAsync();
}
