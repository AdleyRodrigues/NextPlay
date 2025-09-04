using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Domain.Entities;
using NextPlay.Api.Infrastructure.Ef;

namespace NextPlay.Api.Infrastructure.Data;

public class GameSeeder
{
    private readonly NextPlayDbContext _context;
    private readonly ILogger<GameSeeder> _logger;

    public GameSeeder(NextPlayDbContext context, ILogger<GameSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedPopularGamesAsync()
    {
        _logger.LogInformation("🌱 Starting to seed popular games...");

        // Verificar se já temos jogos
        var existingCount = await _context.Games.CountAsync();
        if (existingCount > 100)
        {
            _logger.LogInformation("✅ Database already has {Count} games, skipping seed", existingCount);
            return;
        }

        var popularGames = GetPopularGamesSeed();

        foreach (var gameData in popularGames)
        {
            var existingGame = await _context.Games.FirstOrDefaultAsync(g => g.AppId == gameData.AppId);
            if (existingGame != null) continue;

            var game = new Game
            {
                AppId = gameData.AppId,
                Name = gameData.Name,
                ReleaseYear = gameData.ReleaseDate.Year,
                Genres = string.Join(",", gameData.Genres), // Converter array para string
                Tags = string.Join(",", gameData.Tags), // Converter array para string
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Adicionar scores se disponível
            if (gameData.MetacriticScore.HasValue || gameData.SteamScore.HasValue)
            {
                game.Scores = new Scores
                {
                    AppId = gameData.AppId,
                    Metacritic = gameData.MetacriticScore,
                    SteamPositivePct = gameData.SteamScore,
                    UpdatedAt = DateTime.UtcNow
                };
            }

            // Adicionar HLTB se disponível
            if (gameData.HltbMainHours.HasValue)
            {
                game.Hltb = new Hltb
                {
                    AppId = gameData.AppId,
                    MainMin = gameData.HltbMainHours * 60, // Converter horas para minutos
                    UpdatedAt = DateTime.UtcNow
                };
            }

            _context.Games.Add(game);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("✅ Seeded {Count} popular games successfully!", popularGames.Count);
    }

    private List<PopularGameSeed> GetPopularGamesSeed()
    {
        return new List<PopularGameSeed>
        {
            // 🎮 AÇÃO & AVENTURA
            new() { AppId = 292030, Name = "The Witcher 3: Wild Hunt", Description = "RPG de mundo aberto com história épica", ReleaseDate = new DateTime(2015, 5, 19), Genres = new[] { "RPG", "Adventure", "Open World" }, Tags = new[] { "Story Rich", "Fantasy", "Choices Matter" }, MetacriticScore = 93, SteamScore = 97, HltbMainHours = 52 },
            new() { AppId = 1245620, Name = "Elden Ring", Description = "Action RPG em mundo aberto dos criadores de Dark Souls", ReleaseDate = new DateTime(2022, 2, 25), Genres = new[] { "Action", "RPG", "Souls-like" }, Tags = new[] { "Difficult", "Fantasy", "Open World" }, MetacriticScore = 96, SteamScore = 92, HltbMainHours = 58 },
            new() { AppId = 1086940, Name = "Baldur's Gate 3", Description = "RPG tático baseado em D&D 5e", ReleaseDate = new DateTime(2023, 8, 3), Genres = new[] { "RPG", "Turn-Based", "Fantasy" }, Tags = new[] { "Story Rich", "Choices Matter", "Co-op" }, MetacriticScore = 96, SteamScore = 96, HltbMainHours = 75 },
            new() { AppId = 1174180, Name = "Red Dead Redemption 2", Description = "Aventura de faroeste em mundo aberto", ReleaseDate = new DateTime(2019, 12, 5), Genres = new[] { "Adventure", "Action", "Western" }, Tags = new[] { "Story Rich", "Open World", "Realistic" }, MetacriticScore = 97, SteamScore = 79, HltbMainHours = 50 },
            new() { AppId = 1593500, Name = "God of War", Description = "Aventura mitológica nórdica", ReleaseDate = new DateTime(2022, 1, 14), Genres = new[] { "Action", "Adventure", "Mythology" }, Tags = new[] { "Story Rich", "Hack and Slash", "Norse" }, MetacriticScore = 94, SteamScore = 97, HltbMainHours = 21 },

            // 🎯 COMPETITIVO & MULTIPLAYER
            new() { AppId = 730, Name = "Counter-Strike 2", Description = "FPS competitivo tático", ReleaseDate = new DateTime(2023, 9, 27), Genres = new[] { "FPS", "Competitive", "Tactical" }, Tags = new[] { "Multiplayer", "Esports", "Team-Based" }, SteamScore = 78 },
            new() { AppId = 1172470, Name = "Apex Legends", Description = "Battle Royale com heróis únicos", ReleaseDate = new DateTime(2020, 11, 4), Genres = new[] { "Battle Royale", "FPS", "Hero Shooter" }, Tags = new[] { "Free to Play", "Multiplayer", "Fast-Paced" }, MetacriticScore = 89, SteamScore = 78 },
            new() { AppId = 570, Name = "Dota 2", Description = "MOBA estratégico competitivo", ReleaseDate = new DateTime(2013, 7, 9), Genres = new[] { "MOBA", "Strategy", "Competitive" }, Tags = new[] { "Free to Play", "Esports", "Complex" }, MetacriticScore = 90, SteamScore = 82 },
            new() { AppId = 252490, Name = "Rust", Description = "Survival multiplayer hardcore", ReleaseDate = new DateTime(2018, 2, 8), Genres = new[] { "Survival", "Multiplayer", "Crafting" }, Tags = new[] { "PvP", "Base Building", "Hardcore" }, MetacriticScore = 69, SteamScore = 84 },

            // 🧘 RELAXANTE & CASUAL
            new() { AppId = 413150, Name = "Stardew Valley", Description = "Simulação de fazenda relaxante", ReleaseDate = new DateTime(2016, 2, 26), Genres = new[] { "Simulation", "Casual", "Farming" }, Tags = new[] { "Relaxing", "Pixel Graphics", "Co-op" }, MetacriticScore = 89, SteamScore = 98, HltbMainHours = 53 },
            new() { AppId = 105600, Name = "Terraria", Description = "Sandbox 2D de aventura e construção", ReleaseDate = new DateTime(2011, 5, 16), Genres = new[] { "Sandbox", "Adventure", "Survival" }, Tags = new[] { "2D", "Building", "Co-op" }, MetacriticScore = 81, SteamScore = 98, HltbMainHours = 51 },
            new() { AppId = 892970, Name = "Valheim", Description = "Survival cooperativo viking", ReleaseDate = new DateTime(2021, 2, 2), Genres = new[] { "Survival", "Co-op", "Building" }, Tags = new[] { "Vikings", "Exploration", "Crafting" }, MetacriticScore = 81, SteamScore = 94, HltbMainHours = 75 },
            new() { AppId = 244850, Name = "Space Engineers", Description = "Simulação de engenharia espacial", ReleaseDate = new DateTime(2019, 2, 28), Genres = new[] { "Simulation", "Building", "Space" }, Tags = new[] { "Physics", "Engineering", "Creative" }, MetacriticScore = 70, SteamScore = 85, HltbMainHours = 100 },

            // 🎲 ESTRATÉGIA & PUZZLE
            new() { AppId = 261550, Name = "Cities: Skylines", Description = "Simulador de construção de cidades", ReleaseDate = new DateTime(2015, 3, 10), Genres = new[] { "Simulation", "Strategy", "City Builder" }, Tags = new[] { "Building", "Management", "Relaxing" }, MetacriticScore = 85, SteamScore = 91, HltbMainHours = 75 },
            new() { AppId = 394360, Name = "Hearts of Iron IV", Description = "Grande estratégia da Segunda Guerra", ReleaseDate = new DateTime(2016, 6, 6), Genres = new[] { "Strategy", "Grand Strategy", "Historical" }, Tags = new[] { "World War II", "Complex", "Alternate History" }, MetacriticScore = 83, SteamScore = 91, HltbMainHours = 50 },
            new() { AppId = 236850, Name = "Europa Universalis IV", Description = "Grande estratégia histórica", ReleaseDate = new DateTime(2013, 8, 13), Genres = new[] { "Strategy", "Grand Strategy", "Historical" }, Tags = new[] { "Diplomacy", "Trade", "Complex" }, MetacriticScore = 87, SteamScore = 94, HltbMainHours = 100 },

            // 🎨 INDIES & CRIATIVOS
            new() { AppId = 367520, Name = "Hollow Knight", Description = "Metroidvania atmosférico", ReleaseDate = new DateTime(2017, 2, 24), Genres = new[] { "Metroidvania", "Indie", "Platformer" }, Tags = new[] { "Atmospheric", "Difficult", "Hand-drawn" }, MetacriticScore = 90, SteamScore = 97, HltbMainHours = 27 },
            new() { AppId = 648800, Name = "Raft", Description = "Survival cooperativo oceânico", ReleaseDate = new DateTime(2022, 6, 20), Genres = new[] { "Survival", "Co-op", "Building" }, Tags = new[] { "Ocean", "Crafting", "Exploration" }, MetacriticScore = 70, SteamScore = 94, HltbMainHours = 24 },
            new() { AppId = 418370, Name = "Subnautica", Description = "Survival subaquático atmosférico", ReleaseDate = new DateTime(2018, 1, 23), Genres = new[] { "Survival", "Adventure", "Underwater" }, Tags = new[] { "Atmospheric", "Exploration", "Sci-fi" }, MetacriticScore = 87, SteamScore = 93, HltbMainHours = 29 },

            // 🎮 CLÁSSICOS MODERNOS
            new() { AppId = 271590, Name = "Grand Theft Auto V", Description = "Ação em mundo aberto", ReleaseDate = new DateTime(2015, 4, 14), Genres = new[] { "Action", "Crime", "Open World" }, Tags = new[] { "Mature", "Multiplayer", "Driving" }, MetacriticScore = 97, SteamScore = 83, HltbMainHours = 31 },
            new() { AppId = 1091500, Name = "Cyberpunk 2077", Description = "RPG futurístico em Night City", ReleaseDate = new DateTime(2020, 12, 10), Genres = new[] { "RPG", "Cyberpunk", "Open World" }, Tags = new[] { "Futuristic", "Story Rich", "Customization" }, MetacriticScore = 86, SteamScore = 78, HltbMainHours = 25 },
            new() { AppId = 377160, Name = "Fallout 4", Description = "RPG pós-apocalíptico", ReleaseDate = new DateTime(2015, 11, 10), Genres = new[] { "RPG", "Post-apocalyptic", "Open World" }, Tags = new[] { "Crafting", "Settlement Building", "Retro Futuristic" }, MetacriticScore = 84, SteamScore = 82, HltbMainHours = 27 }
        };
    }
}

public class PopularGameSeed
{
    public int AppId { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime ReleaseDate { get; set; }
    public string[] Genres { get; set; } = Array.Empty<string>();
    public string[] Tags { get; set; } = Array.Empty<string>();
    public int? MetacriticScore { get; set; }
    public int? SteamScore { get; set; }
    public int? HltbMainHours { get; set; }
}
