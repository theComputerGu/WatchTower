using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Targets;

public class CreateTargetRequest
{
    [Required] public string Name { get; set; } = null!;
    public string? Description { get; set; }

    [Required] public double Latitude { get; set; }
    [Required] public double Longitude { get; set; }

    [Required] public int AreaId { get; set; }
}
