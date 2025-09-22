namespace NextPlay.Api.Api.DTOs;

public class RecommendationsResponse
{
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string SteamId64 { get; set; } = string.Empty;
    public List<RecommendationItem> Items { get; set; } = new();
    public int TotalCount { get; set; } = 0;
}

public class RecommendationItem
{
    public int AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? BackgroundImage { get; set; } // URL da imagem do jogo
    public string? HeaderImage { get; set; }
    public ScoresDto Scores { get; set; } = new();
    public HltbDto Hltb { get; set; } = new();
    public float ScoreTotal { get; set; }
    public int PlaytimeForever { get; set; }
    public DateTime? LastPlayed { get; set; }
    public List<string> Why { get; set; } = new();
    // Campos de conquistas
    public int? AchievementsTotal { get; set; }
    public int? AchievementsUnlocked { get; set; }
    // Gêneros
    public List<string> Genres { get; set; } = new();
}

public class ScoresDto
{
    public int? Metacritic { get; set; }
    public int? OpenCritic { get; set; }
    public int SteamPositivePct { get; set; }
}

public class HltbDto
{
    public float? MainHours { get; set; }
}
