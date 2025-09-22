namespace NextPlay.Api.Api.DTOs;

public class RecommendRequest
{
    public string SteamId64 { get; set; } = string.Empty;
    public string Vibe { get; set; } = string.Empty; // relaxar | historia | acao | etc
    public string Time { get; set; } = string.Empty; // curto | medio | longo
    public string Energy { get; set; } = "normal"; // baixa | media | alta
    public string Lang { get; set; } = "indiferente"; // dublado | legendado | indiferente
    public int Limit { get; set; } = 20;
}
