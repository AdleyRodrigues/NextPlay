using System.ComponentModel.DataAnnotations;

namespace NextPlay.Api.Domain.Entities;

public class Scores
{
    [Key]
    public int AppId { get; set; }

    public int? Metacritic { get; set; }

    public int? OpenCritic { get; set; }

    public int? SteamPositivePct { get; set; } // Percentage of positive Steam reviews

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Game Game { get; set; } = null!;
}
