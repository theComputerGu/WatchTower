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
        //checking JWT of the user - Authenticatation
        if (!context.User.Identity?.IsAuthenticated ?? true)
        {
            await _next(context);
            return;
        }

        //bringing the user id from the JWT
        var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

        //cheking if there is user
        if (userId == null)
        {
            await _next(context);
            return;
        }

        //loading all the parameters of the user + the areas that relate to the user
        var user = await db.Users.Include(u => u.ManagedAreas).FirstOrDefaultAsync(u => u.Id.ToString() == userId);

        //now everyone can execc to this user - that have this function
        if (user != null)
        {
            context.Items["User"] = user;
        }

        await _next(context);
    }
}
