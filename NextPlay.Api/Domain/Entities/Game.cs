using System.ComponentModel.DataAnnotations;

namespace NextPlay.Api.Domain.Entities;

public class Game
{
    [Key]
    public int AppId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Tags { get; set; } = string.Empty; // JSON array as string

    public string Genres { get; set; } = string.Empty; // JSON array as string

    public bool ControllerFriendly { get; set; }

    public string Languages { get; set; } = string.Empty; // JSON array as string

    public int? ReleaseYear { get; set; }

    public string? HeaderImage { get; set; }

    public string? ImgLogoUrl { get; set; }

    public string? ImgIconUrl { get; set; }

    // Campos de conquistas
    public int? AchievementsTotal { get; set; }
    public int? AchievementsUnlocked { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Ownership> Ownerships { get; set; } = new List<Ownership>();
    public virtual Scores? Scores { get; set; }
    public virtual Hltb? Hltb { get; set; }
    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
}



