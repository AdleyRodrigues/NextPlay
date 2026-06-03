using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Infrastructure.Providers;

public interface IScoresService
{
    Task<GameScores?> GetGameScoresAsync(int appId, string gameName, CancellationToken cancellationToken = default);
}

public class GameScores
{
    public int? Metacritic { get; set; }
    public int? OpenCritic { get; set; }
    public int? SteamPositivePct { get; set; }
    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
}
