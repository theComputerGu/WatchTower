// using Backend.Data;
// using Backend.DTOs.Auth;
// using Backend.Models;
// using Backend.Models.Enums;
// using Backend.Services.Interfaces;
// using Microsoft.EntityFrameworkCore;

// namespace Backend.Services;

// public class AuthService : IAuthService
// {
//     private readonly AppDbContext _db;
//     private readonly IJwtService _jwt;

//     public AuthService(AppDbContext db, IJwtService jwt)
//     {
//         _db = db;
//         _jwt = jwt;
//     }

//     public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
//     {
//         if (string.IsNullOrWhiteSpace(request.Email) ||
//             string.IsNullOrWhiteSpace(request.Password))
//             throw new ArgumentException("Email and password are required");

//         if (request.Password.Length < 6)
//             throw new ArgumentException("Password must be at least 6 characters");

//         if (await _db.Users.AnyAsync(u => u.Email == request.Email))
//             throw new ArgumentException("Email already exists");

//         var user = new User
//         {
//             Id = Guid.NewGuid(),
//             Email = request.Email,
//             Username = request.Username, // 👈 זה החסר והקריטי
//             PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
//             Role = UserRole.USER,
//             CreatedAt = DateTime.UtcNow,
//             IsActive = true
//         };

//         _db.Users.Add(user);
//         await _db.SaveChangesAsync();

//         var token = _jwt.CreateToken(user);

//         return new AuthResponse
//         {
//             Token = token,
//             User = new
//             {
//                 user.Id,
//                 user.Email,
//                 role = user.Role.ToString()
//             }
//         };
//     }



//     public async Task<AuthResponse> LoginAsync(LoginRequest request)
//     {
//         if (string.IsNullOrWhiteSpace(request.Email) ||
//             string.IsNullOrWhiteSpace(request.Password))
//             throw new ArgumentException("Email and password are required");

//         var user = await _db.Users
//             .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

//         if (user == null)
//             throw new ArgumentException("Invalid credentials");

//         if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
//             throw new ArgumentException("Invalid credentials");

//         var token = _jwt.CreateToken(user);

//         return new AuthResponse
//         {
//             Token = token,
//             User = new
//             {
//                 user.Id,
//                 user.Email,
//                 user.Username,
//                 role = user.Role.ToString()
//             }
//         };
//     }




// }



using Backend.Data;
using Backend.DTOs.Auth;
using Backend.Models;
using Backend.Models.Enums;
using Backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(AppDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new ArgumentException("Email already exists");

        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
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

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

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
    
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            throw new ArgumentException("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new ArgumentException("Invalid credentials");

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
