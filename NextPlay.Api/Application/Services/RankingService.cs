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
            // Buscar jogos da biblioteca Steam do usuário
            var userGames = await _context.Ownerships
                .Include(o => o.Game)
                .ThenInclude(g => g.Scores)
                .Include(o => o.Game)
                .ThenInclude(g => g.Hltb)
                .Where(o => o.SteamId64 == request.SteamId64)
                .ToListAsync();

            if (!userGames.Any())
            {
                _logger.LogWarning("No games found in user library for SteamId64: {SteamId64}", request.SteamId64);
                return new RankingResponse
                {
                    SteamId64 = request.SteamId64,
                    Mode = request.Mode,
                    Items = new List<RankingItem>(),
                    TotalGamesAnalyzed = 0,
                    GeneratedAt = DateTime.UtcNow
                };
            }

            _logger.LogInformation("Found {Count} games in user library", userGames.Count);

            // Gerar ranking para cada jogo
            var rankingItems = new List<RankingItem>();
            var rank = 1;

            foreach (var ownership in userGames.Where(og => og.Game != null).Take(request.Limit))
            {
                var game = ownership.Game!;
                var rankingItem = await CreateRankingItemAsync(game, ownership, request.Mode.ToString(), rank);
                if (rankingItem != null)
                {
                    rankingItems.Add(rankingItem);
                    rank++;
                }
            }

            // Ordenar por score final (maior primeiro)
            rankingItems = rankingItems
                .OrderByDescending(r => r.FinalScore)
                .ToList();

            // Atualizar ranks
            for (int i = 0; i < rankingItems.Count; i++)
            {
                rankingItems[i].Rank = i + 1;
            }

            _logger.LogInformation("Generated {Count} ranking items", rankingItems.Count);

            return new RankingResponse
            {
                SteamId64 = request.SteamId64,
                Mode = request.Mode,
                Items = rankingItems,
                TotalGamesAnalyzed = userGames.Count,
                GeneratedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ranking algorithm for user {SteamId64}", request.SteamId64);
            throw;
        }
    }

    private async Task<RankingItem?> CreateRankingItemAsync(Game game, Ownership ownership, string mode, int rank)
    {
        try
        {
            // Calcular scores de qualidade
            var qualityScores = CalculateQualityScores(game);

            // Calcular sinais de uso
            var usageSignals = CalculateUsageSignals(ownership, mode);

            // Calcular score final
            var finalScore = CalculateFinalScore(qualityScores, usageSignals, mode);

            // Gerar razões
            var reasons = GenerateRankingReasons(game, ownership, qualityScores, usageSignals, mode);

            return new RankingItem
            {
                AppId = game.AppId,
                Name = game.Name,
                FinalScore = finalScore,
                Quality = qualityScores,
                Usage = usageSignals,
                Why = reasons,
                Rank = rank
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error creating ranking item for game {AppId}", game.AppId);
            return null;
        }
    }

    private QualityScores CalculateQualityScores(Game game)
    {
        var scores = game.Scores;

        return new QualityScores
        {
            SteamWilson = scores?.SteamPositivePct / 100f ?? 0.75f,
            Metacritic = scores?.Metacritic ?? 75f,
            OpenCritic = scores?.OpenCritic ?? 75f,
            Combined = CalculateCombinedQualityScore(scores),
            SteamPositive = 1000, // Placeholder - seria buscado da Steam API
            SteamNegative = 200   // Placeholder - seria buscado da Steam API
        };
    }

    private float CalculateCombinedQualityScore(Scores? scores)
    {
        if (scores == null) return 0.75f;

        var total = 0f;
        var count = 0f;

        if (scores.Metacritic.HasValue)
        {
            total += scores.Metacritic.Value / 100f;
            count++;
        }

        if (scores.OpenCritic.HasValue)
        {
            total += scores.OpenCritic.Value / 100f;
            count++;
        }

        if (scores.SteamPositivePct.HasValue)
        {
            total += scores.SteamPositivePct.Value / 100f;
            count++;
        }

        return count > 0 ? total / count : 0.75f;
    }

    private UsageSignals CalculateUsageSignals(Ownership ownership, string mode)
    {
        var playtimeHours = ownership.PlaytimeForever / 60f;
        var daysSinceLastPlayed = ownership.LastPlayed.HasValue
            ? (DateTime.UtcNow - ownership.LastPlayed.Value).Days
            : 365;

        return new UsageSignals
        {
            Novelty = CalculateNovelty(playtimeHours, mode),
            Recency = CalculateRecency(daysSinceLastPlayed),
            Progress = 0.5f, // Placeholder - seria calculado baseado em conquistas
            NearFinish = CalculateNearFinish(playtimeHours, ownership.Game.Hltb?.MainHours, mode),
            MidProgress = CalculateMidProgress(playtimeHours, ownership.Game.Hltb?.MainHours),
            PlaytimeMinutes = ownership.PlaytimeForever,
            LastPlayed = ownership.LastPlayed ?? DateTime.UtcNow.AddDays(-30),
            AchievementPercentage = 50f // Placeholder - seria calculado baseado em conquistas
        };
    }

    private float CalculateNovelty(float playtimeHours, string mode)
    {
        // Jogos com pouco tempo jogado têm maior novidade
        return mode == "jogar" ? Math.Max(0, 1f - (playtimeHours / 10f)) : 0.3f;
    }

    private float CalculateRecency(int daysSinceLastPlayed)
    {
        // Jogos jogados recentemente têm maior recência
        return Math.Max(0, 1f - (daysSinceLastPlayed / 365f));
    }

    private float CalculateNearFinish(float playtimeHours, float? mainHours, string mode)
    {
        if (!mainHours.HasValue || mode != "terminar") return 0f;

        var progress = playtimeHours / mainHours.Value;
        return progress > 0.7f ? progress : 0f;
    }

    private float CalculateMidProgress(float playtimeHours, float? mainHours)
    {
        if (!mainHours.HasValue) return 0.5f;

        var progress = playtimeHours / mainHours.Value;
        return progress > 0.2f && progress < 0.8f ? 1f : 0.5f;
    }

    private float CalculateFinalScore(QualityScores quality, UsageSignals usage, string mode)
    {
        var score = 0f;

        // Score de qualidade (40%)
        score += quality.Combined * 0.4f;

        // Score baseado no modo
        switch (mode)
        {
            case "jogar":
                score += usage.Novelty * 0.3f + usage.Recency * 0.3f;
                break;
            case "terminar":
                score += usage.NearFinish * 0.4f + usage.MidProgress * 0.2f;
                break;
            case "zerar":
                score += usage.Progress * 0.4f + usage.MidProgress * 0.2f;
                break;
            case "platinar":
                score += usage.Progress * 0.3f + (1f - usage.AchievementPercentage / 100f) * 0.3f;
                break;
            default:
                score += usage.Recency * 0.3f + usage.Progress * 0.3f;
                break;
        }

        return Math.Min(score, 1f);
    }

    private List<string> GenerateRankingReasons(Game game, Ownership ownership, QualityScores quality, UsageSignals usage, string mode)
    {
        var reasons = new List<string>();

        // Razões baseadas em qualidade
        if (quality.Metacritic >= 85)
            reasons.Add($"Aclamado pela crítica: Metacritic {quality.Metacritic}%");
        else if (quality.Metacritic >= 75)
            reasons.Add($"Bem avaliado: Metacritic {quality.Metacritic}%");

        if (quality.SteamWilson >= 0.9f)
            reasons.Add("Excelente avaliação no Steam");
        else if (quality.SteamWilson >= 0.8f)
            reasons.Add("Muito bem avaliado pelos jogadores");

        // Razões baseadas no modo
        var playtimeHours = ownership.PlaytimeForever / 60f;
        switch (mode)
        {
            case "jogar":
                if (playtimeHours < 2)
                    reasons.Add("Perfeito para começar algo novo hoje");
                else if (playtimeHours < 10)
                    reasons.Add("Bom para retomar e continuar");
                break;
            case "terminar":
                if (usage.NearFinish > 0.7f)
                    reasons.Add("Quase terminando - finalize hoje!");
                else if (usage.MidProgress > 0.8f)
                    reasons.Add("No meio da jornada - continue a aventura");
                break;
            case "zerar":
                if (usage.Progress > 0.8f)
                    reasons.Add("Próximo do final - termine a história");
                break;
            case "platinar":
                if (usage.AchievementPercentage < 50)
                    reasons.Add("Muitas conquistas para desbloquear");
                break;
        }

        // Razões baseadas em recência
        if (usage.Recency > 0.8f)
            reasons.Add("Jogado recentemente - mantenha o ritmo");
        else if (usage.Recency < 0.3f)
            reasons.Add("Há tempo que não joga - bom para retomar");

        return reasons;
    }
}
