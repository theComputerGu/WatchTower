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
        // אם אין משתמש מאומת – אין מה לעשות
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        // שליפת ה-UserId מה-JWT
        var userId = context.User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
            ?.Value;

        if (userId == null)
        {
            await _next(context);
            return;
        }

        // שליפת המשתמש מה-DB כולל אזורים שהוא מנהל
        var user = await db.Users
            .Include(u => u.ManagedAreas)
            .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

        if (user != null)
        {
            // 👈 זה החלק הקריטי
            context.Items["User"] = user;
        }

        await _next(context);
    }
}
