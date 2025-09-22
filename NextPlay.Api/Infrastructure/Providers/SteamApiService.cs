using System.Text.Json;
using System.Text.Json.Serialization;

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
            _logger.LogInformation("📄 [GetUserLibraryAsync] Raw Steam API response length: {Length} chars", jsonContent.Length);
            _logger.LogInformation("📄 [GetUserLibraryAsync] Raw Steam API response: {Response}", jsonContent);

            SteamApiResponse<SteamLibraryResponse>? steamResponse = null;
            try
            {
                _logger.LogInformation("🔄 [GetUserLibraryAsync] Starting JSON deserialization...");
                steamResponse = JsonSerializer.Deserialize<SteamApiResponse<SteamLibraryResponse>>(jsonContent);
                _logger.LogInformation("✅ [GetUserLibraryAsync] Deserialization successful!");
                _logger.LogInformation("📊 [GetUserLibraryAsync] Response structure - Response: {HasResponse}, GameCount: {GameCount}, Games: {HasGames}, Count: {Count}",
                    steamResponse?.Response != null,
                    steamResponse?.Response?.GameCount ?? 0,
                    steamResponse?.Response?.Games != null,
                    steamResponse?.Response?.Games?.Count ?? 0);

                if (steamResponse?.Response?.Games == null)
                {
                    _logger.LogWarning("⚠️ [GetUserLibraryAsync] No games found in Steam library for user {SteamId64}", steamId64);
                    _logger.LogWarning("⚠️ [GetUserLibraryAsync] Response was null or empty: Response={Response}, Games={Games}",
                        steamResponse?.Response == null ? "NULL" : "NOT NULL",
                        steamResponse?.Response?.Games == null ? "NULL" : $"NOT NULL (Count: {steamResponse.Response.Games.Count})");
                    return null;
                }

                _logger.LogInformation("🎮 [GetUserLibraryAsync] SUCCESS! Found {Count} games in Steam library for user {SteamId64}",
                    steamResponse.Response.Games.Count, steamId64);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "💥 [GetUserLibraryAsync] Error deserializing Steam API response");
                _logger.LogError("💥 [GetUserLibraryAsync] JSON content that failed: {JsonContent}", jsonContent);
                return null;
            }

            return steamResponse?.Response;
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
            _logger.LogInformation("🏆 [GetPlayerAchievementsAsync] Fetching achievements for user {SteamId64}, app {AppId}", steamId64, appId);

            var url = $"https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid={appId}&key={_apiKey}&steamid={steamId64}";

            _logger.LogInformation("🏆 [GetPlayerAchievementsAsync] URL: {Url}", url);

            var response = await _httpClient.GetAsync(url);
            _logger.LogInformation("🏆 [GetPlayerAchievementsAsync] Response status: {StatusCode}", response.StatusCode);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("🏆 [GetPlayerAchievementsAsync] Steam API returned {StatusCode} for achievements", response.StatusCode);
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("🏆 [GetPlayerAchievementsAsync] Raw response length: {Length} chars", jsonContent.Length);
            _logger.LogInformation("🏆 [GetPlayerAchievementsAsync] Raw response: {Response}", jsonContent);

            // A resposta da Steam API tem estrutura: {"playerstats": {...}}
            // Precisamos deserializar diretamente para SteamPlayerAchievementsResponse
            var steamResponse = JsonSerializer.Deserialize<SteamPlayerAchievementsResponse>(jsonContent);

            if (steamResponse?.PlayerStats != null)
            {
                var totalAchievements = steamResponse.PlayerStats.Achievements?.Count ?? 0;
                var unlockedAchievements = steamResponse.PlayerStats.Achievements?.Count(a => a.Achieved == 1) ?? 0;
                _logger.LogInformation("🏆 [GetPlayerAchievementsAsync] Successfully parsed: {Unlocked}/{Total} achievements", unlockedAchievements, totalAchievements);
            }
            else
            {
                _logger.LogWarning("🏆 [GetPlayerAchievementsAsync] No player stats found in response");
            }

            return steamResponse;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "🏆 [GetPlayerAchievementsAsync] Error fetching achievements for user {SteamId64}, app {AppId}", steamId64, appId);
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

    public async Task<SteamPlayerSummary?> GetPlayerSummaryAsync(string steamId64)
    {
        try
        {
            _logger.LogInformation("🔍 [GetPlayerSummaryAsync] Starting - SteamId64: {SteamId64}", steamId64);
            _logger.LogInformation("🔑 [GetPlayerSummaryAsync] API Key configured: {HasApiKey}", !string.IsNullOrEmpty(_apiKey));

            var url = $"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={_apiKey}&steamids={steamId64}";
            _logger.LogInformation("🌐 [GetPlayerSummaryAsync] Request URL: {Url}", url.Replace(_apiKey, "***API_KEY***"));

            var response = await _httpClient.GetAsync(url);
            _logger.LogInformation("📡 [GetPlayerSummaryAsync] HTTP Response Status: {StatusCode}", response.StatusCode);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("❌ [GetPlayerSummaryAsync] Steam API returned {StatusCode} for player summary {SteamId64}", response.StatusCode, steamId64);
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("📄 [GetPlayerSummaryAsync] Raw Steam API response length: {Length} chars", jsonContent.Length);
            _logger.LogInformation("📄 [GetPlayerSummaryAsync] Raw Steam API response: {Response}", jsonContent);

            try
            {
                _logger.LogInformation("🔄 [GetPlayerSummaryAsync] Starting JSON deserialization...");
                var steamResponse = JsonSerializer.Deserialize<SteamPlayerSummariesResponse>(jsonContent);
                _logger.LogInformation("✅ [GetPlayerSummaryAsync] Deserialization successful!");
                _logger.LogInformation("📊 [GetPlayerSummaryAsync] Response structure - Response: {HasResponse}, Players: {HasPlayers}, Count: {Count}",
                    steamResponse?.Response != null,
                    steamResponse?.Response?.Players != null,
                    steamResponse?.Response?.Players?.Count ?? 0);

                if (steamResponse?.Response?.Players == null || !steamResponse.Response.Players.Any())
                {
                    _logger.LogWarning("⚠️ [GetPlayerSummaryAsync] No player summary found for user {SteamId64}", steamId64);
                    _logger.LogWarning("⚠️ [GetPlayerSummaryAsync] Response was null or empty: Response={Response}, Players={Players}",
                        steamResponse?.Response == null ? "NULL" : "NOT NULL",
                        steamResponse?.Response?.Players == null ? "NULL" : $"NOT NULL (Count: {steamResponse.Response.Players.Count})");
                    return null;
                }

                var player = steamResponse.Response.Players.First();
                _logger.LogInformation("🎮 [GetPlayerSummaryAsync] SUCCESS! Found player: {PersonaName} (SteamId: {SteamId})", player.PersonaName, player.SteamId);
                _logger.LogInformation("🎮 [GetPlayerSummaryAsync] Player details - Avatar: {Avatar}, ProfileUrl: {ProfileUrl}, Country: {Country}",
                    player.Avatar, player.ProfileUrl, player.LocCountryCode);

                return player;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "💥 [GetPlayerSummaryAsync] Error deserializing Steam API response");
                _logger.LogError("💥 [GetPlayerSummaryAsync] JSON content that failed: {JsonContent}", jsonContent);
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "💥 [GetPlayerSummaryAsync] Error fetching player summary for user {SteamId64}", steamId64);
            return null;
        }
    }

    public async Task<SteamReviewsResponse?> GetGameReviewsAsync(int appId, int numPerPage = 3)
    {
        try
        {
            _logger.LogInformation("📝 [GetGameReviewsAsync] Fetching reviews for app {AppId}", appId);

            var url = $"https://store.steampowered.com/appreviews/{appId}?json=1&language=portuguese&num_per_page={numPerPage}&review_type=all&purchase_type=all&filter=all";

            _logger.LogInformation("📝 [GetGameReviewsAsync] URL: {Url}", url);

            var response = await _httpClient.GetAsync(url);
            _logger.LogInformation("📝 [GetGameReviewsAsync] Response status: {StatusCode}", response.StatusCode);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("📝 [GetGameReviewsAsync] Steam Store API returned {StatusCode} for reviews", response.StatusCode);
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            _logger.LogInformation("📝 [GetGameReviewsAsync] Raw response length: {Length} chars", jsonContent.Length);

            var steamResponse = JsonSerializer.Deserialize<SteamReviewsResponse>(jsonContent);

            if (steamResponse?.Reviews != null)
            {
                _logger.LogInformation("📝 [GetGameReviewsAsync] Successfully parsed {Count} reviews", steamResponse.Reviews.Count);
            }
            else
            {
                _logger.LogWarning("📝 [GetGameReviewsAsync] No reviews found in response");
            }

            return steamResponse;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "📝 [GetGameReviewsAsync] Error fetching reviews for app {AppId}", appId);
            return null;
        }
    }
}

public class SteamReviewsResponse
{
    [JsonPropertyName("success")]
    public int Success { get; set; }

    [JsonPropertyName("query_summary")]
    public SteamQuerySummary QuerySummary { get; set; } = new();

    [JsonPropertyName("reviews")]
    public List<SteamReview> Reviews { get; set; } = new();
}

public class SteamQuerySummary
{
    [JsonPropertyName("num_reviews")]
    public int NumReviews { get; set; }

    [JsonPropertyName("review_score")]
    public int ReviewScore { get; set; }

    [JsonPropertyName("review_score_desc")]
    public string ReviewScoreDesc { get; set; } = string.Empty;

    [JsonPropertyName("total_positive")]
    public int TotalPositive { get; set; }

    [JsonPropertyName("total_negative")]
    public int TotalNegative { get; set; }

    [JsonPropertyName("total_reviews")]
    public int TotalReviews { get; set; }
}

public class SteamReview
{
    [JsonPropertyName("recommendationid")]
    public string RecommendationId { get; set; } = string.Empty;

    [JsonPropertyName("author")]
    public SteamReviewAuthor Author { get; set; } = new();

    [JsonPropertyName("review")]
    public string Review { get; set; } = string.Empty;

    [JsonPropertyName("timestamp_created")]
    public long TimestampCreated { get; set; }

    [JsonPropertyName("timestamp_updated")]
    public long TimestampUpdated { get; set; }

    [JsonPropertyName("voted_up")]
    public bool VotedUp { get; set; }

    [JsonPropertyName("votes_up")]
    public int VotesUp { get; set; }

    [JsonPropertyName("votes_funny")]
    public int VotesFunny { get; set; }

    [JsonPropertyName("weighted_vote_score")]
    [JsonConverter(typeof(StringOrNumberConverter))]
    public string WeightedVoteScore { get; set; } = string.Empty;

    [JsonPropertyName("comment_count")]
    public int CommentCount { get; set; }

    [JsonPropertyName("steam_purchase")]
    public bool SteamPurchase { get; set; }

    [JsonPropertyName("received_for_free")]
    public bool ReceivedForFree { get; set; }

    [JsonPropertyName("written_during_early_access")]
    public bool WrittenDuringEarlyAccess { get; set; }

    [JsonPropertyName("playtime_forever")]
    public int PlaytimeForever { get; set; }

    [JsonPropertyName("playtime_at_review")]
    public int PlaytimeAtReview { get; set; }

    [JsonPropertyName("playtime_last_two_weeks")]
    public int PlaytimeLastTwoWeeks { get; set; }

    [JsonPropertyName("last_played")]
    public long LastPlayed { get; set; }
}

public class SteamReviewAuthor
{
    [JsonPropertyName("steamid")]
    public string SteamId { get; set; } = string.Empty;

    [JsonPropertyName("num_games_owned")]
    public int NumGamesOwned { get; set; }

    [JsonPropertyName("num_reviews")]
    public int NumReviews { get; set; }

    [JsonPropertyName("playtime_forever")]
    public int PlaytimeForever { get; set; }

    [JsonPropertyName("playtime_last_two_weeks")]
    public int PlaytimeLastTwoWeeks { get; set; }

    [JsonPropertyName("last_played")]
    public long LastPlayed { get; set; }
}

public class StringOrNumberConverter : JsonConverter<string>
{
    public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            // Tenta diferentes tipos de número para lidar com valores grandes
            if (reader.TryGetInt32(out int intValue))
            {
                return intValue.ToString();
            }
            if (reader.TryGetInt64(out long longValue))
            {
                return longValue.ToString();
            }
            if (reader.TryGetDouble(out double doubleValue))
            {
                return doubleValue.ToString();
            }
            // Se nada funcionar, lê como string
            return reader.GetString() ?? "0";
        }
        if (reader.TokenType == JsonTokenType.String)
        {
            return reader.GetString() ?? string.Empty;
        }
        throw new JsonException($"Unable to convert {reader.TokenType} to string");
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}

// DTOs para a Steam API
public class SteamApiResponse<T>
{
    [JsonPropertyName("response")]
    public T? Response { get; set; }
}

public class SteamLibraryResponse
{
    [JsonPropertyName("game_count")]
    public int GameCount { get; set; }

    [JsonPropertyName("games")]
    public List<SteamGame> Games { get; set; } = new();
}

public class SteamGame
{
    [JsonPropertyName("appid")]
    public int AppId { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("playtime_forever")]
    public int PlaytimeForever { get; set; } // em minutos

    [JsonPropertyName("playtime_windows_forever")]
    public int PlaytimeWindowsForever { get; set; }

    [JsonPropertyName("playtime_mac_forever")]
    public int PlaytimeMacForever { get; set; }

    [JsonPropertyName("playtime_linux_forever")]
    public int PlaytimeLinuxForever { get; set; }

    [JsonPropertyName("playtime_disconnected")]
    public int PlaytimeDisconnected { get; set; }

    [JsonPropertyName("rtime_last_played")]
    public int RtimeLastPlayed { get; set; } // Unix timestamp

    public DateTime? LastPlayed => RtimeLastPlayed > 0 ? DateTimeOffset.FromUnixTimeSeconds(RtimeLastPlayed).DateTime : null;

    [JsonPropertyName("img_icon_url")]
    public string? ImgIconUrl { get; set; }

    [JsonPropertyName("img_logo_url")]
    public string? ImgLogoUrl { get; set; }

    [JsonPropertyName("header_image")]
    public string? HeaderImage { get; set; }

    [JsonPropertyName("has_community_visible_stats")]
    public bool HasCommunityVisibleStats { get; set; }

    [JsonPropertyName("playtime_2weeks")]
    public int Playtime2Weeks { get; set; }
}

public class SteamPlayerAchievementsResponse
{
    [JsonPropertyName("playerstats")]
    public SteamPlayer PlayerStats { get; set; } = new();
}

public class SteamPlayer
{
    [JsonPropertyName("steamID")]
    public string SteamId { get; set; } = string.Empty;

    [JsonPropertyName("gameName")]
    public string GameName { get; set; } = string.Empty;

    [JsonPropertyName("achievements")]
    public List<SteamAchievement> Achievements { get; set; } = new();

    [JsonPropertyName("success")]
    public bool Success { get; set; }
}

public class SteamAchievement
{
    [JsonPropertyName("apiname")]
    public string ApiName { get; set; } = string.Empty;

    [JsonPropertyName("achieved")]
    public int Achieved { get; set; } // 1 se desbloqueada, 0 se não

    [JsonPropertyName("unlocktime")]
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

public class SteamPlayerSummariesResponse
{
    [JsonPropertyName("response")]
    public SteamPlayerSummaries Response { get; set; } = new();
}

public class SteamPlayerSummaries
{
    [JsonPropertyName("players")]
    public List<SteamPlayerSummary> Players { get; set; } = new();
}

public class SteamPlayerSummary
{
    [JsonPropertyName("steamid")]
    public string SteamId { get; set; } = string.Empty;

    [JsonPropertyName("communityvisibilitystate")]
    public int CommunityVisibilityState { get; set; }

    [JsonPropertyName("profilestate")]
    public int ProfileState { get; set; }

    [JsonPropertyName("personaname")]
    public string PersonaName { get; set; } = string.Empty;

    [JsonPropertyName("lastlogoff")]
    public int LastLogoff { get; set; }

    [JsonPropertyName("commentpermission")]
    public int CommentPermission { get; set; }

    [JsonPropertyName("profileurl")]
    public string ProfileUrl { get; set; } = string.Empty;

    [JsonPropertyName("avatar")]
    public string Avatar { get; set; } = string.Empty;

    [JsonPropertyName("avatarmedium")]
    public string AvatarMedium { get; set; } = string.Empty;

    [JsonPropertyName("avatarfull")]
    public string AvatarFull { get; set; } = string.Empty;

    [JsonPropertyName("personastate")]
    public int PersonaState { get; set; }

    [JsonPropertyName("realname")]
    public string RealName { get; set; } = string.Empty;

    [JsonPropertyName("primaryclanid")]
    public string PrimaryClanId { get; set; } = string.Empty;

    [JsonPropertyName("timecreated")]
    public int TimeCreated { get; set; }

    [JsonPropertyName("personastateflags")]
    public int PersonaStateFlags { get; set; }

    [JsonPropertyName("loccountrycode")]
    public string LocCountryCode { get; set; } = string.Empty;

    [JsonPropertyName("locstatecode")]
    public string LocStateCode { get; set; } = string.Empty;

    [JsonPropertyName("loccityid")]
    public int LocCityId { get; set; }

    public DateTime? LastLogoffDate => LastLogoff > 0 ? DateTimeOffset.FromUnixTimeSeconds(LastLogoff).DateTime : null;
    public DateTime? CreatedDate => TimeCreated > 0 ? DateTimeOffset.FromUnixTimeSeconds(TimeCreated).DateTime : null;
    public bool IsOnline => PersonaState == 1;
    public bool IsAway => PersonaState == 2;
    public bool IsBusy => PersonaState == 3;
    public bool IsSnooze => PersonaState == 4;
    public bool IsLookingToTrade => PersonaState == 5;
    public bool IsLookingToPlay => PersonaState == 6;
}
