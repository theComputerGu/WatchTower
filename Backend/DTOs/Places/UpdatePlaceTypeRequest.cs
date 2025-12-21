using Backend.Models.Enums;
using System.ComponentModel.DataAnnotations;

public class UpdatePlaceTypeRequest
{
    [Required]
    public PlaceType Type { get; set; }
}
