namespace Backend.Config;

public class JwtSettings
{
    public string Secret { get; set; } = null!;
    public int ExpirationMinutes { get; set; }
}
