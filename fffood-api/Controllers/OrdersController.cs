using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FfoodApi.Data;
using FfoodApi.DTOs;
using FfoodApi.Models;

namespace FfoodApi.Controllers;

[ApiController, Route("api/orders")]
public class OrdersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status)
    {
        var q = db.Orders.Include(o => o.Staff).Include(o => o.Lines).ThenInclude(l => l.Modifiers).AsQueryable();
        if (!string.IsNullOrEmpty(status)) q = q.Where(o => o.Status == status);
        var orders = await q.OrderByDescending(o => o.CreatedAt).Take(50).ToListAsync();
        return Ok(orders.Select(MapOrder));
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest req)
    {
        var subtotal = req.Lines.Sum(l => l.LineTotal);
        var tax = Math.Round(subtotal * req.TaxRate, 2);
        var total = Math.Round(subtotal + tax - req.Discount, 2);

        var order = new Order
        {
            OrderNumber = $"POS-{Random.Shared.Next(1000, 9999)}",
            StaffId = req.StaffId,
            OrderType = req.OrderType,
            TableNumber = req.TableNumber,
            Guests = req.Guests,
            Subtotal = subtotal,
            TaxAmount = tax,
            Discount = req.Discount,
            Total = total,
            Status = "open",
            CreatedAt = DateTime.UtcNow,
            Lines = req.Lines.Select(l => new OrderLine
            {
                ItemId = l.ItemId,
                ItemName = l.ItemName,
                Qty = l.Qty,
                UnitPrice = l.UnitPrice,
                LineTotal = l.LineTotal,
                Note = l.Note,
                Modifiers = l.Modifiers.Select(m => new OrderLineModifier
                {
                    ModifierName = m.Name,
                    Price = m.Price
                }).ToList()
            }).ToList()
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOrders), new { id = order.Id }, MapOrder(order));
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> PayOrder(int id, PayOrderRequest req)
    {
        var order = await db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id);
        if (order == null) return NotFound();
        if (order.Status != "open") return BadRequest(new { message = "Order already closed" });

        order.Status = "paid";
        order.PaymentMethod = req.PaymentMethod;
        order.Tendered = req.Tendered;
        order.ChangeDue = req.Tendered.HasValue ? Math.Max(0, req.Tendered.Value - order.Total) : null;
        order.PaidAt = DateTime.UtcNow;

        // Deduct stock
        foreach (var line in order.Lines)
        {
            var item = await db.Items.FindAsync(line.ItemId);
            if (item != null)
            {
                var before = item.Stock;
                item.Stock = Math.Max(0, item.Stock - line.Qty);
                db.InventoryAdjustments.Add(new InventoryAdjustment
                {
                    ItemId = line.ItemId,
                    Reason = "sale",
                    QtyBefore = before,
                    QtyChange = -(line.Qty),
                    QtyAfter = item.Stock,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await db.SaveChangesAsync();
        return Ok(new { changeDue = order.ChangeDue });
    }

    [HttpPost("{id}/void")]
    public async Task<IActionResult> VoidOrder(int id)
    {
        var order = await db.Orders.FindAsync(id);
        if (order == null) return NotFound();
        order.Status = "void";
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id, o.OrderNumber, o.Staff?.Name ?? "",
        o.OrderType, o.TableNumber, o.Guests,
        o.Subtotal, o.TaxAmount, o.Discount, o.Total,
        o.Status, o.PaymentMethod, o.ChangeDue,
        o.CreatedAt,
        o.Lines.Select(l => new OrderLineDto(l.Id, l.ItemName, l.Qty, l.UnitPrice, l.LineTotal, l.Note,
            l.Modifiers.Select(m => m.ModifierName).ToList())).ToList());
}
