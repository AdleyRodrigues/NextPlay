using NextPlay.Api.Domain.Entities;
using NextPlay.Api.Infrastructure.Ef;

namespace NextPlay.Api.Endpoints;

public static class DevEndpoints
{
    public static void MapDevEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api")
            .WithTags("Development")
            .WithOpenApi();

        // POST /api/seed-data (temporary for testing)
        group.MapPost("/seed-data", SeedTestData)
            .WithName("SeedTestData")
            .WithSummary("Popula banco com dados de teste (apenas desenvolvimento)");
    }

    private static async Task<IResult> SeedTestData(NextPlayDbContext context)
    {
        try
        {
            // Check if data already exists
            if (context.Games.Any())
            {
                return Results.Ok(new { message = "Data already exists", gamesCount = context.Games.Count() });
            }

            // Add test games
            var games = new[]
            {
                new Game { AppId = 367520, Name = "Hollow Knight", Genres = "Action,Adventure", Tags = "Metroidvania,Indie", ControllerFriendly = true, Languages = "English,Portuguese", ReleaseYear = 2017 },
                new Game { AppId = 413150, Name = "Stardew Valley", Genres = "Simulation,RPG", Tags = "Farming,Relaxing", ControllerFriendly = true, Languages = "English,Portuguese", ReleaseYear = 2016 },
                new Game { AppId = 1145360, Name = "Hades", Genres = "Action,Roguelike", Tags = "Action,Roguelike", ControllerFriendly = true, Languages = "English,Portuguese", ReleaseYear = 2020 },
                new Game { AppId = 632470, Name = "Disco Elysium", Genres = "RPG", Tags = "Story Rich,Choices Matter", ControllerFriendly = false, Languages = "English", ReleaseYear = 2019 },
                new Game { AppId = 504230, Name = "Celeste", Genres = "Platformer,Indie", Tags = "Platformer,Difficult", ControllerFriendly = true, Languages = "English,Portuguese", ReleaseYear = 2018 }
            };

            context.Games.AddRange(games);

            // Add test scores
            var scores = new[]
            {
                new Scores { AppId = 367520, Metacritic = 90, OpenCritic = 84, SteamPositivePct = 97, UpdatedAt = DateTime.UtcNow },
                new Scores { AppId = 413150, Metacritic = 89, OpenCritic = 86, SteamPositivePct = 98, UpdatedAt = DateTime.UtcNow },
                new Scores { AppId = 1145360, Metacritic = 93, OpenCritic = 84, SteamPositivePct = 98, UpdatedAt = DateTime.UtcNow },
                new Scores { AppId = 632470, Metacritic = 97, OpenCritic = 91, SteamPositivePct = 95, UpdatedAt = DateTime.UtcNow },
                new Scores { AppId = 504230, Metacritic = 94, OpenCritic = 92, SteamPositivePct = 97, UpdatedAt = DateTime.UtcNow }
            };

            context.Scores.AddRange(scores);

            // Add test HLTB data
            var hltbData = new[]
            {
                new Hltb { AppId = 367520, MainMin = 27 * 60, MainExtraMin = 43 * 60, CompletionistMin = 62 * 60, UpdatedAt = DateTime.UtcNow },
                new Hltb { AppId = 413150, MainMin = 53 * 60, MainExtraMin = 96 * 60, CompletionistMin = 158 * 60, UpdatedAt = DateTime.UtcNow },
                new Hltb { AppId = 1145360, MainMin = 22 * 60, MainExtraMin = 38 * 60, CompletionistMin = 95 * 60, UpdatedAt = DateTime.UtcNow },
                new Hltb { AppId = 632470, MainMin = 21 * 60, MainExtraMin = 30 * 60, CompletionistMin = 35 * 60, UpdatedAt = DateTime.UtcNow },
                new Hltb { AppId = 504230, MainMin = 8 * 60, MainExtraMin = 12 * 60, CompletionistMin = 37 * 60, UpdatedAt = DateTime.UtcNow }
            };

            context.Hltbs.AddRange(hltbData);

            await context.SaveChangesAsync();

            return Results.Ok(new
            {
                message = "Test data seeded successfully",
                gamesAdded = games.Length
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { code = "SEED_ERROR", message = ex.Message });
        }
    }
}
