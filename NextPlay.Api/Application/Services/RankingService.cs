using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Domain.Entities;
using NextPlay.Api.Infrastructure.Ef;
using NextPlay.Api.Infrastructure.Providers;

namespace NextPlay.Api.Application.Services;

public class RankingService
{
    private readonly NextPlayDbContext _context;
    private readonly RawgService _rawgService;
    private readonly SteamStoreService _steamStoreService;
    private readonly SteamApiService _steamApiService;
    private readonly ILogger<RankingService> _logger;

    public RankingService(
        NextPlayDbContext context,
        RawgService rawgService,
        SteamStoreService steamStoreService,
        SteamApiService steamApiService,
        ILogger<RankingService> logger)
    {
        _context = context;
        _rawgService = rawgService;
        _steamStoreService = steamStoreService;
        _steamApiService = steamApiService;
        _logger = logger;
    }

    public async Task<RankingResponse> GetTopGamesAsync(RankingRequest request)
    {
        _logger.LogInformation("🎯 Starting ranking algorithm for SteamId64: {SteamId64}, Mode: {Mode}",
            request.SteamId64, request.Mode);

        try
        {
            // 1. Obter biblioteca Steam do usuário (mock por enquanto)
            var steamLibrary = await GetSteamLibraryAsync(request.SteamId64);

            if (!steamLibrary.Any())
            {
                _logger.LogWarning("No games found in Steam library for user {SteamId64}", request.SteamId64);
                return new RankingResponse
                {
                    SteamId64 = request.SteamId64,
                    Mode = request.Mode,
                    TotalGamesAnalyzed = 0
                };
            }

            _logger.LogInformation("Found {Count} games in Steam library", steamLibrary.Count);

            // 2. Enriquecer dados com qualidade externa
            var enrichedGames = await EnrichGamesWithQualityAsync(steamLibrary);

            // 3. Aplicar algoritmo de ranqueamento
            var rankedGames = ApplyRankingAlgorithm(enrichedGames, request.Mode);

            // 4. Aplicar diversidade e tie-breakers
            var finalRanking = ApplyDiversityAndTieBreakers(rankedGames, request.Limit);

            // 5. Gerar explicações
            var itemsWithExplanations = GenerateExplanations(finalRanking, request.Mode);

            _logger.LogInformation("Ranking completed. Top game: {TopGame} (Score: {Score})",
                itemsWithExplanations.FirstOrDefault()?.Name,
                itemsWithExplanations.FirstOrDefault()?.FinalScore);

            return new RankingResponse
            {
                SteamId64 = request.SteamId64,
                Mode = request.Mode,
                Items = itemsWithExplanations,
                TotalGamesAnalyzed = steamLibrary.Count,
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ranking algorithm for user {SteamId64}", request.SteamId64);
            throw;
        }
    }

    private async Task<List<SteamGameData>> GetSteamLibraryAsync(string steamId64)
    {
        try
        {
            // Tentar obter dados reais da Steam API
            var steamLibrary = await _steamApiService.GetUserLibraryAsync(steamId64);

            if (steamLibrary?.Games != null && steamLibrary.Games.Any())
            {
                var steamGames = new List<SteamGameData>();

                foreach (var game in steamLibrary.Games)
                {
                    var achievementPercentage = await GetAchievementPercentageAsync(steamId64, game.AppId);

                    steamGames.Add(new SteamGameData
                    {
                        AppId = game.AppId,
                        Name = game.Name,
                        PlaytimeMinutes = game.PlaytimeForever,
                        LastPlayed = game.LastPlayed,
                        AchievementPercentage = achievementPercentage
                    });
                }

                _logger.LogInformation("Successfully fetched {Count} games from Steam API", steamGames.Count);
                return steamGames;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch Steam library, falling back to mock data");
        }

        // Fallback para dados mock se a API falhar
        _logger.LogInformation("Using mock data for Steam library");
        return new List<SteamGameData>
        {
            new() { AppId = 730, Name = "Counter-Strike 2", PlaytimeMinutes = 1200, LastPlayed = DateTime.UtcNow.AddDays(-2), AchievementPercentage = 45f },
            new() { AppId = 1172470, Name = "Apex Legends", PlaytimeMinutes = 800, LastPlayed = DateTime.UtcNow.AddDays(-7), AchievementPercentage = 30f },
            new() { AppId = 1091500, Name = "Cyberpunk 2077", PlaytimeMinutes = 60, LastPlayed = DateTime.UtcNow.AddDays(-30), AchievementPercentage = 15f },
            new() { AppId = 1244460, Name = "Plague Tale: Requiem", PlaytimeMinutes = 300, LastPlayed = DateTime.UtcNow.AddDays(-5), AchievementPercentage = 85f },
            new() { AppId = 1174180, Name = "Red Dead Redemption 2", PlaytimeMinutes = 0, LastPlayed = null, AchievementPercentage = 0f },
            new() { AppId = 1240440, Name = "Hogwarts Legacy", PlaytimeMinutes = 450, LastPlayed = DateTime.UtcNow.AddDays(-10), AchievementPercentage = 70f },
            new() { AppId = 1097150, Name = "It Takes Two", PlaytimeMinutes = 180, LastPlayed = DateTime.UtcNow.AddDays(-1), AchievementPercentage = 95f },
            new() { AppId = 1172620, Name = "Sea of Stars", PlaytimeMinutes = 90, LastPlayed = DateTime.UtcNow.AddDays(-3), AchievementPercentage = 25f }
        };
    }

    private async Task<float> GetAchievementPercentageAsync(string steamId64, int appId)
    {
        try
        {
            var achievements = await _steamApiService.GetPlayerAchievementsAsync(steamId64, appId);

            if (achievements?.PlayerStats?.Achievements != null && achievements.PlayerStats.Achievements.Any())
            {
                var totalAchievements = achievements.PlayerStats.Achievements.Count;
                var unlockedAchievements = achievements.PlayerStats.Achievements.Count(a => a.Achieved == 1);

                return totalAchievements > 0 ? (float)unlockedAchievements / totalAchievements * 100f : 0f;
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Could not fetch achievements for app {AppId}", appId);
        }

        return 0f; // Retorna 0% se não conseguir obter dados de conquistas
    }

    private async Task<List<EnrichedGameData>> EnrichGamesWithQualityAsync(List<SteamGameData> steamGames)
    {
        var enrichedGames = new List<EnrichedGameData>();

        foreach (var game in steamGames)
        {
            var enriched = new EnrichedGameData
            {
                SteamData = game,
                Quality = new QualityScores()
            };

            // Buscar dados de qualidade no banco local primeiro
            var existingGame = await _context.Games
                .Include(g => g.Scores)
                .FirstOrDefaultAsync(g => g.AppId == game.AppId);

            if (existingGame?.Scores != null)
            {
                enriched.Quality.Metacritic = existingGame.Scores.Metacritic;
                enriched.Quality.OpenCritic = existingGame.Scores.OpenCritic;
                enriched.Quality.SteamPositive = existingGame.Scores.SteamPositive;
                enriched.Quality.SteamNegative = existingGame.Scores.SteamNegative;
            }
            else
            {
                // Enriquecer com RAWG API se não existir no banco
                try
                {
                    var rawgData = await _rawgService.GetGameDetailsAsync(game.AppId.ToString());
                    if (rawgData != null)
                    {
                        enriched.Quality.Metacritic = rawgData.Metacritic;
                        // TODO: Implementar OpenCritic integration
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to enrich game {AppId} with RAWG data", game.AppId);
                }
            }

            // Calcular Wilson Score para Steam
            enriched.Quality.SteamWilson = CalculateWilsonScore(
                enriched.Quality.SteamPositive,
                enriched.Quality.SteamNegative);

            // Calcular qualidade combinada
            enriched.Quality.Combined = CalculateCombinedQuality(enriched.Quality);

            enrichedGames.Add(enriched);
        }

        return enrichedGames;
    }

    private float CalculateWilsonScore(int positive, int negative)
    {
        if (positive + negative == 0) return 0.5f; // Neutro se não há reviews

        var n = positive + negative;
        var p = (double)positive / n;
        var z = 1.96; // 95% confidence interval

        var lowerBound = (p + z * z / (2 * n) - z * Math.Sqrt((p * (1 - p) + z * z / (4 * n)) / n)) / (1 + z * z / n);
        return Math.Max(0, Math.Min(1, (float)lowerBound));
    }

    private float CalculateCombinedQuality(QualityScores quality)
    {
        var weights = CalculateQualityWeights(quality);

        var combined = 0f;
        var totalWeight = 0f;

        // Steam Wilson Score
        if (weights.Steam > 0)
        {
            combined += weights.Steam * quality.SteamWilson;
            totalWeight += weights.Steam;
        }

        // Metacritic
        if (quality.Metacritic.HasValue && weights.Metacritic > 0)
        {
            var normalizedMc = NormalizeRating(quality.Metacritic.Value, 60, 90);
            combined += weights.Metacritic * normalizedMc;
            totalWeight += weights.Metacritic;
        }

        // OpenCritic
        if (quality.OpenCritic.HasValue && weights.OpenCritic > 0)
        {
            var normalizedOc = NormalizeRating(quality.OpenCritic.Value, 60, 90);
            combined += weights.OpenCritic * normalizedOc;
            totalWeight += weights.OpenCritic;
        }

        return totalWeight > 0 ? combined / totalWeight : 0.5f;
    }

    private (float Steam, float Metacritic, float OpenCritic) CalculateQualityWeights(QualityScores quality)
    {
        var totalReviews = quality.SteamPositive + quality.SteamNegative;

        // Ajustar peso do Steam baseado no volume de reviews
        var steamWeight = totalReviews switch
        {
            < 25 => 0.20f,  // Baixa confiança
            >= 500 => 0.50f, // Alta confiança
            _ => 0.40f       // Peso padrão
        };

        var metacriticWeight = quality.Metacritic.HasValue ? 0.35f : 0f;
        var openCriticWeight = quality.OpenCritic.HasValue ? 0.25f : 0f;

        // Renormalizar se alguma fonte estiver ausente
        var totalWeight = steamWeight + metacriticWeight + openCriticWeight;
        if (totalWeight > 0)
        {
            return (steamWeight / totalWeight, metacriticWeight / totalWeight, openCriticWeight / totalWeight);
        }

        return (1f, 0f, 0f); // Fallback para apenas Steam
    }

    private float NormalizeRating(int rating, int min, int max)
    {
        return Math.Max(0, Math.Min(1, (float)(rating - min) / (max - min)));
    }

    private List<RankingItem> ApplyRankingAlgorithm(List<EnrichedGameData> games, RankingMode mode)
    {
        var rankedItems = new List<RankingItem>();

        foreach (var game in games)
        {
            var usageSignals = CalculateUsageSignals(game.SteamData);
            var finalScore = CalculateModeScore(game.Quality.Combined, usageSignals, mode);

            rankedItems.Add(new RankingItem
            {
                AppId = game.SteamData.AppId,
                Name = game.SteamData.Name,
                FinalScore = finalScore,
                Quality = game.Quality,
                Usage = usageSignals
            });
        }

        return rankedItems.OrderByDescending(item => item.FinalScore).ToList();
    }

    private UsageSignals CalculateUsageSignals(SteamGameData steamData)
    {
        var signals = new UsageSignals
        {
            PlaytimeMinutes = steamData.PlaytimeMinutes,
            LastPlayed = steamData.LastPlayed,
            AchievementPercentage = steamData.AchievementPercentage
        };

        // Novelty (quer começar algo novo)
        signals.Novelty = steamData.PlaytimeMinutes switch
        {
            0 => 1.0f,
            <= 120 => 0.8f,
            <= 600 => 0.5f,
            _ => 0.2f
        };

        // Recency (retomar o parado)
        if (steamData.LastPlayed.HasValue)
        {
            var daysSinceLastPlay = (DateTime.UtcNow - steamData.LastPlayed.Value).TotalDays;
            signals.Recency = daysSinceLastPlay switch
            {
                <= 7 => 0.0f,
                <= 30 => 0.5f,
                _ => 1.0f
            };
        }
        else
        {
            signals.Recency = 1.0f; // Nunca jogado
        }

        // Progress (conquistas)
        signals.Progress = steamData.AchievementPercentage / 100f;

        // Kernels gaussianos
        signals.NearFinish = GaussianKernel(signals.Progress, 0.90f, 0.10f);
        signals.MidProgress = GaussianKernel(signals.Progress, 0.45f, 0.15f);

        return signals;
    }

    private float GaussianKernel(float value, float target, float sigma)
    {
        var exponent = -Math.Pow(value - target, 2) / (2 * Math.Pow(sigma, 2));
        return (float)Math.Exp(exponent);
    }

    private float CalculateModeScore(float qualityBase, UsageSignals usage, RankingMode mode)
    {
        return mode switch
        {
            RankingMode.Jogar => 0.55f * qualityBase + 0.30f * usage.Novelty + 0.15f * usage.Recency,
            RankingMode.Terminar => 0.55f * qualityBase + 0.30f * usage.MidProgress + 0.15f * usage.Recency,
            RankingMode.Zerar => 0.55f * qualityBase + 0.30f * usage.NearFinish + 0.15f * usage.Recency,
            RankingMode.Platinar => 0.50f * qualityBase + 0.40f * usage.NearFinish + 0.10f * (1 - usage.Recency),
            _ => 0.5f
        };
    }

    private List<RankingItem> ApplyDiversityAndTieBreakers(List<RankingItem> items, int limit)
    {
        // TODO: Implementar diversidade por gênero quando disponível
        // Por enquanto, apenas aplicar tie-breakers

        var finalItems = items
            .OrderByDescending(item => item.FinalScore)
            .ThenByDescending(item => item.Quality.Combined)
            .ThenByDescending(item => item.Usage.Recency)
            .ThenBy(item => item.Usage.PlaytimeMinutes) // Menor playtime para jogar, maior para outros modos
            .Take(limit)
            .ToList();

        // Atribuir ranks
        for (int i = 0; i < finalItems.Count; i++)
        {
            finalItems[i].Rank = i + 1;
        }

        return finalItems;
    }

    private List<RankingItem> GenerateExplanations(List<RankingItem> items, RankingMode mode)
    {
        foreach (var item in items)
        {
            item.Why = GenerateWhyReasons(item, mode);
        }
        return items;
    }

    private List<string> GenerateWhyReasons(RankingItem item, RankingMode mode)
    {
        var reasons = new List<string>();

        // Qualidade
        if (item.Quality.Combined > 0.7f)
        {
            var qualityParts = new List<string>();

            if (item.Quality.Metacritic.HasValue)
                qualityParts.Add($"Metacritic {item.Quality.Metacritic.Value}%");

            if (item.Quality.OpenCritic.HasValue)
                qualityParts.Add($"OpenCritic {item.Quality.OpenCritic.Value}%");

            if (item.Quality.SteamPositive + item.Quality.SteamNegative > 0)
            {
                var steamPct = (float)item.Quality.SteamPositive / (item.Quality.SteamPositive + item.Quality.SteamNegative) * 100;
                qualityParts.Add($"Steam {steamPct:F0}%");
            }

            if (qualityParts.Any())
            {
                reasons.Add($"Bem avaliado: {string.Join(" / ", qualityParts)}");
            }
        }

        // Uso/Retomada
        if (item.Usage.PlaytimeMinutes == 0)
        {
            reasons.Add("Você ainda não jogou - perfeito para começar!");
        }
        else if (item.Usage.PlaytimeMinutes < 120)
        {
            reasons.Add($"Você jogou pouco ({item.Usage.PlaytimeMinutes / 60f:F1}h) - bom para retomar");
        }
        else if (item.Usage.LastPlayed.HasValue)
        {
            var daysSince = (DateTime.UtcNow - item.Usage.LastPlayed.Value).TotalDays;
            if (daysSince > 30)
            {
                reasons.Add($"Não joga há {daysSince:F0} dias - hora de voltar!");
            }
        }

        // Progresso
        if (item.Usage.AchievementPercentage > 80f)
        {
            reasons.Add($"Quase terminado ({item.Usage.AchievementPercentage:F0}%) - fácil de finalizar");
        }
        else if (item.Usage.AchievementPercentage > 40f && item.Usage.AchievementPercentage < 70f)
        {
            reasons.Add($"No meio do caminho ({item.Usage.AchievementPercentage:F0}%) - bom para continuar");
        }

        // Aderência ao modo
        var modeText = mode switch
        {
            RankingMode.Jogar => "começar algo novo",
            RankingMode.Terminar => "continuar jogos em andamento",
            RankingMode.Zerar => "finalizar campanhas",
            RankingMode.Platinar => "platinar jogos",
            _ => "jogar"
        };
        reasons.Add($"Combina com seu objetivo de {modeText} hoje");

        return reasons.Take(4).ToList();
    }
}

// Classes auxiliares para dados internos
internal class SteamGameData
{
    public int AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PlaytimeMinutes { get; set; }
    public DateTime? LastPlayed { get; set; }
    public float AchievementPercentage { get; set; }
}

internal class EnrichedGameData
{
    public SteamGameData SteamData { get; set; } = new();
    public QualityScores Quality { get; set; } = new();
}
