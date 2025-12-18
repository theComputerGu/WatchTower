using Backend.DTOs.Auth;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
     Task<AuthResponse> LoginAsync(LoginRequest request);
}
