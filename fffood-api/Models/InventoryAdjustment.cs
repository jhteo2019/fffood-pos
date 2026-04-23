using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("inventory_adjustments")]
public class InventoryAdjustment
{
    [Key, Column("id")]          public int Id { get; set; }
    [Column("item_id")]          public string ItemId { get; set; } = "";
    [Column("staff_id")]         public string? StaffId { get; set; }
    [Column("reason")]           public string Reason { get; set; } = "";
    [Column("qty_before")]       public int QtyBefore { get; set; }
    [Column("qty_change")]       public int QtyChange { get; set; }
    [Column("qty_after")]        public int QtyAfter { get; set; }
    [Column("notes")]            public string? Notes { get; set; }
    [Column("created_at")]       public DateTime CreatedAt { get; set; }

    public Item? Item { get; set; }
    public Staff? Staff { get; set; }
}
