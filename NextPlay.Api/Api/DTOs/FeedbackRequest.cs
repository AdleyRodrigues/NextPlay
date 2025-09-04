namespace NextPlay.Api.Api.DTOs;

public class FeedbackRequest
{
    public string SteamId64 { get; set; } = string.Empty;
    public int AppId { get; set; }
    public string Action { get; set; } = string.Empty; // Like | Dislike | Snooze
}



