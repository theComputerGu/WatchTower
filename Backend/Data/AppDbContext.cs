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
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Target> Targets => Set<Target>();
    public DbSet<DeviceUser> DeviceUsers => Set<DeviceUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<User>()
        .HasIndex(u => u.Email)
        .IsUnique();

    modelBuilder.Entity<Area>()
        .HasOne(a => a.AreaAdminUser)
        .WithMany(u => u.ManagedAreas)
        .HasForeignKey(a => a.AreaAdminUserId)
        .OnDelete(DeleteBehavior.SetNull);

    // Place ↔ Device (1:1)
    modelBuilder.Entity<Device>()
        .HasOne(d => d.Place)
        .WithOne(p => p.Device)
        .HasForeignKey<Device>(d => d.PlaceId)
        .OnDelete(DeleteBehavior.Restrict);

    // Area ↔ Device (1:N)
    modelBuilder.Entity<Device>()
        .HasOne(d => d.Area)
        .WithMany(a => a.Devices)
        .HasForeignKey(d => d.AreaId)
        .OnDelete(DeleteBehavior.Restrict);

    // Device ↔ Target (1:1)
    modelBuilder.Entity<Device>()
        .HasOne(d => d.Target)
        .WithOne(t => t.Device)
        .HasForeignKey<Device>(d => d.TargetId)
        .OnDelete(DeleteBehavior.SetNull);

    modelBuilder.Entity<Device>()
        .HasIndex(d => d.TargetId)
        .IsUnique()
        .HasFilter("[TargetId] IS NOT NULL");

    modelBuilder.Entity<Target>()
        .HasIndex(t => t.DeviceId)
        .IsUnique()
        .HasFilter("[DeviceId] IS NOT NULL");

    // Device ↔ User (N:M)
    modelBuilder.Entity<DeviceUser>()
        .HasKey(du => new { du.DeviceId, du.UserId });

    modelBuilder.Entity<DeviceUser>()
        .HasOne(du => du.Device)
        .WithMany(d => d.DeviceUsers)
        .HasForeignKey(du => du.DeviceId);

    modelBuilder.Entity<DeviceUser>()
        .HasOne(du => du.User)
        .WithMany(u => u.DeviceUsers)
        .HasForeignKey(du => du.UserId);
}

}
