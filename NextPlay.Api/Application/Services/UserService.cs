using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Api.DTOs;
using NextPlay.Api.Domain.Entities;
using NextPlay.Api.Infrastructure.Ef;
using NextPlay.Api.Infrastructure.Providers;

namespace NextPlay.Api.Application.Services;

public class UserService
{
    private readonly NextPlayDbContext _context;
    private readonly SteamApiService _steamApiService;
    private readonly ILogger<UserService> _logger;

    public UserService(NextPlayDbContext context, SteamApiService steamApiService, ILogger<UserService> logger)
    {
        _context = context;
        _steamApiService = steamApiService;
        _logger = logger;
    }

    public async Task<object> RefreshUserLibraryAsync(string steamId)
    {
        _logger.LogInformation("🔄 Refreshing library for user {SteamId}", steamId);

        try
        {
            // Converter Steam ID para Steam ID64 se necessário
            var steamId64 = SteamIdConverter.ConvertToSteamId64(steamId);
            if (steamId64 == null)
            {
                _logger.LogWarning("Invalid Steam ID format: {SteamId}", steamId);
                return new
                {
                    message = "Formato de Steam ID inválido. Use Steam ID64 (17 dígitos), Steam ID (STEAM_X:Y:Z) ou Steam ID3 ([U:1:XXXXXX])",
                    steamId = steamId,
                    gamesFound = 0,
                    lastRefresh = DateTime.UtcNow
                };
            }

            _logger.LogInformation("Converted Steam ID {SteamId} to Steam ID64 {SteamId64}", steamId, steamId64);

            // Buscar informações do perfil do usuário
            _logger.LogInformation("🔍 [RefreshUserLibraryAsync] Calling GetPlayerSummaryAsync for SteamId64: {SteamId64}", steamId64);
            var playerSummary = await _steamApiService.GetPlayerSummaryAsync(steamId64);
            _logger.LogInformation("📊 [RefreshUserLibraryAsync] Player summary result: {PlayerSummary}", playerSummary != null ? "Found" : "Not found");

            if (playerSummary != null)
            {
                _logger.LogInformation("✅ [RefreshUserLibraryAsync] Player summary details - Name: {PersonaName}, Avatar: {Avatar}, Country: {Country}",
                    playerSummary.PersonaName, playerSummary.Avatar, playerSummary.LocCountryCode);
            }
            else
            {
                _logger.LogWarning("⚠️ [RefreshUserLibraryAsync] Player summary is NULL - this will result in playerInfo: null in response");
            }

            // Buscar biblioteca do usuário na Steam API
            var steamLibrary = await _steamApiService.GetUserLibraryAsync(steamId64);

            if (steamLibrary == null || steamLibrary.Games == null)
            {
                _logger.LogWarning("No games found in Steam library for user {SteamId64}", steamId64);
                return new
                {
                    message = "No games found in Steam library",
                    steamId = steamId,
                    steamId64 = steamId64,
                    gamesFound = 0,
                    games = new List<object>(),
                    lastRefresh = DateTime.UtcNow,
                    playerInfo = playerSummary != null ? new
                    {
                        personaName = playerSummary.PersonaName,
                        realName = playerSummary.RealName,
                        avatar = playerSummary.AvatarMedium,
                        avatarFull = playerSummary.AvatarFull,
                        profileUrl = playerSummary.ProfileUrl,
                        isOnline = playerSummary.IsOnline,
                        isAway = playerSummary.IsAway,
                        isBusy = playerSummary.IsBusy,
                        lastLogoff = playerSummary.LastLogoffDate,
                        countryCode = playerSummary.LocCountryCode,
                        stateCode = playerSummary.LocStateCode,
                        createdDate = playerSummary.CreatedDate
                    } : null
                };
            }

            _logger.LogInformation("Found {Count} games in Steam library for user {SteamId64}",
                steamLibrary.Games.Count, steamId64);

            // Salvar/atualizar jogos no banco de dados
            var gamesProcessed = 0;
            foreach (var steamGame in steamLibrary.Games)
            {
                try
                {
                    // Verificar se o jogo já existe
                    var existingGame = await _context.Games
                        .FirstOrDefaultAsync(g => g.AppId == steamGame.AppId);

                    // Buscar conquistas do jogo (apenas para jogos com tempo jogado > 0)
                    int? totalAchievements = null;
                    int? unlockedAchievements = null;

                    if (steamGame.PlaytimeForever > 0)
                    {
                        _logger.LogInformation("🏆 [RefreshUserLibraryAsync] Fetching achievements for game {AppId} ({Name}) with {Playtime} minutes",
                            steamGame.AppId, steamGame.Name, steamGame.PlaytimeForever);

                        var achievements = await _steamApiService.GetPlayerAchievementsAsync(steamId64, steamGame.AppId);
                        totalAchievements = achievements?.PlayerStats?.Achievements?.Count ?? 0;
                        unlockedAchievements = achievements?.PlayerStats?.Achievements?.Count(a => a.Achieved == 1) ?? 0;

                        _logger.LogInformation("🏆 [RefreshUserLibraryAsync] Game {AppId} ({Name}): {Unlocked}/{Total} achievements",
                            steamGame.AppId, steamGame.Name, unlockedAchievements, totalAchievements);

                        // Log detalhado para debug
                        if (achievements?.PlayerStats != null)
                        {
                            _logger.LogInformation("🏆 [RefreshUserLibraryAsync] Achievement data: Success={Success}, SteamId={SteamId}, GameName={GameName}",
                                achievements.PlayerStats.Success, achievements.PlayerStats.SteamId, achievements.PlayerStats.GameName);
                        }
                        else
                        {
                            _logger.LogWarning("🏆 [RefreshUserLibraryAsync] No achievement data received for game {AppId}", steamGame.AppId);
                        }
                    }
                    else
                    {
                        _logger.LogInformation("🏆 [RefreshUserLibraryAsync] Skipping achievements for game {AppId} ({Name}) - no playtime",
                            steamGame.AppId, steamGame.Name);
                    }

                    if (existingGame == null)
                    {
                        // Criar novo jogo
                        var newGame = new Game
                        {
                            AppId = steamGame.AppId,
                            Name = steamGame.Name,
                            HeaderImage = steamGame.HeaderImage,
                            ImgLogoUrl = steamGame.ImgLogoUrl,
                            ImgIconUrl = steamGame.ImgIconUrl,
                            AchievementsTotal = totalAchievements,
                            AchievementsUnlocked = unlockedAchievements,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Games.Add(newGame);
                        _logger.LogInformation("🏆 [RefreshUserLibraryAsync] Created new game {AppId} with {Total}/{Unlocked} achievements",
                            steamGame.AppId, totalAchievements, unlockedAchievements);
                    }
                    else
                    {
                        // Atualizar jogo existente
                        existingGame.Name = steamGame.Name;
                        existingGame.HeaderImage = steamGame.HeaderImage;
                        existingGame.ImgLogoUrl = steamGame.ImgLogoUrl;
                        existingGame.ImgIconUrl = steamGame.ImgIconUrl;
                        existingGame.AchievementsTotal = totalAchievements ?? existingGame.AchievementsTotal;
                        existingGame.AchievementsUnlocked = unlockedAchievements ?? existingGame.AchievementsUnlocked;
                        existingGame.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation("🏆 [RefreshUserLibraryAsync] Updated existing game {AppId} with {Total}/{Unlocked} achievements",
                            steamGame.AppId, existingGame.AchievementsTotal, existingGame.AchievementsUnlocked);
                    }

                    // Verificar se o usuário já possui este jogo
                    var existingOwnership = await _context.Ownerships
                        .FirstOrDefaultAsync(o => o.SteamId64 == steamId64 && o.AppId == steamGame.AppId);

                    if (existingOwnership == null)
                    {
                        // Criar nova propriedade
                        var newOwnership = new Ownership
                        {
                            SteamId64 = steamId64,
                            AppId = steamGame.AppId,
                            PlaytimeForever = steamGame.PlaytimeForever,
                            Playtime2Weeks = steamGame.Playtime2Weeks,
                            LastPlayed = steamGame.LastPlayed,
                            HasCommunityVisibleStats = steamGame.HasCommunityVisibleStats,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Ownerships.Add(newOwnership);
                    }
                    else
                    {
                        // Atualizar propriedade existente
                        existingOwnership.PlaytimeForever = steamGame.PlaytimeForever;
                        existingOwnership.Playtime2Weeks = steamGame.Playtime2Weeks;
                        existingOwnership.LastPlayed = steamGame.LastPlayed;
                        existingOwnership.HasCommunityVisibleStats = steamGame.HasCommunityVisibleStats;
                        existingOwnership.UpdatedAt = DateTime.UtcNow;
                    }

                    gamesProcessed++;
                }
                catch (Exception gameEx)
                {
                    _logger.LogWarning(gameEx, "Error processing game {AppId} for user {SteamId64}",
                        steamGame.AppId, steamId64);
                }
            }

            // Salvar todas as mudanças
            _logger.LogInformation("💾 [RefreshUserLibraryAsync] Saving {Count} games to database...", gamesProcessed);
            await _context.SaveChangesAsync();
            _logger.LogInformation("✅ [RefreshUserLibraryAsync] Database save completed successfully");

            // Verificar se os jogos foram salvos corretamente
            var savedOwnerships = await _context.Ownerships.CountAsync(o => o.SteamId64 == steamId64);
            _logger.LogInformation("🔍 [RefreshUserLibraryAsync] Verification: {Count} ownerships now in database for user {SteamId64}", savedOwnerships, steamId64);

            _logger.LogInformation("✅ Library refresh completed for user {SteamId64}. Processed {Count} games",
                steamId64, gamesProcessed);

            // Buscar os jogos salvos para retornar na resposta
            var savedGames = await _context.Ownerships
                .Include(o => o.Game)
                .Where(o => o.SteamId64 == steamId64)
                .Select(o => new
                {
                    id = o.Game!.AppId.ToString(),
                    name = o.Game.Name,
                    playtimeForever = o.PlaytimeForever,
                    lastPlayed = o.LastPlayed,
                    headerImage = o.Game.HeaderImage,
                    imgLogoUrl = o.Game.ImgLogoUrl,
                    imgIconUrl = o.Game.ImgIconUrl
                })
                .ToListAsync();

            _logger.LogInformation("📋 [RefreshUserLibraryAsync] Returning {Count} games in response", savedGames.Count);

            return new
            {
                message = "Library refreshed successfully",
                steamId = steamId,
                steamId64 = steamId64,
                gamesFound = gamesProcessed,
                games = savedGames,
                lastRefresh = DateTime.UtcNow,
                playerInfo = playerSummary != null ? new
                {
                    personaName = playerSummary.PersonaName,
                    realName = playerSummary.RealName,
                    avatar = playerSummary.AvatarMedium,
                    avatarFull = playerSummary.AvatarFull,
                    profileUrl = playerSummary.ProfileUrl,
                    isOnline = playerSummary.IsOnline,
                    isAway = playerSummary.IsAway,
                    isBusy = playerSummary.IsBusy,
                    lastLogoff = playerSummary.LastLogoffDate,
                    countryCode = playerSummary.LocCountryCode,
                    stateCode = playerSummary.LocStateCode,
                    createdDate = playerSummary.CreatedDate
                } : null
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error refreshing library for user {SteamId}", steamId);
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

    public async Task<object> GetAllUsersAsync()
    {
        _logger.LogInformation("📊 Fetching all users data");

        try
        {
            // Buscar todos os usuários únicos que têm jogos na biblioteca
            var users = await _context.Ownerships
                .GroupBy(o => o.SteamId64)
                .Select(g => new
                {
                    SteamId64 = g.Key,
                    GamesCount = g.Count(),
                    TotalPlaytime = g.Sum(o => o.PlaytimeForever),
                    LastActivity = g.Max(o => o.UpdatedAt),
                    FirstSeen = g.Min(o => o.CreatedAt)
                })
                .OrderByDescending(u => u.LastActivity)
                .ToListAsync();

            // Buscar preferências dos usuários
            var userPrefs = await _context.UserPrefs
                .Where(up => users.Select(u => u.SteamId64).Contains(up.SteamId64))
                .ToListAsync();

            // Buscar feedback dos usuários
            var userFeedback = await _context.Feedbacks
                .GroupBy(f => f.SteamId64)
                .Select(g => new
                {
                    SteamId64 = g.Key,
                    TotalFeedback = g.Count(),
                    Likes = g.Count(f => f.Action == Domain.Entities.FeedbackAction.Like),
                    Dislikes = g.Count(f => f.Action == Domain.Entities.FeedbackAction.Dislike),
                    Snoozes = g.Count(f => f.Action == Domain.Entities.FeedbackAction.Snooze)
                })
                .ToListAsync();

            // Combinar dados
            var usersWithDetails = users.Select(user => new
            {
                user.SteamId64,
                user.GamesCount,
                user.TotalPlaytime,
                user.LastActivity,
                user.FirstSeen,
                Preferences = userPrefs.FirstOrDefault(up => up.SteamId64 == user.SteamId64),
                Feedback = userFeedback.FirstOrDefault(uf => uf.SteamId64 == user.SteamId64) ?? new
                {
                    SteamId64 = user.SteamId64,
                    TotalFeedback = 0,
                    Likes = 0,
                    Dislikes = 0,
                    Snoozes = 0
                }
            }).ToList();

            _logger.LogInformation("Found {Count} users", usersWithDetails.Count());

            return new
            {
                totalUsers = usersWithDetails.Count(),
                users = usersWithDetails,
                summary = new
                {
                    totalGames = usersWithDetails.Sum(u => u.GamesCount),
                    totalPlaytime = usersWithDetails.Sum(u => u.TotalPlaytime),
                    averageGamesPerUser = usersWithDetails.Count() > 0 ? usersWithDetails.Average(u => u.GamesCount) : 0,
                    averagePlaytimePerUser = usersWithDetails.Count() > 0 ? usersWithDetails.Average(u => u.TotalPlaytime) : 0,
                    usersWithPreferences = userPrefs.Count,
                    usersWithFeedback = userFeedback.Count
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all users data");
            throw;
        }
    }

    public async Task<object> GetUserDetailsAsync(string steamId64)
    {
        _logger.LogInformation("👤 Fetching detailed data for user {SteamId64}", steamId64);

        try
        {
            // Buscar informações básicas do usuário
            var userOwnerships = await _context.Ownerships
                .Include(o => o.Game)
                .ThenInclude(g => g.Scores)
                .Where(o => o.SteamId64 == steamId64)
                .ToListAsync();

            if (!userOwnerships.Any())
            {
                return new { message = "User not found or no games in library" };
            }

            // Buscar preferências
            var preferences = await _context.UserPrefs
                .FirstOrDefaultAsync(up => up.SteamId64 == steamId64);

            // Buscar feedback
            var feedback = await _context.Feedbacks
                .Include(f => f.Game)
                .Where(f => f.SteamId64 == steamId64)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            // Buscar informações do perfil Steam
            var playerSummary = await _steamApiService.GetPlayerSummaryAsync(steamId64);

            // Estatísticas dos jogos
            var gameStats = new
            {
                totalGames = userOwnerships.Count,
                totalPlaytime = userOwnerships.Sum(o => o.PlaytimeForever),
                averagePlaytime = userOwnerships.Count > 0 ? userOwnerships.Average(o => o.PlaytimeForever) : 0,
                mostPlayedGame = userOwnerships
                    .OrderByDescending(o => o.PlaytimeForever)
                    .FirstOrDefault()?.Game?.Name,
                mostPlayedTime = userOwnerships
                    .OrderByDescending(o => o.PlaytimeForever)
                    .FirstOrDefault()?.PlaytimeForever ?? 0,
                recentlyPlayed = userOwnerships
                    .Where(o => o.LastPlayed.HasValue)
                    .OrderByDescending(o => o.LastPlayed)
                    .Take(5)
                    .Select(o => new
                    {
                        gameName = o.Game?.Name,
                        lastPlayed = o.LastPlayed,
                        playtime = o.PlaytimeForever
                    })
                    .ToList()
            };

            return new
            {
                steamId64,
                playerInfo = playerSummary,
                gameStats,
                preferences,
                feedback = new
                {
                    total = feedback.Count,
                    likes = feedback.Count(f => f.Action == Domain.Entities.FeedbackAction.Like),
                    dislikes = feedback.Count(f => f.Action == Domain.Entities.FeedbackAction.Dislike),
                    snoozes = feedback.Count(f => f.Action == Domain.Entities.FeedbackAction.Snooze),
                    recent = feedback.Take(10).Select(f => new
                    {
                        gameName = f.Game?.Name,
                        action = f.Action.ToString(),
                        createdAt = f.CreatedAt
                    }).ToList()
                },
                firstSeen = userOwnerships.Min(o => o.CreatedAt),
                lastActivity = userOwnerships.Max(o => o.UpdatedAt)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user details for {SteamId64}", steamId64);
            throw;
        }
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
            userPrefs.SteamPositiveMin = request.QualityFloor.SteamPositivePct;
        }

        userPrefs.UpdatedAt = DateTime.UtcNow;
    }
}



