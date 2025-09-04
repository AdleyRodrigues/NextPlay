using System.ComponentModel.DataAnnotations;

namespace NextPlay.Api.Domain.Entities;

public class Hltb
{
    [Key]
    public int AppId { get; set; }

    public int? MainMin { get; set; }

    public int? MainExtraMin { get; set; }

    public int? CompletionistMin { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Game Game { get; set; } = null!;

    // Calculated properties
    public float? MainHours => MainMin.HasValue ? MainMin.Value / 60f : null;
    public float? MainExtraHours => MainExtraMin.HasValue ? MainExtraMin.Value / 60f : null;
    public float? CompletionistHours => CompletionistMin.HasValue ? CompletionistMin.Value / 60f : null;
}



