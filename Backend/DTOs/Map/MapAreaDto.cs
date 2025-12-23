namespace Backend.DTOs.Map;

public class MapAreaDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string PolygonGeoJson { get; set; } = null!;
}
