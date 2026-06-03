using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Infrastructure.Providers;

public class ScoresService : IScoresService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ScoresService> _logger;
    private readonly IRawgService _rawgService;

    public ScoresService(
        HttpClient httpClient,
        IMemoryCache cache,
        ILogger<ScoresService> logger,
        IRawgService rawgService)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        _rawgService = rawgService;
    }

    public async Task<GameScores?> GetGameScoresAsync(int appId, string gameName, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"scores:{appId}";

        // Verificar cache primeiro (cache por 1 hora)
        if (_cache.TryGetValue(cacheKey, out GameScores? cachedScores))
        {
            _logger.LogInformation("🎯 [GetGameScoresAsync] Cache hit for app {AppId} - {GameName}: Meta={Meta}, OC={OC}, Steam={Steam}",
                appId, gameName, cachedScores?.Metacritic, cachedScores?.OpenCritic, cachedScores?.SteamPositivePct);
            return cachedScores;
        }

        _logger.LogInformation("🔍 [GetGameScoresAsync] Fetching scores for app {AppId} - {GameName}", appId, gameName);

        var scores = new GameScores();

        try
        {
            // 1. Buscar Metacritic via RAWG API
            var metacriticScore = await GetMetacriticScoreAsync(gameName, cancellationToken);
            scores.Metacritic = metacriticScore;

            // 2. Buscar OpenCritic Score
            var openCriticScore = await GetOpenCriticScoreAsync(gameName, cancellationToken);
            scores.OpenCritic = openCriticScore;

            // 3. Steam Score removido (Não temos mais a biblioteca Steam)
            scores.SteamPositivePct = null;

            // Cache por 1 hora
            _cache.Set(cacheKey, scores, TimeSpan.FromHours(1));

            _logger.LogInformation("✅ [GetGameScoresAsync] Fetched scores for {GameName}: Meta={Metacritic}, OC={OpenCritic}, Steam={Steam}",
                gameName, scores.Metacritic, scores.OpenCritic, scores.SteamPositivePct);

            return scores;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ [GetGameScoresAsync] Error fetching scores for app {AppId}", appId);
            return null;
        }
    }

    private async Task<int?> GetMetacriticScoreAsync(string gameName, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("📊 [GetMetacriticScoreAsync] Fetching Metacritic score for {GameName}", gameName);

            var rawgMeta = await _rawgService.GetGameMetaAsync(gameName, cancellationToken);
            if (rawgMeta?.Metacritic.HasValue == true)
            {
                _logger.LogInformation("📊 [GetMetacriticScoreAsync] Found Metacritic score: {Score} for {GameName}", rawgMeta.Metacritic, gameName);
                return rawgMeta.Metacritic;
            }

            _logger.LogInformation("📊 [GetMetacriticScoreAsync] No Metacritic score found for {GameName} (rawgMeta: {RawgMeta})", gameName, rawgMeta != null ? "found" : "null");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "📊 [GetMetacriticScoreAsync] Error fetching Metacritic score for {GameName}", gameName);
            return null;
        }
    }

    private Task<int?> GetOpenCriticScoreAsync(string gameName, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogDebug("⭐ [GetOpenCriticScoreAsync] Fetching OpenCritic score for {GameName}", gameName);

            // OpenCritic não tem API pública oficial, vamos usar uma abordagem alternativa
            // Por enquanto, vamos retornar null e implementar web scraping se necessário
            _logger.LogDebug("⭐ [GetOpenCriticScoreAsync] OpenCritic API not available, returning null");
            return Task.FromResult<int?>(null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⭐ [GetOpenCriticScoreAsync] Error fetching OpenCritic score for {GameName}", gameName);
            return Task.FromResult<int?>(null);
        }
    }

}
