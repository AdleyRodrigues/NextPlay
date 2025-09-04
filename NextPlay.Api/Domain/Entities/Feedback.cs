using System.ComponentModel.DataAnnotations;

namespace NextPlay.Api.Domain.Entities;

public class Feedback
{
    [Key]
    public int Id { get; set; }

    public string SteamId64 { get; set; } = string.Empty;

    public int AppId { get; set; }

    public FeedbackAction Action { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Game Game { get; set; } = null!;
}

public enum FeedbackAction
{
    Like = 1,
    Dislike = 2,
    Snooze = 3
}



