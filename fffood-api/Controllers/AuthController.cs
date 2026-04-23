using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FfoodApi.Data;
using FfoodApi.DTOs;

namespace FfoodApi.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(AppDbContext db, IConfiguration cfg) : ControllerBase
{
    [HttpGet("staff")]
    public async Task<IActionResult> GetStaff()
    {
        var staff = await db.Staff
            .Where(s => s.IsActive)
            .Select(s => new StaffDto(s.Id, s.Name, s.Role, s.Initials, s.Color))
            .ToListAsync();
        return Ok(staff);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var staff = await db.Staff.FirstOrDefaultAsync(s => s.Id == req.StaffId && s.IsActive);
        if (staff == null || staff.Pin != req.Pin)
            return Unauthorized(new { message = "Invalid PIN" });

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            claims: [new Claim("staffId", staff.Id), new Claim("role", staff.Role)],
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return Ok(new LoginResponse(staff.Id, staff.Name, staff.Role, staff.Initials, staff.Color,
            new JwtSecurityTokenHandler().WriteToken(token)));
    }
}
