using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Users
{
    public class UpdateUserRequest
    {
        [Required]
        public UserRole Role { get; set; }

        public int? AreaId { get; set; }
    }
}
