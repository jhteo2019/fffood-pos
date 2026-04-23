using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("categories")]
public class Category
{
    [Key, Column("id")]      public string Id { get; set; } = "";
    [Column("name")]         public string Name { get; set; } = "";
    [Column("sub")]          public string? Sub { get; set; }
    [Column("sort_order")]   public int SortOrder { get; set; }

    public ICollection<Item> Items { get; set; } = [];
    public ICollection<ModifierGroup> ModifierGroups { get; set; } = [];
}
