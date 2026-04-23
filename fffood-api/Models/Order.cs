using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("orders")]
public class Order
{
    [Key, Column("id")]              public int Id { get; set; }
    [Column("order_number")]         public string OrderNumber { get; set; } = "";
    [Column("staff_id")]             public string? StaffId { get; set; }
    [Column("order_type")]           public string OrderType { get; set; } = "dine-in";
    [Column("table_number")]         public int? TableNumber { get; set; }
    [Column("guests")]               public int Guests { get; set; } = 1;
    [Column("subtotal")]             public decimal Subtotal { get; set; }
    [Column("tax_amount")]           public decimal TaxAmount { get; set; }
    [Column("discount")]             public decimal Discount { get; set; }
    [Column("total")]                public decimal Total { get; set; }
    [Column("status")]               public string Status { get; set; } = "open";
    [Column("payment_method")]       public string? PaymentMethod { get; set; }
    [Column("tendered")]             public decimal? Tendered { get; set; }
    [Column("change_due")]           public decimal? ChangeDue { get; set; }
    [Column("notes")]                public string? Notes { get; set; }
    [Column("created_at")]           public DateTime CreatedAt { get; set; }
    [Column("paid_at")]              public DateTime? PaidAt { get; set; }

    public Staff? Staff { get; set; }
    public ICollection<OrderLine> Lines { get; set; } = [];
}
