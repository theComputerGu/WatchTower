namespace Backend.Models;

public class DeviceUser
{
    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;

    public Guid  UserId { get; set; }
    public User User { get; set; } = null!;
}
