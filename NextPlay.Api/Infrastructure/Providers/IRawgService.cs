using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Infrastructure.Providers;

public record RawgMeta(
    int? Metacritic,
    int? ReleaseYear,
    IReadOnlyList<string> Genres,
    IReadOnlyList<string> Tags,
    IReadOnlyList<string> Platforms,
    string? RawgId,
    string? RawgSlug
);

public interface IRawgService
{
    /// <summary>
    /// Busca metadados do jogo na RAWG. Tente primeiro por nome; opcionalmente por appId Steam no futuro.
    /// </summary>
    Task<RawgMeta?> GetGameMetaAsync(string name, System.Threading.CancellationToken ct = default);

    /// <summary>
    /// Busca detalhes do jogo por appId Steam.
    /// </summary>
    Task<RawgMeta?> GetGameDetailsAsync(string appId, CancellationToken ct = default);

    /// <summary>
    /// Descobre jogos baseado nos filtros fornecidos.
    /// </summary>
    Task<IReadOnlyList<DiscoverItem>> DiscoverAsync(DiscoverRequest req, CancellationToken ct = default);
}
