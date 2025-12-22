using Backend.Models.Enums;

namespace Backend.Models;

public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Username { get; set; } = null!;

    public UserRole Role { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    public ICollection<Area> ManagedAreas { get; set; }= new List<Area>();

    public ICollection<DeviceUser> DeviceUsers { get; set; } = new List<DeviceUser>();
}
