using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Devices;

public class UpdateDeviceTypeRequest
{
    [Required]
    public DeviceType Type { get; set; }
}
