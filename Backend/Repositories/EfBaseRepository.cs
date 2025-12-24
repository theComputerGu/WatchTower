using Backend.Data;
using Backend.Repositories.Base;
using Backend.Repositories.Interfaces;

namespace Backend.Repositories;

public class EfBaseRepository<T> : BaseRepository<T>, IBaseRepository<T>where T : class
{
    public EfBaseRepository(AppDbContext db) : base(db)
    {
    }
}
