using Backend.Models;

public class Area
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string PolygonGeoJson { get; set; } = null!;
    public Guid? AreaAdminUserId { get; set; }
    public User? AreaAdminUser { get; set; }
}

