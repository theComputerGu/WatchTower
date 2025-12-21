using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Area> Areas { get; set; }
    public DbSet<Place> Places => Set<Place>();
    public DbSet<Camera> Cameras => Set<Camera>();
    public DbSet<Radar> Radars => Set<Radar>();

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

        modelBuilder.Entity<Place>()
            .HasOne(p => p.Camera)
            .WithOne(c => c.Place)
            .HasForeignKey<Camera>(c => c.PlaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Place>()
            .HasOne(p => p.Radar)
            .WithOne(r => r.Place)
            .HasForeignKey<Radar>(r => r.PlaceId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
