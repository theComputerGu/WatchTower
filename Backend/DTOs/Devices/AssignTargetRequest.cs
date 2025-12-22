using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Devices;

public class AssignTargetRequest
{
    [Required]
    public int TargetId { get; set; }
}
