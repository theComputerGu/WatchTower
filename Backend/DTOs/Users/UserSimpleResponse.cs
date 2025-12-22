using Backend.Models.Enums;

namespace Backend.DTOs.Users
{
    public class UserSimpleResponse
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public UserRole Role { get; set; }
    }
}
