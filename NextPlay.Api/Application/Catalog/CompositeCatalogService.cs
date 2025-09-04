using NextPlay.Api.Infrastructure.Providers;

namespace NextPlay.Api.Application.Catalog;

public class CompositeCatalogService : IGameCatalog
{
    private readonly IIgdbService _igdb;
    private readonly IRawgService _rawg;
    private readonly ILogger<CompositeCatalogService> _log;

    // Mapeamento de duração para horas alvo
    private static readonly Dictionary<string, (double min, double max)> DurationRanges = new()
    {
        ["rapido"] = (2, 8),
        ["medio"] = (8, 15),
        ["longo"] = (15, 30),
        ["muito_longo"] = (30, 100),
        ["tanto_faz"] = (0, 1000)
    };

    public CompositeCatalogService(IIgdbService igdb, IRawgService rawg, ILogger<CompositeCatalogService> log)
    {
        _igdb = igdb;
        _rawg = rawg;
        _log = log;
    }

    public async Task<IReadOnlyList<DiscoverItem>> DiscoverAsync(DiscoverRequest req, CancellationToken ct = default)
    {
        IReadOnlyList<DiscoverItem> items;

        try
        {
            _log.LogInformation("Tentando descoberta via IGDB para {VibeCount} vibes", req.vibe?.Length ?? 0);
            items = await _igdb.QueryGamesAsync(req, ct);

            if (items.Count > 0)
            {
                _log.LogInformation("IGDB retornou {Count} jogos", items.Count);
            }
            else
            {
                _log.LogInformation("IGDB retornou vazio, tentando RAWG como fallback");
                items = await _rawg.DiscoverAsync(req, ct);
                _log.LogInformation("RAWG retornou {Count} jogos", items.Count);
            }
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "IGDB falhou, usando RAWG como fallback");
            items = await _rawg.DiscoverAsync(req, ct);
            _log.LogInformation("RAWG fallback retornou {Count} jogos", items.Count);
        }

        // Aplicar scoring e ordenação
        var scoredItems = items.Select(item => ApplyScoring(item, req)).ToList();

        // Ordenar por score total descendente e limitar a 100
        var result = scoredItems
            .OrderByDescending(item => item.scoreTotal)
            .Take(100)
            .ToList();

        _log.LogInformation("Retornando {Count} jogos após scoring e ordenação", result.Count);
        return result;
    }

    private static DiscoverItem ApplyScoring(DiscoverItem item, DiscoverRequest req)
    {
        double qualityScore = 0;
        double prefsScore = 0;
        double durationScore = 0;

        // 1. Quality Score (0.6 peso) - baseado em ratings
        if (item.criticRating.HasValue)
        {
            qualityScore = NormalizeRating(item.criticRating.Value, 60, 95);
        }

        if (item.metacritic.HasValue)
        {
            var metacriticScore = NormalizeRating(item.metacritic.Value, 60, 95);
            qualityScore = Math.Max(qualityScore, metacriticScore);
        }

        // 2. Preferences/Vibe Match Score (0.25 peso)
        if (req.vibe?.Length > 0)
        {
            var matchingKeywords = CountMatchingVibes(item, req.vibe);
            prefsScore = Math.Min(1.0, (double)matchingKeywords / req.vibe.Length);
        }
        else
        {
            prefsScore = 0.5; // Neutro se não há preferências específicas
        }

        // 3. Duration Fit Score (0.15 peso)
        if (item.hltbMainHours.HasValue && DurationRanges.TryGetValue(req.duration, out var range))
        {
            var hours = item.hltbMainHours.Value;
            if (hours >= range.min && hours <= range.max)
            {
                durationScore = 1.0; // Perfeito dentro do range
            }
            else
            {
                // Penalização quadrática fora do range
                var distanceFromRange = hours < range.min
                    ? range.min - hours
                    : hours - range.max;
                durationScore = Math.Max(0, 1.0 - Math.Pow(distanceFromRange / 20.0, 2));
            }
        }
        else
        {
            durationScore = 0.5; // Neutro se não há informação de duração
        }

        // Score total ponderado
        var scoreTotal = 0.6 * qualityScore + 0.25 * prefsScore + 0.15 * durationScore;

        // Atualizar array de "why" com base no scoring
        var whyList = new List<string>(item.why);

        if (qualityScore > 0.7)
        {
            if (item.metacritic.HasValue)
                whyList.Add($"Metacritic {item.metacritic.Value}");
            else if (item.criticRating.HasValue)
                whyList.Add($"Crítica alta ({item.store} {item.criticRating.Value:F0})");
        }

        if (item.hltbMainHours.HasValue && durationScore > 0.8)
        {
            whyList.Add($"Main ~{item.hltbMainHours.Value:F0}h, dentro do que você quer");
        }

        if (prefsScore > 0.6 && req.vibe?.Length > 0)
        {
            whyList.Add($"Combina com suas vibes: {string.Join(", ", req.vibe.Take(3))}");
        }

        return item with
        {
            scoreTotal = scoreTotal,
            why = whyList.Distinct().Take(4).ToArray()
        };
    }

    private static double NormalizeRating(double rating, double min, double max)
    {
        return Math.Max(0, Math.Min(1, (rating - min) / (max - min)));
    }

    private static int CountMatchingVibes(DiscoverItem item, string[] vibes)
    {
        // Análise simples baseada no nome do jogo e razões (why)
        var itemText = $"{item.name} {string.Join(" ", item.why)}".ToLowerInvariant();

        var matches = 0;
        foreach (var vibe in vibes)
        {
            // Mapear vibes para termos que podem aparecer no texto
            var searchTerms = vibe.ToLowerInvariant() switch
            {
                "relax" => new[] { "casual", "cozy", "puzzle", "relaxing" },
                "historia" => new[] { "story", "narrative", "adventure", "rpg" },
                "raiva" => new[] { "action", "shooter", "fighting", "combat" },
                "intelecto" => new[] { "puzzle", "strategy", "tactics", "mystery" },
                "competitivo" => new[] { "pvp", "competitive", "multiplayer" },
                "coop" => new[] { "co-op", "coop", "multiplayer" },
                "explorar" => new[] { "open world", "exploration", "survival" },
                "nostalgia" => new[] { "retro", "pixel", "classic", "arcade" },
                "dificil" => new[] { "souls", "difficult", "hard", "challenging" },
                "casual_rapido" => new[] { "casual", "arcade", "quick", "short" },
                _ => new[] { vibe.ToLowerInvariant() }
            };

            if (searchTerms.Any(term => itemText.Contains(term)))
            {
                matches++;
            }
        }

        return matches;
    }
}


