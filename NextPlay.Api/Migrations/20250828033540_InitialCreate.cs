using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextPlay.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Games",
                columns: table => new
                {
                    AppId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    Tags = table.Column<string>(type: "TEXT", nullable: false),
                    Genres = table.Column<string>(type: "TEXT", nullable: false),
                    ControllerFriendly = table.Column<bool>(type: "INTEGER", nullable: false),
                    Languages = table.Column<string>(type: "TEXT", nullable: false),
                    ReleaseYear = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Games", x => x.AppId);
                });

            migrationBuilder.CreateTable(
                name: "UserPrefs",
                columns: table => new
                {
                    SteamId64 = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    LikedTags = table.Column<string>(type: "TEXT", nullable: false),
                    BlockedTags = table.Column<string>(type: "TEXT", nullable: false),
                    LikedGenres = table.Column<string>(type: "TEXT", nullable: false),
                    PtbrOnly = table.Column<bool>(type: "INTEGER", nullable: false),
                    ControllerPreferred = table.Column<bool>(type: "INTEGER", nullable: false),
                    MinMainH = table.Column<int>(type: "INTEGER", nullable: false),
                    MaxMainH = table.Column<int>(type: "INTEGER", nullable: false),
                    MetacriticMin = table.Column<int>(type: "INTEGER", nullable: true),
                    OpenCriticMin = table.Column<int>(type: "INTEGER", nullable: true),
                    SteamPositiveMin = table.Column<int>(type: "INTEGER", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPrefs", x => x.SteamId64);
                });

            migrationBuilder.CreateTable(
                name: "Feedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SteamId64 = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AppId = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedbacks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Feedbacks_Games_AppId",
                        column: x => x.AppId,
                        principalTable: "Games",
                        principalColumn: "AppId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Hltbs",
                columns: table => new
                {
                    AppId = table.Column<int>(type: "INTEGER", nullable: false),
                    MainMin = table.Column<int>(type: "INTEGER", nullable: true),
                    MainExtraMin = table.Column<int>(type: "INTEGER", nullable: true),
                    CompletionistMin = table.Column<int>(type: "INTEGER", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hltbs", x => x.AppId);
                    table.ForeignKey(
                        name: "FK_Hltbs_Games_AppId",
                        column: x => x.AppId,
                        principalTable: "Games",
                        principalColumn: "AppId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ownerships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SteamId64 = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    AppId = table.Column<int>(type: "INTEGER", nullable: false),
                    PlaytimeMin = table.Column<int>(type: "INTEGER", nullable: false),
                    LastPlayed = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AchievementPct = table.Column<float>(type: "REAL", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ownerships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ownerships_Games_AppId",
                        column: x => x.AppId,
                        principalTable: "Games",
                        principalColumn: "AppId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Scores",
                columns: table => new
                {
                    AppId = table.Column<int>(type: "INTEGER", nullable: false),
                    Metacritic = table.Column<int>(type: "INTEGER", nullable: true),
                    OpenCritic = table.Column<int>(type: "INTEGER", nullable: true),
                    TotalPositive = table.Column<int>(type: "INTEGER", nullable: false),
                    TotalNegative = table.Column<int>(type: "INTEGER", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scores", x => x.AppId);
                    table.ForeignKey(
                        name: "FK_Scores_Games_AppId",
                        column: x => x.AppId,
                        principalTable: "Games",
                        principalColumn: "AppId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_AppId",
                table: "Feedbacks",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_SteamId64_AppId_Action",
                table: "Feedbacks",
                columns: new[] { "SteamId64", "AppId", "Action" });

            migrationBuilder.CreateIndex(
                name: "IX_Ownerships_AppId",
                table: "Ownerships",
                column: "AppId");

            migrationBuilder.CreateIndex(
                name: "IX_Ownerships_SteamId64_AppId",
                table: "Ownerships",
                columns: new[] { "SteamId64", "AppId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Feedbacks");

            migrationBuilder.DropTable(
                name: "Hltbs");

            migrationBuilder.DropTable(
                name: "Ownerships");

            migrationBuilder.DropTable(
                name: "Scores");

            migrationBuilder.DropTable(
                name: "UserPrefs");

            migrationBuilder.DropTable(
                name: "Games");
        }
    }
}
