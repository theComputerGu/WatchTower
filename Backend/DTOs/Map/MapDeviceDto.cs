namespace Backend.DTOs.Map;

public class MapDeviceDto
{
    public int Id { get; set; }
    public string Type { get; set; } = null!; // Camera / Radar
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsActive { get; set; }
    public int AreaId { get; set; }

    public int? TargetId { get; set; }
    public double? TargetLatitude { get; set; }
    public double? TargetLongitude { get; set; }
}
