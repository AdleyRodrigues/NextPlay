using System.ComponentModel.DataAnnotations;

namespace NextPlay.Api.Domain.Entities;

public class Ownership
{
    [Key]
    public int Id { get; set; }

    public string SteamId64 { get; set; } = string.Empty;

    public int AppId { get; set; }

    public int PlaytimeMin { get; set; }

    public int PlaytimeForever { get; set; }

    public int Playtime2Weeks { get; set; }

    public DateTime? LastPlayed { get; set; }

    public float? AchievementPct { get; set; }

    public bool HasCommunityVisibleStats { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Game Game { get; set; } = null!;
}



