namespace NextPlay.Api.Api.DTOs;

public class UserPrefsRequest
{
    public string SteamId64 { get; set; } = string.Empty;
    public UserPreferencesDto Preferences { get; set; } = new();
    public QualityFloorDto? QualityFloor { get; set; }
}

public class UserPreferencesDto
{
    public string[] GenresFavoritos { get; set; } = Array.Empty<string>();
    public string[] TagsLike { get; set; } = Array.Empty<string>();
    public string[] TagsBlock { get; set; } = Array.Empty<string>();
    public bool PtbrOnly { get; set; }
    public bool ControllerPreferred { get; set; }
    public int[] MainHoursRange { get; set; } = new[] { 1, 100 };
}

public class QualityFloorDto
{
    public int? Metacritic { get; set; }
    public int? OpenCritic { get; set; }
    public int? SteamPositivePct { get; set; }
}



