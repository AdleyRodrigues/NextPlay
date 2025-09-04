namespace NextPlay.Api.Api.DTOs;

public class RecommendRequest
{
    public string SteamId64 { get; set; } = string.Empty;
    public string[] Vibe { get; set; } = Array.Empty<string>(); // relax | historia | raiva | etc
    public string Duration { get; set; } = string.Empty; // rapido | medio | longo | muito_longo | tanto_faz
    public string Energy { get; set; } = "normal"; // baixa | normal | alta
    public string Social { get; set; } = "solo"; // solo | coop | pvp
    public string ContentTone { get; set; } = "indiferente"; // evitar_pesado | indiferente | topa_pesado
    public bool ControllerPreferred { get; set; }
    public string Lang { get; set; } = "ptbr_pref"; // ptbr_only | ptbr_pref | indiferente
    public string Structure { get; set; } = "campaign"; // campaign | replay
    public string[] Flavors { get; set; } = Array.Empty<string>();
    public int Limit { get; set; } = 12;
}
