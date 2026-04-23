using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("modifier_groups")]
public class ModifierGroup
{
    [Key, Column("id")]          public string Id { get; set; } = "";
    [Column("category_id")]      public string CategoryId { get; set; } = "";
    [Column("name")]             public string Name { get; set; } = "";
    [Column("is_required")]      public bool IsRequired { get; set; }
    [Column("is_multi")]         public bool IsMulti { get; set; }
    [Column("sort_order")]       public int SortOrder { get; set; }

    public Category? Category { get; set; }
    public ICollection<ModifierOption> Options { get; set; } = [];
}
