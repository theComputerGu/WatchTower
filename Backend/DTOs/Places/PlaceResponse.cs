using Backend.Models.Enums;

namespace Backend.DTOs.Places;

public class PlaceResponse
{
    public int Id { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int AreaId { get; set; }
    public int? DeviceId { get; set; }
    public DeviceType? DeviceType { get; set; }
}
