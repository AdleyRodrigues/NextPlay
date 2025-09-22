using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Infrastructure.Ef;
using NextPlay.Api.Infrastructure.Providers;
using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Domain.Entities;

namespace NextPlay.Api.Application.Services;

public class RecommendationService
{
    private readonly NextPlayDbContext _context;
    private readonly RawgService _rawgService;
    private readonly SteamStoreService _steamStoreService;
    private readonly HltbService _hltbService;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(NextPlayDbContext context, RawgService rawgService, SteamStoreService steamStoreService, HltbService hltbService, ILogger<RecommendationService> logger)
    {
        _context = context;
        _rawgService = rawgService;
        _steamStoreService = steamStoreService;
        _hltbService = hltbService;
        _logger = logger;
    }

    public async Task<RecommendationsResponse> GetRecommendationsAsync(RecommendRequest request)
    {
        var recommendations = new List<RecommendationItem>();

        _logger.LogInformation("🚀 Starting recommendation process for SteamId64: {SteamId64} with {VibeCount} vibes",
            request.SteamId64, request.Vibe?.Length ?? 0);

        try
        {
            // Converter Steam ID para Steam ID64 se necessário
            var steamId64 = SteamIdConverter.ConvertToSteamId64(request.SteamId64);
            if (steamId64 == null)
            {
                _logger.LogWarning("Invalid Steam ID format: {SteamId}", request.SteamId64);
                return new RecommendationsResponse
                {
                    Items = new List<RecommendationItem>(),
                    GeneratedAt = DateTime.UtcNow,
                    TotalCount = 0
                };
            }

            // Buscar jogos da biblioteca Steam do usuário
            _logger.LogInformation("🔍 [GetRecommendationsAsync] Searching for games in database for SteamId64: {SteamId64}", steamId64);

            var userGames = await _context.Ownerships
                .Include(o => o.Game)
                .ThenInclude(g => g.Scores)
                .Include(o => o.Game)
                .ThenInclude(g => g.Hltb)
                .Where(o => o.SteamId64 == steamId64)
                .ToListAsync();

            _logger.LogInformation("📊 [GetRecommendationsAsync] Database query result: {Count} ownerships found", userGames.Count);

            if (!userGames.Any())
            {
                _logger.LogWarning("⚠️ [GetRecommendationsAsync] No games found in user library for SteamId64: {SteamId64}", request.SteamId64);

                // Verificar se existem ownerships para este usuário
                var totalOwnerships = await _context.Ownerships.CountAsync(o => o.SteamId64 == steamId64);
                _logger.LogInformation("🔍 [GetRecommendationsAsync] Total ownerships in database for this user: {Count}", totalOwnerships);

                return new RecommendationsResponse
                {
                    Items = new List<RecommendationItem>(),
                    GeneratedAt = DateTime.UtcNow,
                    TotalCount = 0
                };
            }

            _logger.LogInformation("✅ [GetRecommendationsAsync] Found {Count} games in user library", userGames.Count);

            // Gerar recomendações para TODOS os jogos da biblioteca (não só os filtrados)
            var allUserGames = userGames
                .Where(og => og.Game != null)
                .Select(og => og.Game!)
                .ToList();

            _logger.LogInformation("Processing {Count} games from user library", allUserGames.Count);

            // Gerar recomendações para todos os jogos
            foreach (var game in allUserGames)
            {
                var recommendation = await CreateRecommendationFromGameAsync(game, request, userGames);
                if (recommendation != null)
                {
                    recommendations.Add(recommendation);
                }
            }

            // Ordenar por score total (maior primeiro) e pegar mais jogos
            var limit = Math.Max(request.Limit, 10); // Mínimo 10 recomendações
            recommendations = recommendations
                .OrderByDescending(r => r.ScoreTotal)
                .Take(limit)
                .ToList();

            _logger.LogInformation("Generated {Count} recommendations", recommendations.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations for SteamId64: {SteamId64}", request.SteamId64);
            throw; // Re-throw para que o frontend trate o erro
        }

        _logger.LogInformation("✅ Generated {Count} recommendations", recommendations.Count);

        return new RecommendationsResponse
        {
            SteamId64 = request.SteamId64,
            Items = recommendations,
            TotalCount = recommendations.Count,
            GeneratedAt = DateTime.UtcNow
        };
    }

    private string[] MapVibeToGenres(string[] vibes)
    {
        var genreMapping = new Dictionary<string, string[]>
        {
            ["relax"] = ["Casual", "Puzzle", "Simulation"],
            ["historia"] = ["RPG", "Adventure", "Story Rich"],
            ["raiva"] = ["Action", "Shooter", "Fighting"],
            ["intelecto"] = ["Strategy", "Puzzle", "Turn-Based"],
            ["competitivo"] = ["Multiplayer", "PvP", "Sports"],
            ["coop"] = ["Co-op", "Multiplayer", "Party"],
            ["explorar"] = ["Open World", "Exploration", "Survival"],
            ["nostalgia"] = ["Retro", "Pixel Graphics", "Classic"],
            ["dificil"] = ["Souls-like", "Roguelike", "Difficult"],
            ["casual_rapido"] = ["Casual", "Arcade", "Short"]
        };

        var genres = new List<string>();
        foreach (var vibe in vibes)
        {
            if (genreMapping.TryGetValue(vibe.ToLower(), out var mappedGenres))
            {
                genres.AddRange(mappedGenres);
            }
        }

        return genres.Distinct().ToArray();
    }

    private List<string> GenerateIntelligentReasons(Game game, Ownership ownership, RecommendRequest request, List<Ownership> userGames)
    {
        var reasons = new List<string>();

        // 1. PROGRESSO-BASED REASONS (mais importantes)
        var playtimeHours = ownership.PlaytimeForever / 60f;
        var estimatedCompletionHours = game.Hltb?.MainHours ?? EstimatePlaytimeFromGenres(game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>());

        if (playtimeHours > 0 && estimatedCompletionHours > 0)
        {
            var progressPercentage = (playtimeHours / estimatedCompletionHours) * 100;

            if (progressPercentage >= 80 && progressPercentage < 100)
            {
                reasons.Add($"Quase terminado! {progressPercentage:F0}% completo");
            }
            else if (progressPercentage >= 50 && progressPercentage < 80)
            {
                reasons.Add($"Bem avançado ({progressPercentage:F0}% completo)");
            }
            else if (progressPercentage >= 20 && progressPercentage < 50)
            {
                reasons.Add($"Bom progresso ({progressPercentage:F0}% completo)");
            }
            else if (playtimeHours < 1)
            {
                reasons.Add("Ainda não jogado - vale a pena tentar!");
            }
            else if (playtimeHours < 5)
            {
                reasons.Add("Recém começado - continue a aventura!");
            }
        }

        // 2. RECENCY-BASED REASONS
        if (ownership.LastPlayed.HasValue)
        {
            var daysSinceLastPlayed = (DateTime.UtcNow - ownership.LastPlayed.Value).Days;

            if (daysSinceLastPlayed <= 7)
            {
                reasons.Add("Jogado recentemente - continue!");
            }
            else if (daysSinceLastPlayed <= 30)
            {
                reasons.Add("Jogado este mês - retome a diversão");
            }
            else if (daysSinceLastPlayed <= 90)
            {
                reasons.Add("Há tempo não joga - redescubra este jogo");
            }
            else
            {
                reasons.Add("Clássico esquecido - hora de relembrar");
            }
        }

        // 3. QUALITY-BASED REASONS
        if (game.Scores?.Metacritic >= 90)
            reasons.Add("Obra-prima da crítica (90+ Metacritic)");
        else if (game.Scores?.Metacritic >= 85)
            reasons.Add("Aclamado pela crítica mundial");
        else if (game.Scores?.Metacritic >= 75)
            reasons.Add("Aprovado pela crítica especializada");

        if (game.Scores?.SteamPositivePct >= 95)
            reasons.Add("Avaliação excepcional no Steam (95%+)");
        else if (game.Scores?.SteamPositivePct >= 90)
            reasons.Add("Excelente avaliação no Steam");
        else if (game.Scores?.SteamPositivePct >= 80)
            reasons.Add("Muito bem avaliado pelos jogadores");

        // 4. DURATION-BASED REASONS
        if (game.Hltb?.MainHours != null)
        {
            var hours = game.Hltb.MainHours.Value;
            if (hours <= 5)
                reasons.Add("Sessão rápida e satisfatória");
            else if (hours <= 15)
                reasons.Add("Duração perfeita para completar");
            else if (hours <= 40)
                reasons.Add("Aventura épica e envolvente");
            else
                reasons.Add("Centenas de horas de conteúdo");
        }

        // 5. VIBE-SPECIFIC REASONS (baseado nos filtros do usuário)
        if (request.Vibe != null && request.Vibe.Length > 0)
        {
            var gameGenres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            var vibeGenres = MapVibeToGenres(request.Vibe);

            var matchingGenres = gameGenres.Where(genre =>
                vibeGenres.Any(vg => vg.Contains(genre, StringComparison.OrdinalIgnoreCase) ||
                               genre.Contains(vg, StringComparison.OrdinalIgnoreCase))
            ).ToList();

            if (matchingGenres.Any())
            {
                reasons.Add($"Perfeito para: {string.Join(", ", request.Vibe.Take(2))}");
            }
        }

        // 6. COMPARISON-BASED REASONS (comparar com outros jogos da biblioteca)
        var similarPlaytimeGames = userGames.Where(o =>
            Math.Abs((o.PlaytimeForever / 60f) - playtimeHours) < 5 &&
            o.AppId != game.AppId
        ).Count();

        if (similarPlaytimeGames > 0)
        {
            reasons.Add("Similar aos seus jogos favoritos");
        }

        // 7. FALLBACK REASONS
        if (!reasons.Any())
        {
            var gameGenres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            if (gameGenres.Any())
            {
                reasons.Add($"Excelente {gameGenres.First().Trim()}");
            }
            else
            {
                reasons.Add("Jogo em alta na sua biblioteca");
            }
        }

        return reasons.Take(4).ToList();
    }

    private List<string> GenerateReasons(Game game, RecommendRequest request)
    {
        // Método mantido para compatibilidade, mas não usado mais
        return new List<string> { "Recomendação personalizada" };
    }

    private int? EstimatePlaytimeFromGenres(string[] genres)
    {
        if (genres.Any(g => g.Contains("RPG", StringComparison.OrdinalIgnoreCase)))
            return 40;
        if (genres.Any(g => g.Contains("Strategy", StringComparison.OrdinalIgnoreCase)))
            return 60;
        if (genres.Any(g => g.Contains("Shooter", StringComparison.OrdinalIgnoreCase)))
            return 8;
        if (genres.Any(g => g.Contains("Puzzle", StringComparison.OrdinalIgnoreCase)))
            return 5;
        if (genres.Any(g => g.Contains("Simulation", StringComparison.OrdinalIgnoreCase)))
            return 100;

        return 15;
    }

    private float CalculateGenreMatch(string[] gameGenres, string[] requestVibes)
    {
        if (requestVibes == null || requestVibes.Length == 0 || gameGenres == null || gameGenres.Length == 0)
            return 0f;

        var vibeGenres = MapVibeToGenres(requestVibes);
        var matches = gameGenres.Count(genre =>
            vibeGenres.Any(vg => vg.Contains(genre, StringComparison.OrdinalIgnoreCase) ||
                               genre.Contains(vg, StringComparison.OrdinalIgnoreCase))
        );

        return gameGenres.Length > 0 ? (float)matches / gameGenres.Length : 0f;
    }

    // DEPRECATED: Funcionalidade movida para CompositeCatalogService
    private async Task<List<object>> SearchGamesViaRawgAsync(string[] genres, RecommendRequest request)
    {
        return new List<object>();
    }

    // DEPRECATED: Funcionalidade movida para CompositeCatalogService
    private async Task<List<object>> SearchSimilarGamesAsync(List<RecommendationItem> existingRecommendations, int count)
    {
        return new List<object>();
    }

    // DEPRECATED: Funcionalidade movida para CompositeCatalogService
    private async Task<List<object>> SearchTrendingGamesAsync(int count)
    {
        return new List<object>();
    }

    // DEPRECATED: Funcionalidade movida para CompositeCatalogService
    private async Task<RecommendationItem> CreateRecommendationFromRawgGameAsync(object rawgGame, RecommendRequest request)
    {
        return new RecommendationItem
        {
            AppId = 0,
            Name = "Deprecated",
            ScoreTotal = 0,
            Why = new List<string>()
        };
    }

    private int CalculateRawgSteamScore(double? rating)
    {
        if (!rating.HasValue) return 75;
        return (int)Math.Min(rating.Value * 20, 100);
    }

    // DEPRECATED: Funcionalidade movida para CompositeCatalogService
    private float CalculateRawgGameScore(object rawgGame, RecommendRequest request)
    {
        return 0f;
    }

    private float CalculateRawgGenreMatch(string[] gameGenres, string[] requestVibes)
    {
        if (requestVibes == null || requestVibes.Length == 0 || gameGenres == null || gameGenres.Length == 0)
            return 0f;

        var vibeGenres = MapVibeToGenres(requestVibes);
        var matches = gameGenres.Count(genre =>
            vibeGenres.Any(vg => vg.Contains(genre, StringComparison.OrdinalIgnoreCase) ||
                               genre.Contains(vg, StringComparison.OrdinalIgnoreCase))
        );

        return gameGenres.Length > 0 ? (float)matches / gameGenres.Length : 0f;
    }

    // DEPRECATED: Funcionalidade movida para CompositeCatalogService
    private List<string> GenerateRawgGameReasons(object rawgGame, RecommendRequest request)
    {
        return new List<string>();
    }

    private bool ShouldRecommendGame(Game game, string[]? vibes)
    {
        if (vibes == null || vibes.Length == 0)
            return true;

        var gameGenres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
        var vibeGenres = MapVibeToGenres(vibes);

        // Verificar se algum gênero do jogo combina com as vibes
        return gameGenres.Any(genre =>
            vibeGenres.Any(vg => vg.Contains(genre, StringComparison.OrdinalIgnoreCase) ||
                               genre.Contains(vg, StringComparison.OrdinalIgnoreCase))
        );
    }

    private async Task<RecommendationItem?> CreateRecommendationFromGameAsync(Game game, RecommendRequest request, List<Ownership> userGames)
    {
        try
        {
            // Buscar dados de ownership para este jogo
            var ownership = userGames.FirstOrDefault(o => o.AppId == game.AppId);

            if (ownership == null)
                return null;

            // Calcular score baseado em múltiplos fatores
            var score = CalculateGameScore(game, ownership, request);

            // Gerar razões inteligentes baseadas no progresso e dados reais
            var reasons = GenerateIntelligentReasons(game, ownership, request, userGames);

            return new RecommendationItem
            {
                AppId = game.AppId,
                Name = game.Name,
                BackgroundImage = game.HeaderImage ?? "",
                HeaderImage = game.HeaderImage,
                Scores = new ScoresDto
                {
                    Metacritic = game.Scores?.Metacritic,
                    OpenCritic = game.Scores?.OpenCritic,
                    SteamPositivePct = game.Scores?.SteamPositivePct ?? 0
                },
                Hltb = new HltbDto
                {
                    MainHours = game.Hltb?.MainHours
                },
                ScoreTotal = score,
                Why = reasons,
                PlaytimeForever = ownership.PlaytimeForever,
                LastPlayed = ownership.LastPlayed,
                // Dados de conquistas (quando disponíveis)
                AchievementsTotal = game.AchievementsTotal,
                AchievementsUnlocked = game.AchievementsUnlocked,
                // Gêneros
                Genres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>()
            };

            _logger.LogInformation("🏆 [CreateRecommendationFromGameAsync] Game {AppId} ({Name}): {Unlocked}/{Total} achievements in recommendation",
                game.AppId, game.Name, game.AchievementsUnlocked, game.AchievementsTotal);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error creating recommendation for game {AppId}", game.AppId);
            return null;
        }
    }

    private float CalculateGameScore(Game game, Ownership ownership, RecommendRequest request)
    {
        var score = 0f;

        // 1. PROGRESSO-BASED SCORE (mais importante - 40% do score)
        var playtimeHours = ownership.PlaytimeForever / 60f;
        var estimatedCompletionHours = game.Hltb?.MainHours ?? EstimatePlaytimeFromGenres(game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>());

        if (playtimeHours > 0 && estimatedCompletionHours > 0)
        {
            var progressPercentage = (playtimeHours / estimatedCompletionHours) * 100;

            // Bonus para jogos quase terminados
            if (progressPercentage >= 80 && progressPercentage < 100)
            {
                score += 0.4f; // Máximo bonus para jogos quase terminados
            }
            else if (progressPercentage >= 50 && progressPercentage < 80)
            {
                score += 0.3f; // Bom progresso
            }
            else if (progressPercentage >= 20 && progressPercentage < 50)
            {
                score += 0.2f; // Progresso moderado
            }
            else if (playtimeHours < 1)
            {
                score += 0.15f; // Jogos não jogados têm prioridade moderada
            }
            else if (playtimeHours < 5)
            {
                score += 0.25f; // Jogos recém começados
            }
        }
        else if (playtimeHours < 1)
        {
            score += 0.1f; // Jogos não jogados
        }

        // 2. QUALITY-BASED SCORE (25% do score)
        if (game.Scores != null)
        {
            var qualityScore = 0f;
            if (game.Scores.Metacritic.HasValue)
                qualityScore += game.Scores.Metacritic.Value / 100f * 0.15f;
            if (game.Scores.SteamPositivePct.HasValue)
                qualityScore += game.Scores.SteamPositivePct.Value / 100f * 0.1f;
            if (game.Scores.OpenCritic.HasValue)
                qualityScore += game.Scores.OpenCritic.Value / 100f * 0.05f;

            score += qualityScore;
        }

        // 3. RECENCY-BASED SCORE (20% do score)
        if (ownership.LastPlayed.HasValue)
        {
            var daysSinceLastPlayed = (DateTime.UtcNow - ownership.LastPlayed.Value).Days;
            var recencyScore = Math.Max(0, 1f - (daysSinceLastPlayed / 365f)) * 0.2f;
            score += recencyScore;
        }

        // 4. VIBE-MATCH SCORE (15% do score)
        if (request.Vibe != null && request.Vibe.Length > 0)
        {
            var vibeScore = CalculateVibeMatch(game, request.Vibe) * 0.15f;
            score += vibeScore;
        }

        return Math.Min(score, 1f); // Cap em 1.0
    }

    private float CalculateVibeMatch(Game game, string[] vibes)
    {
        var gameGenres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
        var vibeGenres = MapVibeToGenres(vibes);

        var matches = gameGenres.Count(genre =>
            vibeGenres.Any(vg => vg.Contains(genre, StringComparison.OrdinalIgnoreCase) ||
                               genre.Contains(vg, StringComparison.OrdinalIgnoreCase))
        );

        return gameGenres.Length > 0 ? (float)matches / gameGenres.Length : 0f;
    }

}