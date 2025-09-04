using System.Text.Json;

namespace NextPlay.Api.Infrastructure.Providers;

public class SteamApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SteamApiService> _logger;
    private readonly string _apiKey;

    public SteamApiService(HttpClient httpClient, IConfiguration configuration, ILogger<SteamApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = configuration["Steam:ApiKey"] ?? throw new InvalidOperationException("Steam API Key not configured");

        _httpClient.Timeout = TimeSpan.FromSeconds(30);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "NextPlay/1.0 (game-recommendation-bot)");
    }

    public async Task<SteamLibraryResponse?> GetUserLibraryAsync(string steamId64)
    {
        try
        {
            _logger.LogInformation("Fetching Steam library for user {SteamId64}", steamId64);

            var url = $"https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={_apiKey}&steamid={steamId64}&format=json&include_appinfo=true&include_played_free_games=true";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Steam API returned {StatusCode} for user {SteamId64}", response.StatusCode, steamId64);
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            var steamResponse = JsonSerializer.Deserialize<SteamApiResponse<SteamLibraryResponse>>(jsonContent);

            if (steamResponse?.Response?.Games == null)
            {
                _logger.LogWarning("No games found in Steam library for user {SteamId64}", steamId64);
                return null;
            }

            _logger.LogInformation("Found {Count} games in Steam library for user {SteamId64}",
                steamResponse.Response.Games.Count, steamId64);

            return steamResponse.Response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Steam library for user {SteamId64}", steamId64);
            return null;
        }
    }

    public async Task<SteamPlayerAchievementsResponse?> GetPlayerAchievementsAsync(string steamId64, int appId)
    {
        try
        {
            var url = $"https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={appId}&key={_apiKey}&steamid={steamId64}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            var steamResponse = JsonSerializer.Deserialize<SteamApiResponse<SteamPlayerAchievementsResponse>>(jsonContent);

            return steamResponse?.Response;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching achievements for user {SteamId64}, app {AppId}", steamId64, appId);
            return null;
        }
    }

    public async Task<SteamGameStatsResponse?> GetGameStatsAsync(string steamId64, int appId)
    {
        try
        {
            var url = $"https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid={appId}&key={_apiKey}&steamid={steamId64}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            var steamResponse = JsonSerializer.Deserialize<SteamApiResponse<SteamGameStatsResponse>>(jsonContent);

            return steamResponse?.Response;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error fetching game stats for user {SteamId64}, app {AppId}", steamId64, appId);
            return null;
        }
    }
}

// DTOs para a Steam API
public class SteamApiResponse<T>
{
    public T? Response { get; set; }
}

public class SteamLibraryResponse
{
    public int GameCount { get; set; }
    public List<SteamGame> Games { get; set; } = new();
}

public class SteamGame
{
    public int AppId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int PlaytimeForever { get; set; } // em minutos
    public int PlaytimeWindowsForever { get; set; }
    public int PlaytimeMacForever { get; set; }
    public int PlaytimeLinuxForever { get; set; }
    public int PlaytimeDisconnected { get; set; }
    public int RtimeLastPlayed { get; set; } // Unix timestamp
    public DateTime? LastPlayed => RtimeLastPlayed > 0 ? DateTimeOffset.FromUnixTimeSeconds(RtimeLastPlayed).DateTime : null;
    public string? ImgIconUrl { get; set; }
    public string? ImgLogoUrl { get; set; }
    public string? HeaderImage { get; set; }
    public bool HasCommunityVisibleStats { get; set; }
    public int Playtime2Weeks { get; set; }
}

public class SteamPlayerAchievementsResponse
{
    public SteamPlayer PlayerStats { get; set; } = new();
}

public class SteamPlayer
{
    public string SteamId { get; set; } = string.Empty;
    public string GameName { get; set; } = string.Empty;
    public List<SteamAchievement> Achievements { get; set; } = new();
    public bool Success { get; set; }
}

public class SteamAchievement
{
    public string ApiName { get; set; } = string.Empty;
    public int Achieved { get; set; } // 1 se desbloqueada, 0 se não
    public int UnlockTime { get; set; } // Unix timestamp
}

public class SteamGameStatsResponse
{
    public string SteamId { get; set; } = string.Empty;
    public string GameName { get; set; } = string.Empty;
    public List<SteamStat> Stats { get; set; } = new();
    public List<SteamAchievement> Achievements { get; set; } = new();
}

public class SteamStat
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
}
