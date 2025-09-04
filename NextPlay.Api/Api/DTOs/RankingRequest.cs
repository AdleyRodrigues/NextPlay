namespace NextPlay.Api.Api.DTOs;

public class RankingRequest
{
    public string SteamId64 { get; set; } = string.Empty;
    public RankingMode Mode { get; set; } = RankingMode.Jogar;
    public int Limit { get; set; } = 5;
}

public enum RankingMode
{
    Jogar,      // Começar algo novo
    Terminar,   // Voltar ao meio do caminho
    Zerar,      // Fechar a campanha
    Platinar    // 100% conquistas
}
