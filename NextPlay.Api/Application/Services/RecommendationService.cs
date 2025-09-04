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

        _logger.LogInformation("ℹ️  Recommendation system has been moved to Discovery mode. Please use the Discovery endpoint instead.");
        
        // Return empty recommendations to indicate user should use discovery mode
        return new RecommendationsResponse
        {
            Items = recommendations,
            TotalCount = 0,
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

    private List<string> GenerateReasons(Game game, RecommendRequest request)
    {
        var reasons = new List<string>();

        // Score-based reasons
        if (game.Scores?.Metacritic >= 85)
            reasons.Add("Aclamado pela crítica mundial");
        else if (game.Scores?.Metacritic >= 75)
            reasons.Add("Aprovado pela crítica especializada");

        if (game.Scores?.SteamPosPct >= 90)
            reasons.Add("Excelente avaliação no Steam");
        else if (game.Scores?.SteamPosPct >= 80)
            reasons.Add("Muito bem avaliado pelos jogadores");

        // HLTB-based reasons
        if (game.Hltb?.MainHours != null)
        {
            var hours = game.Hltb.MainHours.Value;
            if (hours <= 10)
                reasons.Add("Experiência concentrada e impactante");
            else if (hours <= 25)
                reasons.Add("Duração perfeita para completar");
            else if (hours <= 50)
                reasons.Add("Aventura épica e envolvente");
            else
                reasons.Add("Centenas de horas de conteúdo");
        }

        // Genre-based reasons
        var gameGenres = game.Genres?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
        foreach (var genre in gameGenres.Take(2))
        {
            reasons.Add($"Excelente {genre.Trim()}");
        }

        // Vibe-specific reasons
        if (request.Vibe != null)
        {
            foreach (var vibe in request.Vibe.Take(2))
            {
                switch (vibe.ToLower())
                {
                    case "relax":
                        reasons.Add("Perfeito para relaxar");
                        break;
                    case "historia":
                        reasons.Add("História envolvente");
                        break;
                    case "raiva":
                        reasons.Add("Ação intensa e adrenalina");
                        break;
                    case "competitivo":
                        reasons.Add("Ideal para competir");
                        break;
                    case "explorar":
                        reasons.Add("Mundo rico para explorar");
                        break;
                    case "casual":
                        reasons.Add("Fácil de jogar");
                        break;
                    case "intelecto":
                        reasons.Add("Desafia sua mente");
                        break;
                    case "coop":
                        reasons.Add("Diversão garantida com amigos");
                        break;
                    case "nostalgia":
                        reasons.Add("Clássico que marca época");
                        break;
                    case "dificil":
                        reasons.Add("Para jogadores experientes");
                        break;
                    case "casual_rapido":
                        reasons.Add("Diversão rápida e casual");
                        break;
                }
            }
        }

        // Default fallback
        if (!reasons.Any())
            reasons.Add("Jogo em alta");

        return reasons.Take(4).ToList();
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
}