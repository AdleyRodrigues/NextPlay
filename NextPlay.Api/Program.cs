using Microsoft.EntityFrameworkCore;
using NextPlay.Api.Infrastructure.Ef;
using NextPlay.Api.Infrastructure.Providers;
using NextPlay.Api.Application.Services;
using NextPlay.Api.Infrastructure.Data;
using NextPlay.Api.Endpoints;
using Serilog;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/nextplay-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext
builder.Services.AddDbContext<NextPlayDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=reco.db"));

// Configure APIs
builder.Services.Configure<IgdbOptions>(builder.Configuration.GetSection("Igdb"));
builder.Services.Configure<RawgOptions>(builder.Configuration.GetSection("Rawg"));

// Configure HTTP Clients and Services
builder.Services.AddHttpClient<IIgdbService, IgdbService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
})
.AddPolicyHandler(HttpPolicyExtensions
    .HandleTransientHttpError()
    .OrResult(msg => (int)msg.StatusCode == 429)
    .WaitAndRetryAsync(3, retry => TimeSpan.FromSeconds(Math.Pow(2, retry))));

builder.Services.AddHttpClient<IRawgService, RawgService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(12);
})
.AddPolicyHandler(HttpPolicyExtensions
    .HandleTransientHttpError()
    .OrResult(msg => (int)msg.StatusCode == 429)
    .WaitAndRetryAsync(3, retry => TimeSpan.FromSeconds(Math.Pow(2, retry))));

builder.Services.AddHttpClient<RawgService>();
builder.Services.AddHttpClient<SteamStoreService>();
builder.Services.AddHttpClient<SteamApiService>();
builder.Services.AddHttpClient<HltbService>();

// Register application services
builder.Services.AddScoped<RecommendationService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<RankingService>();
builder.Services.AddScoped<GameSeeder>();
builder.Services.AddScoped<IGameCatalog, CompositeCatalogService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add Memory Cache
builder.Services.AddMemoryCache();

// Add HttpClient
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();

// Map endpoint groups
app.MapRecommendationsEndpoints();
app.MapUserEndpoints();
app.MapRankingEndpoints();
app.MapDevEndpoints();
app.MapRawgEndpoints();
app.MapDiscoverEndpoints();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NextPlayDbContext>();
    context.Database.EnsureCreated();
}

app.Run();