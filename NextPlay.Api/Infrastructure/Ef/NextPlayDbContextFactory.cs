using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace NextPlay.Api.Infrastructure.Ef;

public class NextPlayDbContextFactory : IDesignTimeDbContextFactory<NextPlayDbContext>
{
    public NextPlayDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<NextPlayDbContext>();
        optionsBuilder.UseSqlite("Data Source=reco.db");

        return new NextPlayDbContext(optionsBuilder.Options);
    }
}



