namespace NextPlay.Api.Infrastructure.Providers;

public class RawgOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.rawg.io/api";
    public int CacheHours { get; set; } = 24;
    public int CacheMinutes { get; set; } = 30;
    public int SearchPageSize { get; set; } = 40;
}
