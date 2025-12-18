using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Area> Areas { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();


         modelBuilder.Entity<Area>()
            .HasOne(a => a.AreaAdminUser)
            .WithMany(u => u.ManagedAreas)
            .HasForeignKey(a => a.AreaAdminUserId)
            .OnDelete(DeleteBehavior.SetNull);

        base.OnModelCreating(modelBuilder);
    }
}
