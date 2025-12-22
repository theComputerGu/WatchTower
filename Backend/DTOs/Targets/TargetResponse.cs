namespace Backend.DTOs.Targets;

public class TargetResponse
{
    public int Id { get; set; }
    public int AreaId { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public int? DeviceId { get; set; }
}
