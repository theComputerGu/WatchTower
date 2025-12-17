namespace Backend.DTOs.Auth;

public class SignUpRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Username { get; set; } = null!;
}
