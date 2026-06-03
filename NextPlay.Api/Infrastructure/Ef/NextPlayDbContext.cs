using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Domain.Entities;
using System.Text.Json;

namespace NextPlay.Api.Infrastructure.Ef;

public class NextPlayDbContext : DbContext
{
    public NextPlayDbContext(DbContextOptions<NextPlayDbContext> options) : base(options)
    {
    }

    public DbSet<Game> Games { get; set; }
    public DbSet<Scores> Scores { get; set; }
    public DbSet<Hltb> Hltbs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Game configuration
        modelBuilder.Entity<Game>(entity =>
        {
            entity.HasKey(e => e.AppId);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Tags).HasConversion(
                v => JsonSerializer.Serialize(v.Split(',', StringSplitOptions.RemoveEmptyEntries), (JsonSerializerOptions)null!),
                v => string.Join(",", JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions)null!) ?? Array.Empty<string>())
            );
            entity.Property(e => e.Genres).HasConversion(
                v => JsonSerializer.Serialize(v.Split(',', StringSplitOptions.RemoveEmptyEntries), (JsonSerializerOptions)null!),
                v => string.Join(",", JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions)null!) ?? Array.Empty<string>())
            );
            entity.Property(e => e.Languages).HasConversion(
                v => JsonSerializer.Serialize(v.Split(',', StringSplitOptions.RemoveEmptyEntries), (JsonSerializerOptions)null!),
                v => string.Join(",", JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions)null!) ?? Array.Empty<string>())
            );
        });

        // Scores configuration
        modelBuilder.Entity<Scores>(entity =>
        {
            entity.HasKey(e => e.AppId);
            entity.HasOne(e => e.Game)
                .WithOne(g => g.Scores)
                .HasForeignKey<Scores>(e => e.AppId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Hltb configuration
        modelBuilder.Entity<Hltb>(entity =>
        {
            entity.HasKey(e => e.AppId);
            entity.HasOne(e => e.Game)
                .WithOne(g => g.Hltb)
                .HasForeignKey<Hltb>(e => e.AppId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data will be added later via API or separate seeding method
    }
}
