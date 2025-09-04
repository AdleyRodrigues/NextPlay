using System.ComponentModel.DataAnnotations;

namespace NextPlay.Api.Domain.Entities;

public class UserPrefs
{
    [Key]
    public string SteamId64 { get; set; } = string.Empty;

    public string LikedTags { get; set; } = string.Empty; // JSON array as string

    public string BlockedTags { get; set; } = string.Empty; // JSON array as string

    public string LikedGenres { get; set; } = string.Empty; // JSON array as string

    public bool PtbrOnly { get; set; }

    public bool ControllerPreferred { get; set; }

    public int MinMainH { get; set; } = 1;

    public int MaxMainH { get; set; } = 100;

    // Quality thresholds
    public int? MetacriticMin { get; set; }

    public int? OpenCriticMin { get; set; }

    public int? SteamPositiveMin { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}



