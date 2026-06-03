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
            var tagsStr = string.Join(",", targetTags.tags);
            var genresStr = string.Join(",", targetTags.genres);
            var rawgGames = await _rawgService.GetGamesByTagsAsync(tagsStr, genresStr, request.Limit * 2, request, CancellationToken.None);

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

                var recommendation = CreateRecommendationFromGame(dbGame, dGame, request, targetTags);
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
            Genres = string.Join(",", dto.genres?.Select(g => g.slug ?? g.name?.ToLowerInvariant()) ?? Array.Empty<string>()),
            Tags = string.Join(",", dto.tags?.Select(t => t.slug ?? t.name?.ToLowerInvariant()) ?? Array.Empty<string>()),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Games.Add(newGame);
        await _context.SaveChangesAsync();
        
        return newGame;
    }

    private RecommendationItem? CreateRecommendationFromGame(Game game, NextPlay.Api.Infrastructure.Providers.RawgGameDto dto, RecommendRequest request, (string[] genres, string[] tags) targetTags)
    {
        try
        {
            var finalScores = new ScoresDto
            {
                Metacritic = dto.metacritic ?? game.Scores?.Metacritic,
                OpenCritic = game.Scores?.OpenCritic
            };

            var score = CalculateSkillScore(game, dto, finalScores, request, targetTags);
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

    private float CalculateSkillScore(Game game, NextPlay.Api.Infrastructure.Providers.RawgGameDto dto, ScoresDto scores, RecommendRequest request, (string[] genres, string[] tags) skillTags)
    {
        var score = 0f;

        // Crítica - Max 30%
        if (scores.Metacritic.HasValue) score += (scores.Metacritic.Value / 100f) * 0.20f;
        if (scores.OpenCritic.HasValue) score += (scores.OpenCritic.Value / 100f) * 0.10f;

        // Affinity - Max 70%
        var gameTags = dto.tags?.Select(t => t.slug ?? t.name?.ToLowerInvariant() ?? "").ToList() ?? new List<string>();
        var gameGenres = dto.genres?.Select(g => g.slug ?? g.name?.ToLowerInvariant() ?? "").ToList() ?? new List<string>();

        // 1. Skill Match (Max 35%)
        int skillMatchCount = 0;
        int skillTargetCount = skillTags.tags.Length + skillTags.genres.Length;

        foreach(var t in skillTags.tags) if (gameTags.Contains(t.ToLowerInvariant()) || gameTags.Any(x => x.Contains(t.ToLowerInvariant()))) skillMatchCount++;
        foreach(var g in skillTags.genres) if (gameGenres.Contains(g.ToLowerInvariant()) || gameGenres.Any(x => x.Contains(g.ToLowerInvariant()))) skillMatchCount++;
        
        float skillAffinity = skillTargetCount > 0 ? (float)skillMatchCount / skillTargetCount : 0.5f;
        score += 0.35f * skillAffinity;

        // 2. Vibe Match (Max 35%)
        float vibeAffinity = 1f; // Se não pediu vibe, ganha full points
        if (request.Vibes != null && request.Vibes.Count > 0)
        {
            int vibeMatchCount = 0;
            int totalVibes = request.Vibes.Count;
            foreach (var vibe in request.Vibes)
            {
                if (NextPlay.Api.Infrastructure.Providers.RawgService.VibeMapping.TryGetValue(vibe.ToLowerInvariant(), out var vTags))
                {
                    var mainVibeTag = vTags.First().ToLowerInvariant();
                    if (gameTags.Contains(mainVibeTag) || gameTags.Any(x => x.Contains(mainVibeTag)) ||
                        gameGenres.Contains(mainVibeTag) || gameGenres.Any(x => x.Contains(mainVibeTag)))
                    {
                        vibeMatchCount++;
                    }
                }
            }
            vibeAffinity = (float)vibeMatchCount / totalVibes;
            
            // Penalidade severa se não bateu as vibes
            if (vibeAffinity < 1f) vibeAffinity -= 0.5f; 
        }

        score += 0.35f * vibeAffinity;

        return Math.Max(0f, Math.Min(score, 1f));
    }

    private List<string> GenerateSkillReasons(Game game, ScoresDto scores, RecommendRequest request)
    {
        var reasons = new List<string>();

        // Razão baseada na habilidade
        var skillReason = request.Skill.ToLower() switch
        {
            "logica" => "Exercita fortemente o raciocínio lateral e resolução de problemas.",
            "reflexos" => "Exige alta agilidade e tempo de resposta rápido.",
            "resiliencia" => "Ensina resiliência e controle emocional através de desafios contínuos.",
            "estrategia" => "Perfeito para desenvolver planejamento a longo prazo.",
            "cooperacao" => "Focado em trabalho em equipe e comunicação eficiente.",
            "criatividade" => "Estimula o pensamento divergente e a livre autoexpressão criativa.",
            "decisao" => "Exercita o pensamento crítico e a ponderação de dilemas e consequências morais.",
            "memoria" => "Fortalece a memória espacial e o reconhecimento de padrões complexos.",
            "foco" => "Ideal para praticar atenção plena, relaxamento ativo e estado de flow.",
            "lideranca" => "Focado em coordenação de equipe, comunicação tática e liderança.",
            "gestao" => "Desenvolve a capacidade de gerenciamento de recursos sob pressão e resolução de crises.",
            "coordenacao" => "Aprimora significativamente a precisão e coordenação motora fina.",
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
        // Limitando a apenas 1 gênero e 1 tag principal para não criar uma query restritiva demais (RAWG usa AND entre vírgulas)
        return skill.ToLower() switch
        {
            "logica" => (new[] { "puzzle" }, new[] { "logic" }),
            "reflexos" => (new[] { "shooter" }, new[] { "fast-paced" }),
            "resiliencia" => (new[] { "action" }, new[] { "difficult" }),
            "estrategia" => (new[] { "strategy" }, new[] { "turn-based" }),
            "cooperacao" => (new[] { "action" }, new[] { "co-op" }),
            "criatividade" => (new[] { "simulation" }, new[] { "sandbox" }),
            "decisao" => (new[] { "role-playing-games-rpg" }, new[] { "choices-matter" }),
            "memoria" => (new[] { "platformer" }, new[] { "metroidvania" }),
            "foco" => (new[] { "adventure" }, new[] { "atmospheric" }),
            "lideranca" => (new[] { "strategy" }, new[] { "tactical" }),
            "gestao" => (new[] { "simulation" }, new[] { "management" }),
            "coordenacao" => (new[] { "platformer" }, new[] { "precision-platformer" }),
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