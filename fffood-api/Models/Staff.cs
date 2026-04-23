using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FfoodApi.Models;

[Table("staff")]
public class Staff
{
    [Key, Column("id")]      public string Id { get; set; } = "";
    [Column("name")]         public string Name { get; set; } = "";
    [Column("role")]         public string Role { get; set; } = "";
    [Column("initials")]     public string Initials { get; set; } = "";
    [Column("pin")]          public string Pin { get; set; } = "";
    [Column("color")]        public string Color { get; set; } = "#c4553c";
    [Column("is_active")]    public bool IsActive { get; set; } = true;
    [Column("created_at")]   public DateTime CreatedAt { get; set; }
}
