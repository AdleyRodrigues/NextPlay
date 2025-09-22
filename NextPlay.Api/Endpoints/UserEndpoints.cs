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

        // GET /api/admin/users - Listar todos os usuários
        group.MapGet("/admin/users", GetAllUsers)
            .WithName("GetAllUsers")
            .WithSummary("Listar todos os usuários (Admin)");

        // GET /api/admin/users/{steamId64} - Detalhes de um usuário específico
        group.MapGet("/admin/users/{steamId64}", GetUserDetails)
            .WithName("GetUserDetails")
            .WithSummary("Obter detalhes de um usuário específico (Admin)");
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

    private static async Task<IResult> GetAllUsers(UserService userService)
    {
        try
        {
            var result = await userService.GetAllUsersAsync();
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { code = "GET_USERS_ERROR", message = ex.Message });
        }
    }

    private static async Task<IResult> GetUserDetails(
        string steamId64,
        UserService userService)
    {
        try
        {
            var result = await userService.GetUserDetailsAsync(steamId64);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { code = "GET_USER_DETAILS_ERROR", message = ex.Message });
        }
    }
}
