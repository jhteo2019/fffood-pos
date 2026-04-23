using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using FfoodApi.Data;
using FfoodApi.DTOs;

namespace FfoodApi.Controllers;

[ApiController, Route("api/menu")]
public class MenuController(AppDbContext db) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await db.Categories.OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Sub, c.SortOrder))
            .ToListAsync();
        return Ok(cats);
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetItems([FromQuery] bool all = false)
    {
        var query = db.Items.Include(i => i.Category).AsQueryable();
        if (!all) query = query.Where(i => i.IsActive);
        var items = await query.OrderBy(i => i.Category!.SortOrder).ToListAsync();

        var modGroups = await db.ModifierGroups
            .Include(g => g.Options)
            .ToListAsync();

        var result = items.Select(i =>
        {
            var tags = string.IsNullOrEmpty(i.Tags)
                ? [] : JsonSerializer.Deserialize<List<string>>(i.Tags) ?? [];
            var mods = modGroups.Where(g => g.CategoryId == i.CategoryId)
                .OrderBy(g => g.SortOrder)
                .Select(g => new ModifierGroupDto(g.Id, g.Name, g.IsRequired, g.IsMulti,
                    g.Options.OrderBy(o => o.SortOrder)
                             .Select(o => new ModifierOptionDto(o.Id, o.Name, o.Price)).ToList()))
                .ToList();
            return new ItemDto(i.Id, i.Name, i.CategoryId, i.Category!.Name,
                i.Price, i.Stock, tags, i.IsActive, mods);
        });
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<IActionResult> CreateItem(CreateItemRequest req)
    {
        var id = "I" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var tags = JsonSerializer.Serialize(req.Tags ?? []);
        var item = new FfoodApi.Models.Item
        {
            Id         = id,
            Name       = req.Name,
            CategoryId = req.CategoryId,
            Price      = req.Price,
            Stock      = req.Stock,
            Tags       = tags,
            IsActive   = true,
            CreatedAt  = DateTime.UtcNow,
            UpdatedAt  = DateTime.UtcNow,
        };
        db.Items.Add(item);
        await db.SaveChangesAsync();
        return Ok(new { id });
    }

    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(string id, UpdateItemRequest req)
    {
        var item = await db.Items.FindAsync(id);
        if (item == null) return NotFound();
        item.Name      = req.Name;
        item.Price     = req.Price;
        item.IsActive  = req.IsActive;
        item.Tags      = JsonSerializer.Serialize(req.Tags ?? []);
        item.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
