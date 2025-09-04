namespace NextPlay.Api.Infrastructure.Providers;

public class IgdbOptions
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.igdb.com/v4";
    public string TokenUrl { get; set; } = "https://id.twitch.tv/oauth2/token";
    public int CacheHours { get; set; } = 24;
}


