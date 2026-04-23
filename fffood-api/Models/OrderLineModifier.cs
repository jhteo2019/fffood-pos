using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("order_line_modifiers")]
public class OrderLineModifier
{
    [Key, Column("id")]              public int Id { get; set; }
    [Column("order_line_id")]        public int OrderLineId { get; set; }
    [Column("modifier_name")]        public string ModifierName { get; set; } = "";
    [Column("price")]                public decimal Price { get; set; }

    public OrderLine? OrderLine { get; set; }
}
