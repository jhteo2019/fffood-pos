using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using FfoodApi.Data;
using FfoodApi.DTOs;
using FfoodApi.Models;

namespace FfoodApi.Controllers;

[ApiController, Route("api/inventory")]
public class InventoryController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetInventory()
    {
        var items = await db.Items.Include(i => i.Category).OrderBy(i => i.Category!.SortOrder).ToListAsync();
        return Ok(items.Select(i =>
        {
            var tags = string.IsNullOrEmpty(i.Tags) ? [] : JsonSerializer.Deserialize<List<string>>(i.Tags) ?? [];
            return new InventoryItemDto(i.Id, i.Name, i.CategoryId, i.Category!.Name, i.Price, i.Stock, tags);
        }));
    }

    [HttpPost("{id}/adjust")]
    public async Task<IActionResult> AdjustStock(string id, AdjustStockRequest req)
    {
        var item = await db.Items.FindAsync(id);
        if (item == null) return NotFound();

        var before = item.Stock;
        item.Stock = req.Reason switch
        {
            "count"      => Math.Max(0, req.Qty),
            "waste"      => Math.Max(0, item.Stock - Math.Abs(req.Qty)),
            "delivery"   => item.Stock + Math.Abs(req.Qty),
            "correction" => Math.Max(0, item.Stock + req.Qty),
            _            => item.Stock
        };

        db.InventoryAdjustments.Add(new InventoryAdjustment
        {
            ItemId = id,
            StaffId = req.StaffId,
            Reason = req.Reason,
            QtyBefore = before,
            QtyChange = item.Stock - before,
            QtyAfter = item.Stock,
            Notes = req.Notes,
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync();
        return Ok(new { stock = item.Stock });
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(string id)
    {
        var history = await db.InventoryAdjustments
            .Where(a => a.ItemId == id)
            .Include(a => a.Staff)
            .OrderByDescending(a => a.CreatedAt)
            .Take(20)
            .Select(a => new {
                a.Id, a.Reason, a.QtyBefore, a.QtyChange, a.QtyAfter,
                Staff = a.Staff != null ? a.Staff.Name : "System",
                a.Notes, a.CreatedAt
            })
            .ToListAsync();
        return Ok(history);
    }
}
