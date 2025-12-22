using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Targets;

public class UpdateTargetRequest
{
    [Required] public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
