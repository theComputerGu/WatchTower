using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Devices;

public class AssignUsersRequest
{
    [Required]
    public List<Guid> UserIds { get; set; } = new();
}
