using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Infrastructure.Providers;

internal sealed class IgdbService : IIgdbService
{
    private readonly HttpClient _http;
    private readonly IgdbOptions _opts;
    private readonly IMemoryCache _cache;
    private readonly ILogger<IgdbService> _log;
    private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    // Mapeamento de vibes para keywords/genres do IGDB
    private static readonly Dictionary<string, string[]> VibeMapping = new()
    {
        ["relax"] = ["cozy", "casual", "puzzle", "walking simulator"],
        ["historia"] = ["story rich", "narrative", "adventure", "rpg"],
        ["raiva"] = ["action", "shooter", "hack and slash", "fast-paced"],
        ["intelecto"] = ["puzzle", "strategy", "tactics", "mystery"],
        ["competitivo"] = ["pvp", "competitive", "multiplayer"],
        ["coop"] = ["co-op", "online co-op", "local co-op"],
        ["explorar"] = ["open world", "exploration", "survival", "crafting"],
        ["nostalgia"] = ["retro", "pixel graphics", "platformer", "metroidvania"],
        ["dificil"] = ["soulslike", "roguelike", "boss rush", "hard"],
        ["casual_rapido"] = ["roguelite", "arcade", "short"]
    };

    public IgdbService(HttpClient http, IOptions<IgdbOptions> opts, IMemoryCache cache, ILogger<IgdbService> log)
    {
        _http = http;
        _opts = opts.Value;
        _cache = cache;
        _log = log;
        if (_http.BaseAddress is null)
            _http.BaseAddress = new Uri(_opts.BaseUrl);
        _http.Timeout = TimeSpan.FromSeconds(15);
    }

    public async Task<string> GetTokenAsync(CancellationToken ct = default)
    {
        const string cacheKey = "igdb:token";
        if (_cache.TryGetValue(cacheKey, out string? cached) && !string.IsNullOrEmpty(cached))
            return cached;

        var tokenRequest = new
        {
            client_id = _opts.ClientId,
            client_secret = _opts.ClientSecret,
            grant_type = "client_credentials"
        };

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("client_id", _opts.ClientId),
            new KeyValuePair<string, string>("client_secret", _opts.ClientSecret),
            new KeyValuePair<string, string>("grant_type", "client_credentials")
        });

        using var response = await _http.PostAsync(_opts.TokenUrl, content, ct);
        if (!response.IsSuccessStatusCode)
        {
            _log.LogError("IGDB token request failed: {Status}", response.StatusCode);
            throw new HttpRequestException($"IGDB token request failed: {response.StatusCode}");
        }

        var tokenResponse = await response.Content.ReadFromJsonAsync<IgdbTokenResponse>(_json, ct);
        if (tokenResponse?.access_token is null)
        {
            _log.LogError("IGDB token response is invalid");
            throw new InvalidOperationException("IGDB token response is invalid");
        }

        // Cache por um pouco menos que o expires_in para evitar tokens expirados
        var cacheTime = TimeSpan.FromSeconds(tokenResponse.expires_in - 300); // 5 min buffer
        _cache.Set(cacheKey, tokenResponse.access_token, cacheTime);

        return tokenResponse.access_token;
    }

    public async Task<IReadOnlyList<DiscoverItem>> QueryGamesAsync(DiscoverRequest req, CancellationToken ct = default)
    {
        var token = await GetTokenAsync(ct);

        // Construir query APICalypse
        var query = BuildApiCalypseQuery(req);

        _http.DefaultRequestHeaders.Clear();
        _http.DefaultRequestHeaders.Add("Client-ID", _opts.ClientId);
        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

        var content = new StringContent(query, Encoding.UTF8, "text/plain");

        using var response = await _http.PostAsync("/games", content, ct);
        if (!response.IsSuccessStatusCode)
        {
            _log.LogWarning("IGDB games query failed: {Status}", response.StatusCode);
            return Array.Empty<DiscoverItem>();
        }

        var gamesJson = await response.Content.ReadAsStringAsync(ct);
        var games = JsonSerializer.Deserialize<IgdbGame[]>(gamesJson, _json);

        if (games is null)
            return Array.Empty<DiscoverItem>();

        return games.Select(MapToDiscoverItem).ToList();
    }

    private string BuildApiCalypseQuery(DiscoverRequest req)
    {
        var sb = new StringBuilder();

        // Fields necessários
        sb.AppendLine("fields name, rating, total_rating, first_release_date, genres.name, keywords.name, platforms.name, aggregated_rating, time_to_beat.*, cover.image_id, url;");

        // Filtros where
        var whereConditions = new List<string>();

        // Últimos 10 anos (aproximadamente)
        var tenYearsAgo = new DateTimeOffset(DateTime.UtcNow.AddYears(-10)).ToUnixTimeSeconds();
        whereConditions.Add($"first_release_date >= {tenYearsAgo}");

        // Filtros por vibe
        if (req.vibe?.Length > 0)
        {
            var keywords = req.vibe
                .Where(v => VibeMapping.ContainsKey(v))
                .SelectMany(v => VibeMapping[v])
                .Distinct()
                .Take(8) // Limitar para não sobrecarregar
                .ToArray();

            if (keywords.Length > 0)
            {
                var keywordCondition = string.Join(" | ", keywords.Select(k => $"keywords.name ~ \"{k}\""));
                whereConditions.Add($"({keywordCondition})");
            }
        }

        // Content tone - evitar pesado
        if (req.contentTone == "evitar_pesado")
        {
            whereConditions.Add("!(keywords.name ~ \"gore\" | keywords.name ~ \"psychological-horror\" | keywords.name ~ \"horror\")");
        }

        // Structure preferences
        if (req.structure == "campaign")
        {
            whereConditions.Add("(keywords.name ~ \"singleplayer\" | keywords.name ~ \"story-rich\")");
        }
        else if (req.structure == "replay")
        {
            whereConditions.Add("(keywords.name ~ \"roguelike\" | keywords.name ~ \"sandbox\")");
        }

        if (whereConditions.Count > 0)
        {
            sb.AppendLine($"where {string.Join(" & ", whereConditions)};");
        }

        // Ordenação e limite
        sb.AppendLine("sort total_rating desc, rating desc;");
        sb.AppendLine($"limit {Math.Min(100, req.limit)};");

        return sb.ToString();
    }

    private static DiscoverItem MapToDiscoverItem(IgdbGame game)
    {
        var imageUrl = game.cover?.image_id != null
            ? $"https://images.igdb.com/igdb/image/upload/t_cover_big/{game.cover.image_id}.jpg"
            : "";

        var hltbHours = game.time_to_beat?.normally != null
            ? game.time_to_beat.normally / 60.0 // minutos para horas
            : null;

        var criticRating = game.total_rating ?? game.rating;

        var why = new List<string>();
        if (criticRating.HasValue)
            why.Add($"Crítica alta (IGDB {criticRating.Value:F0})");
        if (hltbHours.HasValue)
            why.Add($"Main ~{hltbHours.Value:F0}h");
        if (game.genres?.Length > 0)
            why.Add($"Combina com: {string.Join(", ", game.genres.Take(3).Select(g => g.name))}");

        return new DiscoverItem(
            appId: null, // IGDB não tem Steam App ID direto
            name: game.name ?? "Unknown Game",
            store: "IGDB",
            image: imageUrl,
            metacritic: null, // IGDB não tem metacritic direto
            criticRating: criticRating,
            steamPosPct: null,
            hltbMainHours: hltbHours,
            scoreTotal: 0, // Será calculado no CompositeCatalogService
            why: why.ToArray(),
            storeUrl: game.url ?? ""
        );
    }

    // DTOs internos para desserialização
    private sealed record IgdbTokenResponse(string access_token, int expires_in);

    private sealed record IgdbGame(
        string? name,
        double? rating,
        double? total_rating,
        long? first_release_date,
        IgdbGenre[]? genres,
        IgdbKeyword[]? keywords,
        IgdbPlatform[]? platforms,
        double? aggregated_rating,
        IgdbTimeToBeat? time_to_beat,
        IgdbCover? cover,
        string? url
    );

    private sealed record IgdbGenre(string name);
    private sealed record IgdbKeyword(string name);
    private sealed record IgdbPlatform(string name);
    private sealed record IgdbTimeToBeat(int? normally, int? hastly, int? completely);
    private sealed record IgdbCover(string image_id);
}


