using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Domain.Entities;
using NextPlay.Api.Infrastructure.Ef;

namespace NextPlay.Api.Application.Services;

public class UserService
{
    private readonly NextPlayDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(NextPlayDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<object> RefreshUserLibraryAsync(string steamId64)
    {
        _logger.LogInformation("Refreshing library for user {SteamId64}", steamId64);

        try
        {
            // TODO: Implement Steam API integration
            // For now, mock implementation
            await Task.Delay(1000); // Simulate API call delay

            _logger.LogInformation("Library refresh completed for user {SteamId64}", steamId64);

            return new
            {
                message = "Library refreshed successfully",
                steamId64 = steamId64,
                gamesFound = 42,
                lastRefresh = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing library for user {SteamId64}", steamId64);
            throw;
        }
    }

    public async Task SaveUserPreferencesAsync(UserPrefsRequest request)
    {
        _logger.LogInformation("Saving preferences for user {SteamId64}", request.SteamId64);

        try
        {
            // Find existing preferences or create new
            var userPrefs = await _context.UserPrefs
                .FirstOrDefaultAsync(up => up.SteamId64 == request.SteamId64);

            if (userPrefs == null)
            {
                userPrefs = new UserPrefs
                {
                    SteamId64 = request.SteamId64
                };
                _context.UserPrefs.Add(userPrefs);
                _logger.LogDebug("Creating new preferences for user {SteamId64}", request.SteamId64);
            }
            else
            {
                _logger.LogDebug("Updating existing preferences for user {SteamId64}", request.SteamId64);
            }

            // Update preferences
            UpdateUserPreferences(userPrefs, request);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Preferences saved successfully for user {SteamId64}", request.SteamId64);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving preferences for user {SteamId64}", request.SteamId64);
            throw;
        }
    }

    public async Task SaveFeedbackAsync(FeedbackRequest request)
    {
        _logger.LogInformation("Saving feedback for user {SteamId64}, game {AppId}, action {Action}",
            request.SteamId64, request.AppId, request.Action);

        try
        {
            var feedback = new Feedback
            {
                SteamId64 = request.SteamId64,
                AppId = request.AppId,
                Action = Enum.Parse<FeedbackAction>(request.Action, true),
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Feedback saved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving feedback for user {SteamId64}", request.SteamId64);
            throw;
        }
    }

    public async Task<UserPrefs?> GetUserPreferencesAsync(string steamId64)
    {
        _logger.LogDebug("Getting preferences for user {SteamId64}", steamId64);

        return await _context.UserPrefs
            .FirstOrDefaultAsync(up => up.SteamId64 == steamId64);
    }

    public async Task<List<Feedback>> GetUserFeedbackAsync(string steamId64)
    {
        _logger.LogDebug("Getting feedback history for user {SteamId64}", steamId64);

        return await _context.Feedbacks
            .Where(f => f.SteamId64 == steamId64)
            .Include(f => f.Game)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    private void UpdateUserPreferences(UserPrefs userPrefs, UserPrefsRequest request)
    {
        userPrefs.LikedGenres = string.Join(",", request.Preferences.GenresFavoritos);
        userPrefs.LikedTags = string.Join(",", request.Preferences.TagsLike);
        userPrefs.BlockedTags = string.Join(",", request.Preferences.TagsBlock);
        userPrefs.PtbrOnly = request.Preferences.PtbrOnly;
        userPrefs.ControllerPreferred = request.Preferences.ControllerPreferred;
        userPrefs.MinMainH = request.Preferences.MainHoursRange.Length > 0 ? request.Preferences.MainHoursRange[0] : 1;
        userPrefs.MaxMainH = request.Preferences.MainHoursRange.Length > 1 ? request.Preferences.MainHoursRange[1] : 100;

        if (request.QualityFloor != null)
        {
            userPrefs.MetacriticMin = request.QualityFloor.Metacritic;
            userPrefs.OpenCriticMin = request.QualityFloor.OpenCritic;
            userPrefs.SteamPositiveMin = request.QualityFloor.SteamPosPct;
        }

        userPrefs.UpdatedAt = DateTime.UtcNow;
    }
}



