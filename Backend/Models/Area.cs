using Backend.Models;

public class Area
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string PolygonGeoJson { get; set; } = null!;
    public Guid? AreaAdminUserId { get; set; }
    public User? AreaAdminUser { get; set; }
    public ICollection<Device> Devices { get; set; } = new List<Device>();
    public ICollection<Target> Targets { get; set; } = new List<Target>();
}

