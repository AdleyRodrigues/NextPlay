using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Application.Services;

namespace NextPlay.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api")
            .WithTags("User Management")
            .WithOpenApi();

        // GET /api/refresh/{steamId64}
        group.MapGet("/refresh/{steamId64}", RefreshUserLibrary)
            .WithName("RefreshUserLibrary")
            .WithSummary("Sincronizar biblioteca Steam do usuário");

        // PUT /api/userprefs
        group.MapPut("/userprefs", SaveUserPreferences)
            .WithName("SaveUserPreferences")
            .WithSummary("Salvar preferências do usuário");
    }

    private static async Task<IResult> RefreshUserLibrary(
        string steamId64,
        UserService userService)
    {
        try
        {
            var result = await userService.RefreshUserLibraryAsync(steamId64);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { code = "REFRESH_ERROR", message = ex.Message });
        }
    }

    private static async Task<IResult> SaveUserPreferences(
        UserPrefsRequest request,
        UserService userService)
    {
        try
        {
            await userService.SaveUserPreferencesAsync(request);
            return Results.Ok(new { message = "Preferences saved successfully" });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { code = "SAVE_PREFS_ERROR", message = ex.Message });
        }
    }
}
