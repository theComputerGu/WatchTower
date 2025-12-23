namespace Backend.DTOs.Map;

public class MapTargetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int AreaId { get; set; }
}
