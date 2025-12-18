using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs.Areas
{
    public class CreateAreaRequest
    {
        [Required]
        public string Name { get; set; } = null!;

        public string? Description { get; set; }

        [Required]
        public string PolygonGeoJson { get; set; } = null!;
    }
}
