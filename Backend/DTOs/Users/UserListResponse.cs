using Backend.Models.Enums;

namespace Backend.DTOs.Users
{
    public class UserListResponse
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string Username { get; set; } = null!;
        public UserRole Role { get; set; }
        public int? AreaId { get; set; }
        public string? AreaName { get; set; }
        public bool IsActive { get; set; }
    }
}
