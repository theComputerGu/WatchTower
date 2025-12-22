using Backend.Models.Enums;

namespace Backend.DTOs.Devices;

public class CreateDeviceRequest
{
    public int PlaceId { get; set; }
    public DeviceType Type { get; set; }
}
