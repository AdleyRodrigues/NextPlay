using NextPlay.Api.Application.Catalog;

namespace NextPlay.Api.Infrastructure.Providers;

public interface IIgdbService
{
    Task<string> GetTokenAsync(CancellationToken ct = default);
    Task<IReadOnlyList<DiscoverItem>> QueryGamesAsync(DiscoverRequest req, CancellationToken ct = default);
}


