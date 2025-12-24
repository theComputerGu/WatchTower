using Backend.Models.Enums;

namespace Backend.DTOs.Devices;

public class DeviceResponse
{
    public int Id { get; set; }
    public DeviceType Type { get; set; }
    public int PlaceId { get; set; }
    public int AreaId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsActive { get; set; }
    public double? OrientationAngle { get; set; }
    public int? TargetId { get; set; }
    public string? TargetName { get; set; }
}
