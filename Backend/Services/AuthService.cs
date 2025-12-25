using Backend.DTOs.Auth;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IJwtService _jwt;

    public AuthService(IUserRepository users, IJwtService jwt)
    {
        _users = users;
        _jwt = jwt;
    }

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {
        if (await _users.EmailExistsAsync(request.Email))
            throw new ArgumentException("Email already exists");

        if (await _users.UsernameExistsAsync(request.Username))
            throw new ArgumentException("Username already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.USER,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        var token = _jwt.CreateToken(user);

        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Role = user.Role.ToString()
            }
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _users.GetByEmailAsync(request.Email);

        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        var token = _jwt.CreateToken(user);

        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Role = user.Role.ToString()
            }
        };
    }
}
