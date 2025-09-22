using NextPlay.Api.Application.Catalog;
using NextPlay.Api.Infrastructure.Providers;

namespace NextPlay.Api.Endpoints;

public static class DiscoverEndpoints
{
    public static void MapDiscoverEndpoints(this WebApplication app)
    {
        app.MapPost("/api/discover", async (DiscoverRequest req, IGameCatalog catalog, CancellationToken ct) =>
        {
            // Validar e limitar o request
            var cappedLimit = Math.Clamp(req.limit, 1, 100);
            var validatedReq = req with { limit = cappedLimit };

            var items = await catalog.DiscoverAsync(validatedReq, ct);

            var response = new DiscoverResponse(
                generatedAt: DateTime.UtcNow.ToString("o"),
                count: items.Count,
                items: items
            );

            return Results.Ok(response);
        })
        .WithName("DiscoverGames")
        .WithTags("Discovery")
        .WithOpenApi(operation => new(operation)
        {
            Summary = "Descobrir jogos baseado em preferências",
            Description = "Retorna até 100 jogos ranqueados baseados nos filtros fornecidos. Usa IGDB como fonte principal e RAWG como fallback."
        });

        app.MapGet("/api/games/{appId}/reviews", async (int appId, SteamApiService steamApi) =>
        {
            var reviews = await steamApi.GetGameReviewsAsync(appId, 20);

            if (reviews == null || reviews.Reviews.Count == 0)
            {
                return Results.NotFound(new { message = "Nenhuma review encontrada para este jogo" });
            }

            // Filtrar apenas reviews curtas (máximo 300 caracteres) - relaxado para teste
            var shortReviews = reviews.Reviews.Where(r =>
                r.Review.Length <= 300 // Máximo 300 caracteres (relaxado)
            )
            .OrderBy(r => r.Review.Length) // Ordenar por tamanho (menores primeiro)
            .Take(3)
            .ToList();

            if (shortReviews.Count == 0)
            {
                return Results.NotFound(new { message = "Nenhuma review curta encontrada para este jogo" });
            }

            var response = new
            {
                success = reviews.Success,
                querySummary = new
                {
                    numReviews = reviews.QuerySummary.NumReviews,
                    reviewScore = reviews.QuerySummary.ReviewScore,
                    reviewScoreDesc = reviews.QuerySummary.ReviewScoreDesc,
                    totalPositive = reviews.QuerySummary.TotalPositive,
                    totalNegative = reviews.QuerySummary.TotalNegative,
                    totalReviews = reviews.QuerySummary.TotalReviews
                },
                reviews = shortReviews.Select(r => new
                {
                    author = new
                    {
                        steamId = r.Author.SteamId,
                        numGamesOwned = r.Author.NumGamesOwned,
                        numReviews = r.Author.NumReviews,
                        playtimeForever = r.Author.PlaytimeForever
                    },
                    review = r.Review,
                    timestampCreated = r.TimestampCreated,
                    votedUp = r.VotedUp,
                    votesUp = r.VotesUp,
                    votesFunny = r.VotesFunny,
                    playtimeAtReview = r.PlaytimeAtReview,
                    steamPurchase = r.SteamPurchase,
                    receivedForFree = r.ReceivedForFree
                }).ToList()
            };

            return Results.Ok(response);
        })
        .WithName("GetGameReviews")
        .WithTags("Reviews")
        .WithOpenApi(operation => new(operation)
        {
            Summary = "Buscar reviews do Steam para um jogo",
            Description = "Retorna até 3 reviews reais do Steam para o jogo especificado."
        });
    }
}


