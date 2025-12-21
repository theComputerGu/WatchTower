namespace Backend.Models;

public class Camera
{
    public int Id { get; set; }
    public int PlaceId { get; set; }
    public Place Place { get; set; } = null!;

}
