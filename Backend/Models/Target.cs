namespace Backend.Models;

public class Target
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public int AreaId { get; set; }
    public Area Area { get; set; } = null!;

    public int? DeviceId { get; set; }
    public Device? Device { get; set; }
}
