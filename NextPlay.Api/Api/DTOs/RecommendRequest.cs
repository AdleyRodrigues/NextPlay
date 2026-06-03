namespace NextPlay.Api.Api.DTOs;

public class RecommendRequest
{
    public int PlatformId { get; set; } = 4; // e.g. 187 (PS5), 18 (PS4), 1 (Xbox One), 4 (PC)
    public string Skill { get; set; } = string.Empty; // logica | reflexos | paciencia | planejamento | cooperacao
    public string Time { get; set; } = string.Empty; // curto | medio | longo
    public int Limit { get; set; } = 20;
    public int? MinYear { get; set; }
    public int? MaxYear { get; set; }
    public List<string>? Vibes { get; set; }
    public bool? IsMultiplayer { get; set; }
}
