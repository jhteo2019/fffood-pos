using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("modifier_options")]
public class ModifierOption
{
    [Key, Column("id")]      public string Id { get; set; } = "";
    [Column("group_id")]     public string GroupId { get; set; } = "";
    [Column("name")]         public string Name { get; set; } = "";
    [Column("price")]        public decimal Price { get; set; }
    [Column("sort_order")]   public int SortOrder { get; set; }

    public ModifierGroup? Group { get; set; }
}
