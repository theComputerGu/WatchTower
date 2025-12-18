using System.ComponentModel.DataAnnotations;
namespace Backend.DTOs.Auth;


public class SignUpRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = null!;

    [Required, MinLength(2)]
    public string Username { get; set; } = null!;

    [Required, MinLength(6)]
    public string Password { get; set; } = null!;
}
