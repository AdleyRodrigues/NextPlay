using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Infrastructure.Ef;
using NextPlay.Api.Infrastructure.Providers;
using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Domain.Entities;
using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Application.Services;

public class RecommendationService
{
    private readonly NextPlayDbContext _context;
    private readonly RawgService _rawgService;
    private readonly HltbService _hltbService;
    private readonly IScoresService _scoresService;
    private readonly IGameCatalog _catalog;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(
        NextPlayDbContext context, 
        RawgService rawgService, 
        HltbService hltbService, 
        IScoresService scoresService, 
        IGameCatalog catalog,
        ILogger<RecommendationService> logger)
    {
        _context = context;
        _rawgService = rawgService;
        _hltbService = hltbService;
        _scoresService = scoresService;
        _catalog = catalog;
        _logger = logger;
    }

    public async Task<RecommendationsResponse> GetRecommendationsAsync(RecommendRequest request)
    {
        var recommendations = new List<RecommendationItem>();

        _logger.LogInformation("🚀 Starting recommendation process for Platform: {PlatformId} with Skill: {Skill}", 
            request.PlatformId, request.Skill);

        try
        {
            // 1. Mapear Skill para Tags/Gêneros
            var targetTags = MapSkillToTags(request.Skill);
            
            // 2. Buscar usando RAWG API
            var targetTagsStr = string.Join(",", targetTags.tags.Concat(targetTags.genres));
            var rawgGames = await _rawgService.GetGamesByTagsAsync(targetTagsStr, request.Limit * 2, CancellationToken.None);

            if (rawgGames == null || rawgGames.Count == 0)
            {
                _logger.LogWarning("⚠️ No games found for Platform: {PlatformId} and Skill: {Skill}", request.PlatformId, request.Skill);
                return new RecommendationsResponse
                {
                    SteamId64 = "anonymous",
                    Items = new List<RecommendationItem>(),
                    TotalCount = 0,
                    GeneratedAt = DateTime.UtcNow
                };
            }

            // 3. Processar e transformar em recomendações
            foreach (var dGame in rawgGames)
            {
                // Salvar/Atualizar no banco como cache
                var dbGame = await GetOrCreateGameInDbAsync(dGame);

                var recommendation = await CreateRecommendationFromGameAsync(dbGame, dGame, request, targetTags);
                if (recommendation != null)
                {
                    recommendations.Add(recommendation);
                }
            }

            // 4. Rankear, filtrar por tempo se aplicável e aplicar randomização
            var hasTimeFilter = !string.IsNullOrEmpty(request.Time);
            var timeRange = hasTimeFilter ? MapTimeToHours(request.Time) : (min: 0, max: 999);

            if (hasTimeFilter)
            {
                recommendations = recommendations
                    .Where(r => r.Hltb?.MainHours == null || (r.Hltb.MainHours.Value >= timeRange.min && r.Hltb.MainHours.Value <= timeRange.max))
                    .ToList();
            }

            var random = new Random();
            recommendations = recommendations
                .OrderByDescending(r => r.ScoreTotal)
                .ThenBy(r => random.Next(0, 100))
                .Take(request.Limit)
                .ToList();

            _logger.LogInformation("🎯 Generated {Count} skill-based recommendations", recommendations.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations");
            throw;
        }

        return new RecommendationsResponse
        {
            SteamId64 = "anonymous",
            Items = recommendations,
            TotalCount = recommendations.Count,
            GeneratedAt = DateTime.UtcNow
        };
    }

    private async Task<Game> GetOrCreateGameInDbAsync(NextPlay.Api.Infrastructure.Providers.RawgGameDto dto)
    {
        var existingGame = await _context.Games
            .Include(g => g.Scores)
            .Include(g => g.Hltb)
            .FirstOrDefaultAsync(g => g.Name.ToLower() == (dto.name ?? "").ToLower() || g.AppId == dto.id);

        if (existingGame != null)
        {
            return existingGame;
        }

        var newGame = new Game
        {
            AppId = dto.id,
            Name = dto.name ?? "Unknown Game",
            HeaderImage = dto.background_image,
            Genres = string.Join(",", dto.genres?.Select(g => g.name) ?? Array.Empty<string>()),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Games.Add(newGame);
        await _context.SaveChangesAsync();
        
        return newGame;
    }

    private async Task<RecommendationItem?> CreateRecommendationFromGameAsync(Game game, NextPlay.Api.Infrastructure.Providers.RawgGameDto dto, RecommendRequest request, (string[] genres, string[] tags) targetTags)
    {
        try
        {
            var finalScores = new ScoresDto
            {
                Metacritic = dto.metacritic ?? game.Scores?.Metacritic,
                OpenCritic = game.Scores?.OpenCritic,
                SteamPositivePct = game.Scores?.SteamPositivePct ?? 0
            };

            var score = CalculateSkillScore(game, finalScores, request);
            var reasons = GenerateSkillReasons(game, finalScores, request);

            return new RecommendationItem
            {
                AppId = game.AppId,
                Name = game.Name,
                BackgroundImage = game.HeaderImage ?? "",
                HeaderImage = game.HeaderImage,
                Scores = finalScores,
                Hltb = new HltbDto { MainHours = game.Hltb?.MainHours ?? EstimatePlaytimeFromGenres(game.Genres?.Split(',') ?? Array.Empty<string>()) },
                ScoreTotal = score,
                Why = reasons,
                PlaytimeForever = 0,
                Genres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error creating recommendation for game {Name}", game.Name);
            return null;
        }
    }

    private float CalculateSkillScore(Game game, ScoresDto scores, RecommendRequest request)
    {
        var score = 0f;

        // Quality Score (60%)
        if (scores.Metacritic.HasValue) score += (scores.Metacritic.Value / 100f) * 0.4f;
        if (scores.OpenCritic.HasValue) score += (scores.OpenCritic.Value / 100f) * 0.2f;

        // Base score for simply being returned by the discovery engine
        score += 0.4f;

        return Math.Min(score, 1f);
    }

    private List<string> GenerateSkillReasons(Game game, ScoresDto scores, RecommendRequest request)
    {
        var reasons = new List<string>();

        // Razão baseada na habilidade
        var skillReason = request.Skill.ToLower() switch
        {
            "logica" => "Exercita fortemente o raciocínio lateral e resolução de problemas.",
            "reflexos" => "Exige alta agilidade e tempo de resposta rápido.",
            "paciencia" => "Ensina resiliência através de desafios contínuos.",
            "estrategia" => "Perfeito para desenvolver planejamento a longo prazo.",
            "cooperacao" => "Focado em trabalho em equipe e comunicação eficiente.",
            _ => "Recomendado para o seu desenvolvimento."
        };
        reasons.Add(skillReason);

        if (scores.Metacritic >= 85) reasons.Add("Aclamado pela crítica mundial (Meta 85+)");
        else if (scores.Metacritic >= 75) reasons.Add("Aprovado pela crítica especializada");

        var genres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
        if (genres.Any())
        {
            reasons.Add($"Excelente título de {genres.First().Trim()}");
        }

        return reasons.Take(3).ToList();
    }

    private (string[] genres, string[] tags) MapSkillToTags(string skill)
    {
        return skill.ToLower() switch
        {
            "logica" => (new[] { "puzzle", "strategy" }, new[] { "logic", "puzzle-platformer" }),
            "reflexos" => (new[] { "action", "shooter", "fighting" }, new[] { "fast-paced", "bullet-hell" }),
            "paciencia" => (new[] { "action", "rpg" }, new[] { "souls-like", "roguelike", "difficult" }),
            "estrategia" => (new[] { "strategy", "simulation" }, new[] { "resource-management", "city-builder", "turn-based" }),
            "cooperacao" => (new[] { "action", "adventure" }, new[] { "co-op", "multiplayer", "local-co-op" }),
            _ => (Array.Empty<string>(), Array.Empty<string>())
        };
    }

    private (int min, int max) MapTimeToHours(string time)
    {
        return time.ToLower() switch
        {
            "curto" => (0, 15),    // Menos tempo diário -> jogos com campanhas mais curtas
            "medio" => (10, 40),   // Tempo médio diário -> jogos com duração padrão
            "longo" => (30, 999),  // Bastante tempo diário -> pode encarar RPGs e jogos massivos
            _ => (0, 999)
        };
    }

    private int? EstimatePlaytimeFromGenres(string[] genres)
    {
        if (genres.Any(g => g.Contains("RPG", StringComparison.OrdinalIgnoreCase))) return 40;
        if (genres.Any(g => g.Contains("Strategy", StringComparison.OrdinalIgnoreCase))) return 60;
        if (genres.Any(g => g.Contains("Shooter", StringComparison.OrdinalIgnoreCase))) return 8;
        if (genres.Any(g => g.Contains("Puzzle", StringComparison.OrdinalIgnoreCase))) return 5;
        if (genres.Any(g => g.Contains("Simulation", StringComparison.OrdinalIgnoreCase))) return 100;
        return 15;
    }
}