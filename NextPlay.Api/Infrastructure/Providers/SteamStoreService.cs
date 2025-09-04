using System.Text.Json;

namespace NextPlay.Api.Infrastructure.Providers;

public class SteamStoreService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SteamStoreService> _logger;

        public SteamStoreService(HttpClient httpClient, ILogger<SteamStoreService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        // Configurar timeout maior e headers
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "NextPlay/1.0 (compatible; game-recommendation-bot)");
    }

    public async Task<List<SteamGameDetails>> SearchGamesByGenreAsync(string[] genres, int limit = 50)
    {
        try
        {
            _logger.LogInformation("Starting Steam search for {Count} genres: {Genres} (limit: {Limit})",
                genres.Length, string.Join(", ", genres), limit);

            // Usar Steam Spy API para buscar jogos por gênero (mais confiável que Steam Store)
            var games = new List<SteamGameDetails>();

            foreach (var genre in genres.Take(3)) // Aumentar para 3 gêneros
            {
                var url = $"https://steamspy.com/api.php?request=genre&genre={genre.ToLower()}";
                _logger.LogInformation("Fetching Steam Spy data from: {Url}", url);

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Steam Spy API failed for genre {Genre}: {StatusCode}", genre, response.StatusCode);
                    continue;
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Steam Spy response length: {Length} chars", jsonContent.Length);

                var steamSpyData = JsonSerializer.Deserialize<Dictionary<string, SteamSpyGame>>(jsonContent);

                if (steamSpyData == null)
                {
                    _logger.LogWarning("Failed to deserialize Steam Spy data for genre {Genre}", genre);
                    continue;
                }

                _logger.LogInformation("Found {Count} games for genre {Genre}", steamSpyData.Count, genre);

                // Pegar os jogos mais populares do gênero
                var topGames = steamSpyData
                    .Where(kvp => kvp.Value.owners > 50000) // Reduzir threshold para mais jogos
                    .OrderByDescending(kvp => kvp.Value.owners)
                    .Take(Math.Max(limit / genres.Length, 5)) // Pelo menos 5 por gênero
                    .ToList();

                _logger.LogInformation("Selected {Count} top games for genre {Genre}", topGames.Count, genre);

                foreach (var game in topGames)
                {
                    try
                    {
                        var gameDetails = await GetGameDetailsAsync(int.Parse(game.Key));
                        if (gameDetails != null)
                        {
                            games.Add(gameDetails);
                            _logger.LogInformation("Successfully added game: {GameName} (AppId: {AppId})",
                                gameDetails.Name, gameDetails.AppId);
                        }
                        else
                        {
                            _logger.LogWarning("Failed to get details for AppId: {AppId}", game.Key);
                        }
                    }
                    catch (Exception gameEx)
                    {
                        _logger.LogWarning(gameEx, "Error processing game {AppId}: {GameName}", game.Key, game.Value.name);
                    }
                }
            }

            _logger.LogInformation("Total games found: {Count} (requested limit: {Limit})", games.Count, limit);
            return games.Take(limit).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching games by genre");
            return new List<SteamGameDetails>();
        }
    }

    public async Task<SteamGameDetails?> GetGameDetailsAsync(int appId)
    {
        try
        {
            var url = $"https://store.steampowered.com/api/appdetails?appids={appId}&l=portuguese";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var jsonContent = await response.Content.ReadAsStringAsync();
            var steamResponse = JsonSerializer.Deserialize<Dictionary<string, SteamAppDetailsResponse>>(jsonContent);

            if (steamResponse == null || !steamResponse.ContainsKey(appId.ToString()))
                return null;

            var appData = steamResponse[appId.ToString()];
            if (!appData.success || appData.data == null)
                return null;

            var data = appData.data;

            return new SteamGameDetails
            {
                AppId = appId,
                Name = data.name ?? "Unknown",
                Description = data.detailed_description ?? data.short_description ?? "",
                ReleaseDate = ParseReleaseDate(data.release_date?.date),
                Genres = data.genres?.Select(g => g.description).ToList() ?? new List<string>(),
                Categories = data.categories?.Select(c => c.description).ToList() ?? new List<string>(),
                Screenshots = data.screenshots?.Select(s => s.path_thumbnail).ToList() ?? new List<string>(),
                HeaderImage = data.header_image ?? "",
                IsFree = data.is_free,
                Price = data.price_overview?.final_formatted ?? "Free",
                Metacritic = data.metacritic?.score,
                Recommendations = data.recommendations?.total
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting game details for AppId {AppId}", appId);
            return null;
        }
    }

    private DateTime? ParseReleaseDate(string? dateString)
    {
        if (string.IsNullOrEmpty(dateString)) return null;

        if (DateTime.TryParse(dateString, out var date))
            return date;

        return null;
    }
}

// DTOs para Steam Store API
public class SteamSpyGame
{
    public int appid { get; set; }
    public string name { get; set; } = "";
    public int owners { get; set; }
    public int positive { get; set; }
    public int negative { get; set; }
}

public class SteamAppDetailsResponse
{
    public bool success { get; set; }
    public SteamAppData? data { get; set; }
}

public class SteamAppData
{
    public string? name { get; set; }
    public string? detailed_description { get; set; }
    public string? short_description { get; set; }
    public string? header_image { get; set; }
    public bool is_free { get; set; }
    public SteamReleaseDate? release_date { get; set; }
    public List<SteamGenre>? genres { get; set; }
    public List<SteamCategory>? categories { get; set; }
    public List<SteamScreenshot>? screenshots { get; set; }
    public SteamPriceOverview? price_overview { get; set; }
    public SteamMetacritic? metacritic { get; set; }
    public SteamRecommendations? recommendations { get; set; }
}

public class SteamReleaseDate
{
    public string? date { get; set; }
}

public class SteamGenre
{
    public string description { get; set; } = "";
}

public class SteamCategory
{
    public string description { get; set; } = "";
}

public class SteamScreenshot
{
    public string path_thumbnail { get; set; } = "";
}

public class SteamPriceOverview
{
    public string? final_formatted { get; set; }
}

public class SteamMetacritic
{
    public int score { get; set; }
}

public class SteamRecommendations
{
    public int total { get; set; }
}

public class SteamGameDetails
{
    public int AppId { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime? ReleaseDate { get; set; }
    public List<string> Genres { get; set; } = new();
    public List<string> Categories { get; set; } = new();
    public List<string> Screenshots { get; set; } = new();
    public string HeaderImage { get; set; } = "";
    public bool IsFree { get; set; }
    public string Price { get; set; } = "";
    public int? Metacritic { get; set; }
    public int? Recommendations { get; set; }
}
