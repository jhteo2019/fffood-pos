using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("items")]
public class Item
{
    [Key, Column("id")]          public string Id { get; set; } = "";
    [Column("name")]             public string Name { get; set; } = "";
    [Column("category_id")]      public string CategoryId { get; set; } = "";
    [Column("price")]            public decimal Price { get; set; }
    [Column("stock")]            public int Stock { get; set; }
    [Column("tags")]             public string? Tags { get; set; }
    [Column("is_active")]        public bool IsActive { get; set; } = true;
    [Column("created_at")]       public DateTime CreatedAt { get; set; }
    [Column("updated_at")]       public DateTime UpdatedAt { get; set; }

    public Category? Category { get; set; }
}
