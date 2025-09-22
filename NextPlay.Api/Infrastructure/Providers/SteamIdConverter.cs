namespace NextPlay.Api.Infrastructure.Providers;

public static class SteamIdConverter
{
    /// <summary>
    /// Converte Steam ID (formato STEAM_X:Y:Z) para Steam ID64
    /// </summary>
    /// <param name="steamId">Steam ID no formato STEAM_X:Y:Z</param>
    /// <returns>Steam ID64 (17 dígitos) ou null se inválido</returns>
    public static string? ConvertToSteamId64(string steamId)
    {
        if (string.IsNullOrWhiteSpace(steamId))
            return null;

        // Se já é um Steam ID64 (17 dígitos), retorna como está
        if (steamId.Length == 17 && steamId.All(char.IsDigit))
            return steamId;

        // Se é um Steam ID no formato STEAM_X:Y:Z
        if (steamId.StartsWith("STEAM_", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var parts = steamId.Split(':');
                if (parts.Length != 3)
                    return null;

                var universe = int.Parse(parts[0].Substring(6)); // Remove "STEAM_"
                var y = int.Parse(parts[1]);
                var z = int.Parse(parts[2]);

                // Fórmula para converter Steam ID para Steam ID64
                var steamId64 = (z * 2) + y + 76561197960265728L;

                return steamId64.ToString();
            }
            catch
            {
                return null;
            }
        }

        // Se é um Steam ID3 no formato [U:1:XXXXXX]
        if (steamId.StartsWith("[U:1:") && steamId.EndsWith("]"))
        {
            try
            {
                var id3 = steamId.Substring(5, steamId.Length - 6); // Remove [U:1: e ]
                var z = int.Parse(id3);

                // Fórmula para converter Steam ID3 para Steam ID64
                var steamId64 = z + 76561197960265728L;

                return steamId64.ToString();
            }
            catch
            {
                return null;
            }
        }

        return null;
    }

    /// <summary>
    /// Valida se o formato do Steam ID é válido (aceita Steam ID, Steam ID3 ou Steam ID64)
    /// </summary>
    /// <param name="steamId">Steam ID em qualquer formato</param>
    /// <returns>True se válido, False caso contrário</returns>
    public static bool IsValidSteamId(string steamId)
    {
        if (string.IsNullOrWhiteSpace(steamId))
            return false;

        // Steam ID64 (17 dígitos)
        if (steamId.Length == 17 && steamId.All(char.IsDigit))
            return true;

        // Steam ID (formato STEAM_X:Y:Z)
        if (steamId.StartsWith("STEAM_", StringComparison.OrdinalIgnoreCase))
        {
            var parts = steamId.Split(':');
            if (parts.Length == 3)
            {
                return int.TryParse(parts[0].Substring(6), out _) &&
                       int.TryParse(parts[1], out _) &&
                       int.TryParse(parts[2], out _);
            }
        }

        // Steam ID3 (formato [U:1:XXXXXX])
        if (steamId.StartsWith("[U:1:") && steamId.EndsWith("]"))
        {
            var id3 = steamId.Substring(5, steamId.Length - 6);
            return int.TryParse(id3, out _);
        }

        return false;
    }

    /// <summary>
    /// Detecta o formato do Steam ID
    /// </summary>
    /// <param name="steamId">Steam ID</param>
    /// <returns>Tipo do formato</returns>
    public static SteamIdFormat DetectFormat(string steamId)
    {
        if (string.IsNullOrWhiteSpace(steamId))
            return SteamIdFormat.Invalid;

        if (steamId.Length == 17 && steamId.All(char.IsDigit))
            return SteamIdFormat.SteamId64;

        if (steamId.StartsWith("STEAM_", StringComparison.OrdinalIgnoreCase))
            return SteamIdFormat.SteamId;

        if (steamId.StartsWith("[U:1:") && steamId.EndsWith("]"))
            return SteamIdFormat.SteamId3;

        return SteamIdFormat.Invalid;
    }
}

public enum SteamIdFormat
{
    Invalid,
    SteamId,    // STEAM_X:Y:Z
    SteamId3,   // [U:1:XXXXXX]
    SteamId64   // 7656119XXXXXXXXXX
}
