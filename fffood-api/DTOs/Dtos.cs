namespace FfoodApi.DTOs;

public record CategoryDto(string Id, string Name, string? Sub, int SortOrder);

public record ModifierOptionDto(string Id, string Name, decimal Price);
public record ModifierGroupDto(string Id, string Name, bool IsRequired, bool IsMulti, List<ModifierOptionDto> Options);

public record ItemDto(string Id, string Name, string CategoryId, string CategoryName,
    decimal Price, int Stock, List<string> Tags, bool IsActive,
    List<ModifierGroupDto> Modifiers);

public record StaffDto(string Id, string Name, string Role, string Initials, string Color);

public record LoginRequest(string StaffId, string Pin);
public record LoginResponse(string StaffId, string Name, string Role, string Initials, string Color, string Token);

public record CartLineDto(
    string LineId, string ItemId, string ItemName,
    List<CartModifierDto> Modifiers, int Qty, string? Note,
    decimal UnitPrice, decimal LineTotal);

public record CartModifierDto(string Id, string Name, decimal Price);

public record CreateOrderRequest(
    string? StaffId, string OrderType, int? TableNumber, int Guests,
    decimal TaxRate, decimal Discount, List<CartLineDto> Lines);

public record PayOrderRequest(string PaymentMethod, decimal? Tendered);

public record OrderDto(int Id, string OrderNumber, string StaffName,
    string OrderType, int? TableNumber, int Guests,
    decimal Subtotal, decimal TaxAmount, decimal Discount, decimal Total,
    string Status, string? PaymentMethod, decimal? ChangeDue,
    DateTime CreatedAt, List<OrderLineDto> Lines);

public record OrderLineDto(int Id, string ItemName, int Qty,
    decimal UnitPrice, decimal LineTotal, string? Note,
    List<string> Modifiers);

public record AdjustStockRequest(string Reason, int Qty, string? StaffId, string? Notes);

public record InventoryItemDto(string Id, string Name, string CategoryId, string CategoryName,
    decimal Price, int Stock, List<string> Tags);

public record UpdateItemRequest(string Name, decimal Price, bool IsActive, List<string>? Tags);
public record CreateItemRequest(string Name, string CategoryId, decimal Price, int Stock, List<string> Tags);
