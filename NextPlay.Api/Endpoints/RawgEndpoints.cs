using NextPlay.Api.Infrastructure.Providers;

namespace NextPlay.Api.Endpoints;

public static class RawgEndpoints
{
    public static void MapRawgEndpoints(this WebApplication app)
    {
        app.MapGet("/api/rawg/{name}", async (string name, IRawgService rawg) =>
        {
            var meta = await rawg.GetGameMetaAsync(name);
            return meta is null ? Results.NotFound(new { ok = false, message = "not_found" }) : Results.Ok(meta);
        })
        .WithName("GetRawgMeta")
        .WithTags("RAWG")
        .WithOpenApi();
    }
}


