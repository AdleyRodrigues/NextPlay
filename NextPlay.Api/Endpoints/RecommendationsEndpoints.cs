using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Application.Services;

namespace NextPlay.Api.Endpoints;

public static class RecommendationsEndpoints
{
    public static void MapRecommendationsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api")
            .WithTags("Recommendations")
            .WithOpenApi();

        // GET /api/health
        group.MapGet("/health", () => Results.Ok(new
        {
            ok = true,
            version = "1.0.0",
            timestamp = DateTime.UtcNow
        }))
        .WithName("HealthCheck")
        .WithSummary("Verifica se a API está funcionando");

        // POST /api/recommendations
        group.MapPost("/recommendations", GetRecommendations)
            .WithName("GetRecommendations")
            .WithSummary("Obter recomendações de jogos baseadas em filtros");

    }

    private static async Task<IResult> GetRecommendations(
        RecommendRequest request,
        RecommendationService recommendationService,
        ILogger<RecommendationService> logger)
    {
        try
        {
            logger.LogInformation("🎯 ENDPOINT: Received recommendation request - Platform: {Platform}, Skill: {Skill}, Limit: {Limit}",
                request.PlatformId, request.Skill, request.Limit);

            var response = await recommendationService.GetRecommendationsAsync(request);

            logger.LogInformation("🎯 ENDPOINT: Returning {Count} recommendations", response.Items.Count);

            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "🚨 ENDPOINT ERROR: Failed to get recommendations");

            // Retornar erro detalhado para o frontend
            var errorResponse = new
            {
                code = "RECOMMEND_ERROR",
                message = ex.Message,
                type = ex.GetType().Name,
                details = ex.InnerException?.Message,
                timestamp = DateTime.UtcNow
            };

            return Results.BadRequest(errorResponse);
        }
    }
}
