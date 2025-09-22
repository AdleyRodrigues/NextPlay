using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Infrastructure.Providers;

public sealed class RawgService : IRawgService
{
    private readonly HttpClient _http;
    private readonly RawgOptions _opts;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RawgService> _log;
    private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    // Mapeamento de vibes para tags/genres do RAWG
    private static readonly Dictionary<string, string[]> VibeMapping = new()
    {
        ["relax"] = ["casual", "puzzle", "indie"],
        ["historia"] = ["story-rich", "adventure", "rpg", "narrative"],
        ["raiva"] = ["action", "shooter", "fighting", "fast-paced"],
        ["intelecto"] = ["puzzle", "strategy", "tactics", "mystery"],
        ["competitivo"] = ["pvp", "competitive", "multiplayer", "esports"],
        ["coop"] = ["co-op", "online-co-op", "local-co-op", "multiplayer"],
        ["explorar"] = ["open-world", "exploration", "survival", "crafting"],
        ["nostalgia"] = ["retro", "pixel-graphics", "platformer", "arcade"],
        ["dificil"] = ["souls-like", "roguelike", "difficult", "hardcore"],
        ["casual_rapido"] = ["roguelite", "arcade", "short", "casual"]
    };

    public RawgService(HttpClient http, IOptions<RawgOptions> opts, IMemoryCache cache, ILogger<RawgService> log)
    {
        _http = http;
        _opts = opts.Value;
        _cache = cache;
        _log = log;
        if (_http.BaseAddress is null)
            _http.BaseAddress = new Uri(_opts.BaseUrl);
        _http.Timeout = TimeSpan.FromSeconds(15);
    }

    public async Task<RawgMeta?> GetGameMetaAsync(string name, CancellationToken ct = default)
    {
        var key = $"rawg:meta:name:{Normalize(name)}";
        if (_cache.TryGetValue(key, out RawgMeta? cached)) return cached;

        // 1) Busca por nome (page_size configurável)
        var searchUrl = $"/games?key={_opts.ApiKey}&search={Uri.EscapeDataString(name)}&page_size={_opts.SearchPageSize}";
        using var res = await _http.GetAsync(searchUrl, ct);
        if (!res.IsSuccessStatusCode)
        {
            _log.LogWarning("RAWG search falhou ({Status}) para '{Name}'", res.StatusCode, name);
            return null;
        }

        using var stream = await res.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        if (!doc.RootElement.TryGetProperty("results", out var results) || results.GetArrayLength() == 0)
            return null;

        // Heurística simples: 1º com maior metacritic, priorizando nome parecido
        var best = results.EnumerateArray()
            .Select(e => new
            {
                El = e,
                Metacritic = e.TryGetProperty("metacritic", out var m) && m.ValueKind == JsonValueKind.Number ? m.GetInt32() : (int?)null,
                Name = e.TryGetProperty("name", out var n) && n.ValueKind == JsonValueKind.String ? n.GetString() : ""
            })
            .OrderByDescending(x => Similarity(x.Name ?? "", name))
            .ThenByDescending(x => x.Metacritic ?? -1)
            .First().El;

        // Detalhe (id)
        if (!best.TryGetProperty("id", out var idProp) || idProp.ValueKind != JsonValueKind.Number)
            return null;

        var id = idProp.GetInt32();
        var detailUrl = $"/games/{id}?key={_opts.ApiKey}";
        using var detRes = await _http.GetAsync(detailUrl, ct);
        if (!detRes.IsSuccessStatusCode)
        {
            _log.LogWarning("RAWG detail falhou ({Status}) para id={Id} '{Name}'", detRes.StatusCode, id, name);
            return null;
        }

        var detailJson = await detRes.Content.ReadAsStringAsync(ct);
        var detail = JsonSerializer.Deserialize<RawgDetailDto>(detailJson, _json);
        if (detail is null) return null;

        int? year = null;
        if (!string.IsNullOrWhiteSpace(detail.released) && DateTime.TryParse(detail.released, out var dt))
            year = dt.Year;

        var meta = new RawgMeta(
            Metacritic: detail.metacritic,
            ReleaseYear: year,
            Genres: detail.genres?.Select(g => g.name ?? "").Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList() ?? new List<string>(),
            Tags: detail.tags?.Take(10).Select(t => t.name ?? "").Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList() ?? new List<string>(),
            Platforms: detail.platforms?.Select(p => p.platform?.name ?? "").Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList() ?? new List<string>(),
            RawgId: detail.id.ToString(),
            RawgSlug: detail.slug
        );

        _cache.Set(key, meta, TimeSpan.FromHours(_opts.CacheHours));
        return meta;
    }

    public async Task<RawgMeta?> GetGameDetailsAsync(string appId, CancellationToken ct = default)
    {
        // Por enquanto, retorna null pois não temos mapeamento direto de appId para RAWG
        // TODO: Implementar busca por appId usando Steam API para obter nome do jogo
        return null;
    }

    public async Task<IReadOnlyList<DiscoverItem>> DiscoverAsync(DiscoverRequest req, CancellationToken ct = default)
    {
        var cacheKey = $"rawg:discover:{GetRequestHash(req)}";
        if (_cache.TryGetValue(cacheKey, out IReadOnlyList<DiscoverItem>? cached))
            return cached ?? new List<DiscoverItem>();

        var games = new List<DiscoverItem>();
        var currentYear = DateTime.UtcNow.Year;
        var startYear = currentYear - 10;

        // Construir parâmetros base
        var baseParams = new Dictionary<string, string>
        {
            ["key"] = _opts.ApiKey,
            ["dates"] = $"{startYear}-01-01,{currentYear}-12-31",
            ["ordering"] = "-metacritic",
            ["page_size"] = _opts.SearchPageSize.ToString()
        };

        // Adicionar filtros baseados nas vibes
        if (req.vibe?.Length > 0)
        {
            var tags = req.vibe
                .Where(v => VibeMapping.ContainsKey(v))
                .SelectMany(v => VibeMapping[v])
                .Distinct()
                .Take(8)
                .ToArray();

            if (tags.Length > 0)
            {
                baseParams["tags"] = string.Join(",", tags);
            }
        }

        // Paginação paralela (máximo 3 páginas simultâneas)
        var maxPages = Math.Min(3, (int)Math.Ceiling((double)req.limit / _opts.SearchPageSize));
        var tasks = new List<Task<RawgDiscoverResponse?>>();

        for (int page = 1; page <= maxPages; page++)
        {
            tasks.Add(FetchRawgPageAsync(baseParams, page, ct));
        }

        var responses = await Task.WhenAll(tasks);

        foreach (var response in responses.Where(r => r != null))
        {
            if (response!.results != null)
            {
                games.AddRange(response.results.Select(MapRawgGameToDiscoverItem));
            }
        }

        // Limitar ao número solicitado
        var result = games.Take(req.limit).ToList();

        // Cache por tempo configurado
        _cache.Set(cacheKey, result, TimeSpan.FromMinutes(_opts.CacheMinutes));

        return result;
    }

    private async Task<RawgDiscoverResponse?> FetchRawgPageAsync(Dictionary<string, string> baseParams, int page, CancellationToken ct)
    {
        try
        {
            var queryParams = new Dictionary<string, string>(baseParams) { ["page"] = page.ToString() };
            var queryString = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
            var url = $"/games?{queryString}";

            using var response = await _http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                _log.LogWarning("RAWG discover page {Page} failed: {Status}", page, response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(ct);
            return JsonSerializer.Deserialize<RawgDiscoverResponse>(json, _json);
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Error fetching RAWG page {Page}", page);
            return null;
        }
    }

    private static DiscoverItem MapRawgGameToDiscoverItem(RawgDiscoverGame game)
    {
        var why = new List<string>();

        if (game.metacritic.HasValue)
            why.Add($"Metacritic {game.metacritic.Value}");
        if (game.rating.HasValue)
            why.Add($"Crítica alta (RAWG {game.rating.Value:F1})");
        if (game.genres?.Length > 0)
            why.Add($"Combina com: {string.Join(", ", game.genres.Take(3).Select(g => g.name))}");

        return new DiscoverItem(
            appId: null,
            name: game.name ?? "Unknown Game",
            store: "RAWG",
            image: game.background_image ?? "",
            metacritic: game.metacritic,
            criticRating: game.rating,
            steamPositivePct: null,
            hltbMainHours: null,
            scoreTotal: 0, // Será calculado no CompositeCatalogService
            why: why.ToArray(),
            storeUrl: game.slug != null ? $"https://rawg.io/games/{game.slug}" : ""
        );
    }

    private static string GetRequestHash(DiscoverRequest req)
    {
        var key = $"{string.Join(",", req.vibe ?? Array.Empty<string>())}-{req.duration}-{req.energy}-{req.social}-{req.contentTone}-{req.limit}";
        return Convert.ToHexString(System.Security.Cryptography.MD5.HashData(System.Text.Encoding.UTF8.GetBytes(key)))[..16];
    }

    private static string Normalize(string s)
        => s.Trim().ToLowerInvariant()
             .Replace("™", "").Replace("®", "")
             .Replace("game of the year edition", "")
             .Replace("definitive edition", "")
             .Replace("remastered", "")
             .Replace("edition", "");

    // Similaridade bem simples: qtos tokens iguais (fallback ao contains)
    private static double Similarity(string a, string b)
    {
        var ta = a.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var tb = b.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (ta.Length == 0 || tb.Length == 0) return a.Contains(b, StringComparison.OrdinalIgnoreCase) ? 0.5 : 0;
        var inter = ta.Intersect(tb).Count();
        return (double)inter / Math.Max(ta.Length, tb.Length);
    }

    // ===== DTOs internos p/ desserialização =====
    private sealed record RawgDetailDto(
        int id,
        string? slug,
        int? metacritic,
        string? released,
        RawgNameDto[]? genres,
        RawgPlatformDto[]? platforms,
        RawgNameDto[]? tags
    );

    private sealed record RawgNameDto(string? name);
    private sealed record RawgPlatformDto(RawgPlatformObj? platform);
    private sealed record RawgPlatformObj(string? name);

    // DTOs para discover
    private sealed record RawgDiscoverResponse(RawgDiscoverGame[]? results);
    private sealed record RawgDiscoverGame(
        string? name,
        string? slug,
        string? background_image,
        int? metacritic,
        double? rating,
        RawgNameDto[]? genres
    );
}