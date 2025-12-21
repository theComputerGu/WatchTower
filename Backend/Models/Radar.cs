namespace Backend.Models;

public class Radar
{
    public int Id { get; set; }

    public int PlaceId { get; set; }
    public Place Place { get; set; } = null!;

}
