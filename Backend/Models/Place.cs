using Backend.Models.Enums;

namespace Backend.Models;

public class Place
{
    public int Id { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int AreaId { get; set; }
    public Area Area { get; set; } = null!;
    public Camera? Camera { get; set; }
    public Radar? Radar { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
     public PlaceType Type { get; set; } = PlaceType.None;
}
