using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("order_lines")]
public class OrderLine
{
    [Key, Column("id")]          public int Id { get; set; }
    [Column("order_id")]         public int OrderId { get; set; }
    [Column("item_id")]          public string ItemId { get; set; } = "";
    [Column("item_name")]        public string ItemName { get; set; } = "";
    [Column("qty")]              public int Qty { get; set; }
    [Column("unit_price")]       public decimal UnitPrice { get; set; }
    [Column("line_total")]       public decimal LineTotal { get; set; }
    [Column("note")]             public string? Note { get; set; }

    public Order? Order { get; set; }
    public ICollection<OrderLineModifier> Modifiers { get; set; } = [];
}
