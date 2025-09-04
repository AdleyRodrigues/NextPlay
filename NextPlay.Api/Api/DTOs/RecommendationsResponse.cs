namespace NextPlay.Api.Api.DTOs;

public class RecommendationsResponse
{
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string SteamId64 { get; set; } = string.Empty;
    public List<RecommendationItem> Items { get; set; } = new();
}

public class RecommendationItem
{
    public int AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? BackgroundImage { get; set; } // URL da imagem do jogo
    public ScoresDto Scores { get; set; } = new();
    public HltbDto Hltb { get; set; } = new();
    public float ScoreTotal { get; set; }
    public List<string> Why { get; set; } = new();
}

public class ScoresDto
{
    public int? Metacritic { get; set; }
    public int? OpenCritic { get; set; }
    public int SteamPosPct { get; set; }
}

public class HltbDto
{
    public float? MainHours { get; set; }
}
