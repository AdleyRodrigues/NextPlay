using NextPlay.Api.Application.Catalog;

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
    }
}


