using System.Security.Claims;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Middleware;

public class UserContextMiddleware
{
    private readonly RequestDelegate _next;

    public UserContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AppDbContext db)
    {
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        var userId = context.User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
            ?.Value;

        if (userId == null)
        {
            await _next(context);
            return;
        }

        var user = await db.Users
            .Include(u => u.ManagedAreas)
            .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

        if (user != null)
        {
            context.Items["User"] = user;
        }

        await _next(context);
    }
}
