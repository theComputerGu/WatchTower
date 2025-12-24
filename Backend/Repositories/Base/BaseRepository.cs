using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repositories.Base;

public abstract class BaseRepository<T> where T : class
{
    protected readonly AppDbContext Db;

    //db.devices, db.target......
    protected readonly DbSet<T> Set;

    protected BaseRepository(AppDbContext db)
    {
        Db = db;
        Set = db.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(object id)
        => await Set.FindAsync(id);

    public virtual IQueryable<T> Query()
        => Set.AsQueryable();

    public virtual async Task AddAsync(T entity)
        => await Set.AddAsync(entity);

    public virtual void Remove(T entity)
        => Set.Remove(entity);

    public virtual async Task SaveChangesAsync()
        => await Db.SaveChangesAsync();
}
