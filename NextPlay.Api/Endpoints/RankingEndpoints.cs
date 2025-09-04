using Microsoft.AspNetCore.Mvc;
using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Application.Services;

namespace NextPlay.Api.Endpoints;

public static class RankingEndpoints
{
    public static void MapRankingEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/ranking")
            .WithTags("Ranking")
            .WithOpenApi();

        group.MapPost("/top-games", GetTopGames)
            .WithName("GetTopGames")
            .WithSummary("Obtém o Top 5 jogos da biblioteca Steam do usuário")
            .WithDescription("""
                Algoritmo de ranqueamento que combina:
                - Qualidade externa (Steam, Metacritic, OpenCritic)
                - Progresso (conquistas)
                - Novidade/Retomada (horas e último acesso)
                - Aderência ao modo (jogar, terminar, zerar, platinar)
                """)
            .Produces<RankingResponse>(200)
            .Produces(400)
            .Produces(500);
    }

    private static async Task<IResult> GetTopGames(
        [FromBody] RankingRequest request,
        [FromServices] RankingService rankingService,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(request.SteamId64))
        {
            return Results.BadRequest(new { error = "SteamId64 é obrigatório" });
        }

        if (request.Limit <= 0 || request.Limit > 20)
        {
            return Results.BadRequest(new { error = "Limit deve estar entre 1 e 20" });
        }

        try
        {
            var response = await rankingService.GetTopGamesAsync(request);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                detail: "Erro interno ao processar ranqueamento",
                statusCode: 500,
                title: "Ranking Error");
        }
    }
}
