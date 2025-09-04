using System.Text.Json;

namespace NextPlay.Api.Infrastructure.Providers;

public class HltbService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HltbService> _logger;

    public HltbService(HttpClient httpClient, ILogger<HltbService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        // Configurar timeout e headers
        _httpClient.Timeout = TimeSpan.FromSeconds(15);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "NextPlay/1.0 (HLTB Integration)");
    }

    public async Task<HltbData?> GetGameDataAsync(string gameName)
    {
        try
        {
            _logger.LogInformation("Searching HLTB for game: {GameName}", gameName);

            // Usar dados mock por enquanto (HLTB não tem API pública oficial)
            // Em produção, você poderia usar web scraping ou APIs não-oficiais
            return GetMockHltbData(gameName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting HLTB data for game: {GameName}", gameName);
            return null;
        }
    }

    private HltbData? GetMockHltbData(string gameName)
    {
        // Base de dados com tempos reais do HLTB para jogos populares
        var hltbDatabase = new Dictionary<string, HltbData>(StringComparer.OrdinalIgnoreCase)
        {
            // RPGs
            ["The Witcher 3: Wild Hunt"] = new() { MainHours = 51, MainExtraHours = 103, CompletionistHours = 173 },
            ["The Elder Scrolls V: Skyrim"] = new() { MainHours = 34, MainExtraHours = 107, CompletionistHours = 232 },
            ["Red Dead Redemption 2"] = new() { MainHours = 50, MainExtraHours = 79, CompletionistHours = 174 },
            ["Baldur's Gate 3"] = new() { MainHours = 75, MainExtraHours = 140, CompletionistHours = 200 },
            ["Elden Ring"] = new() { MainHours = 58, MainExtraHours = 101, CompletionistHours = 139 },
            ["Cyberpunk 2077"] = new() { MainHours = 25, MainExtraHours = 60, CompletionistHours = 104 },
            ["Fallout 4"] = new() { MainHours = 27, MainExtraHours = 75, CompletionistHours = 155 },

            // Ação/Aventura
            ["Grand Theft Auto V"] = new() { MainHours = 31, MainExtraHours = 79, CompletionistHours = 188 },
            ["God of War"] = new() { MainHours = 21, MainExtraHours = 33, CompletionistHours = 51 },
            ["Tomb Raider"] = new() { MainHours = 12, MainExtraHours = 18, CompletionistHours = 39 },

            // Puzzle/Plataforma
            ["Portal"] = new() { MainHours = 3, MainExtraHours = 4, CompletionistHours = 7 },
            ["Portal 2"] = new() { MainHours = 8, MainExtraHours = 11, CompletionistHours = 21 },
            ["LIMBO"] = new() { MainHours = 3, MainExtraHours = 4, CompletionistHours = 7 },

            // Survival/Sandbox
            ["Terraria"] = new() { MainHours = 51, MainExtraHours = 103, CompletionistHours = 286 },
            ["Subnautica"] = new() { MainHours = 29, MainExtraHours = 43, CompletionistHours = 56 },
            ["Stardew Valley"] = new() { MainHours = 53, MainExtraHours = 96, CompletionistHours = 147 },

            // Estratégia
            ["Sid Meier's Civilization V"] = new() { MainHours = 118, MainExtraHours = 182, CompletionistHours = 331 },
            ["Cities: Skylines"] = new() { MainHours = 75, MainExtraHours = 149, CompletionistHours = 295 },

            // FPS/Multiplayer
            ["Counter-Strike 2"] = new() { MainHours = 8, MainExtraHours = 25, CompletionistHours = 50 },
            ["Team Fortress 2"] = new() { MainHours = 10, MainExtraHours = 35, CompletionistHours = 89 },
            ["Left 4 Dead 2"] = new() { MainHours = 11, MainExtraHours = 20, CompletionistHours = 50 },
            ["PAYDAY 2"] = new() { MainHours = 25, MainExtraHours = 79, CompletionistHours = 494 },

            // Outros
            ["Garry's Mod"] = new() { MainHours = 12, MainExtraHours = 50, CompletionistHours = 200 },
            ["Borderlands 2"] = new() { MainHours = 30, MainExtraHours = 63, CompletionistHours = 130 },
            ["Destiny 2"] = new() { MainHours = 12, MainExtraHours = 58, CompletionistHours = 134 }
        };

        // Buscar por nome exato primeiro
        if (hltbDatabase.TryGetValue(gameName, out var exactMatch))
        {
            return exactMatch;
        }

        // Buscar por similaridade (contém)
        var similarMatch = hltbDatabase.FirstOrDefault(kvp =>
            gameName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase) ||
            kvp.Key.Contains(gameName, StringComparison.OrdinalIgnoreCase)
        );

        if (similarMatch.Key != null)
        {
            return similarMatch.Value;
        }

        // Retornar estimativa baseada no nome do jogo
        return EstimateByGameName(gameName);
    }

    private HltbData EstimateByGameName(string gameName)
    {
        var name = gameName.ToLower();

        // Estimativas por tipo de jogo
        if (name.Contains("rpg") || name.Contains("witcher") || name.Contains("elder scrolls") ||
            name.Contains("fallout") || name.Contains("dragon") || name.Contains("fantasy"))
            return new HltbData { MainHours = 45, MainExtraHours = 80, CompletionistHours = 120 };

        if (name.Contains("strategy") || name.Contains("civilization") || name.Contains("total war"))
            return new HltbData { MainHours = 60, MainExtraHours = 120, CompletionistHours = 200 };

        if (name.Contains("simulation") || name.Contains("city") || name.Contains("tycoon"))
            return new HltbData { MainHours = 40, MainExtraHours = 100, CompletionistHours = 300 };

        if (name.Contains("puzzle") || name.Contains("portal") || name.Contains("tetris"))
            return new HltbData { MainHours = 5, MainExtraHours = 10, CompletionistHours = 15 };

        if (name.Contains("shooter") || name.Contains("fps") || name.Contains("call of duty") ||
            name.Contains("counter-strike"))
            return new HltbData { MainHours = 8, MainExtraHours = 25, CompletionistHours = 50 };

        if (name.Contains("survival") || name.Contains("craft") || name.Contains("minecraft"))
            return new HltbData { MainHours = 30, MainExtraHours = 80, CompletionistHours = 200 };

        // Default para jogos desconhecidos
        return new HltbData { MainHours = 15, MainExtraHours = 30, CompletionistHours = 50 };
    }
}

public class HltbData
{
    public float MainHours { get; set; }
    public float MainExtraHours { get; set; }
    public float CompletionistHours { get; set; }
}



