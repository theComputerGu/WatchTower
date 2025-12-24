namespace Backend.Repositories.Interfaces;

public interface IBaseRepository<T> where T : class
{
    Task<T?> GetByIdAsync(object id);
    Task AddAsync(T entity);
    void Remove(T entity);
    Task SaveChangesAsync();
}
