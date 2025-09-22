namespace NextPlay.Api.Application.Catalog;

public record DiscoverRequest(
    string[]? vibe,                 // ex: ["relax","historia"]
    string duration,                // "rapido"|"medio"|"longo"|"muito_longo"|"tanto_faz"
    string energy,                  // "baixa"|"normal"|"alta"
    string social,                  // "solo"|"coop"|"pvp"|"tanto_faz"
    string contentTone,             // "evitar_pesado"|"indiferente"|"topa_pesado"
    bool? controllerPreferred,
    string lang,                    // "ptbr_only"|"ptbr_pref"|"indiferente"
    string structure,               // "campaign"|"replay"|"tanto_faz"
    string[]? flavors,              // "sci_fi","fantasia","investigacao",...
    int limit = 100
);

public record DiscoverItem(
    int? appId,
    string name,
    string store,                   // "IGDB" | "RAWG"
    string image,
    int? metacritic,
    double? criticRating,          // IGDB rating/RAWG rating
    int? steamPositivePct,         // se cruzado depois
    double? hltbMainHours,         // usar IGDB time_to_beat como proxy
    double scoreTotal,
    string[] why,
    string storeUrl
);

public record DiscoverResponse(
    string generatedAt,
    int count,
    IReadOnlyList<DiscoverItem> items
);

public interface IGameCatalog
{
    Task<IReadOnlyList<DiscoverItem>> DiscoverAsync(DiscoverRequest req, CancellationToken ct = default);
}


