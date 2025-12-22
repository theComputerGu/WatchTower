using Backend.Models.Enums;

namespace Backend.Models;

public class Device
{
    public int Id { get; set; }

    public DeviceType Type { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public double? OrientationAngle { get; set; }

    public bool IsActive { get; set; }

    public int AreaId { get; set; }
    public Area Area { get; set; } = null!;
    public int PlaceId { get; set; }
    public Place Place { get; set; } = null!;

    public int? TargetId { get; set; }
    public Target? Target { get; set; }

    public ICollection<DeviceUser> DeviceUsers { get; set; } = new List<DeviceUser>();
}
