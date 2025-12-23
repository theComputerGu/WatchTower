using Backend.Config;
using Backend.Data;
using Backend.Services;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using Backend.Middleware;

var builder = WebApplication.CreateBuilder(args);



// builder.Services.AddControllers();
builder.Services
    .AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

//swagger:
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//dbcontext:
builder.Services.AddDbContext<AppDbContext>(options =>options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

//JWT:
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));


var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;


//function that checking the key:
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };
    });


//interfaces:
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAreaService, AreaService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPlaceService, PlaceService>();
builder.Services.AddScoped<IDeviceService, DeviceService>();
builder.Services.AddScoped<ITargetService, TargetService>();
builder.Services.AddScoped<IMapService, MapService>();

//conection to front:
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


//app building:
var app = builder.Build();


//swagger:
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "WatchTower API v1");
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowVite");

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<UserContextMiddleware>();

app.MapControllers();

app.Run();
