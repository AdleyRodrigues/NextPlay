namespace NextPlay.Api.Api.DTOs;

public class RankingResponse
{
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string SteamId64 { get; set; } = string.Empty;
    public RankingMode Mode { get; set; }
    public List<RankingItem> Items { get; set; } = new();
    public int TotalGamesAnalyzed { get; set; }
}

public class RankingItem
{
    public int AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? HeaderImage { get; set; }
    public float FinalScore { get; set; }
    public QualityScores Quality { get; set; } = new();
    public UsageSignals Usage { get; set; } = new();
    public List<string> Why { get; set; } = new();
    public int Rank { get; set; }
}

public class QualityScores
{
    public float SteamWilson { get; set; }
    public float? Metacritic { get; set; }
    public float? OpenCritic { get; set; }
    public float Combined { get; set; }
    public int SteamPositive { get; set; }
    public int SteamNegative { get; set; }
}

public class UsageSignals
{
    public float Novelty { get; set; }        // 0-1: quer começar algo novo
    public float Recency { get; set; }        // 0-1: retomar o parado
    public float Progress { get; set; }       // 0-1: progresso nas conquistas
    public float NearFinish { get; set; }     // 0-1: kernel gaussiano para 90%
    public float MidProgress { get; set; }    // 0-1: kernel gaussiano para 45%
    public int PlaytimeMinutes { get; set; }
    public DateTime? LastPlayed { get; set; }
    public float AchievementPercentage { get; set; }
}
