using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextPlay.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSteamIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Feedbacks");

            migrationBuilder.DropTable(
                name: "Ownerships");

            migrationBuilder.DropTable(
                name: "UserPrefs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Feedbacks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AppId = table.Column<int>(type: "INTEGER", nullable: false),
                    Action = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    SteamId64 = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
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
                name: "Ownerships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AppId = table.Column<int>(type: "INTEGER", nullable: false),
                    AchievementPct = table.Column<float>(type: "REAL", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    HasCommunityVisibleStats = table.Column<bool>(type: "INTEGER", nullable: false),
                    LastPlayed = table.Column<DateTime>(type: "TEXT", nullable: true),
                    Playtime2Weeks = table.Column<int>(type: "INTEGER", nullable: false),
                    PlaytimeForever = table.Column<int>(type: "INTEGER", nullable: false),
                    PlaytimeMin = table.Column<int>(type: "INTEGER", nullable: false),
                    SteamId64 = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
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
                name: "UserPrefs",
                columns: table => new
                {
                    SteamId64 = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    BlockedTags = table.Column<string>(type: "TEXT", nullable: false),
                    ControllerPreferred = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LikedGenres = table.Column<string>(type: "TEXT", nullable: false),
                    LikedTags = table.Column<string>(type: "TEXT", nullable: false),
                    MaxMainH = table.Column<int>(type: "INTEGER", nullable: false),
                    MetacriticMin = table.Column<int>(type: "INTEGER", nullable: true),
                    MinMainH = table.Column<int>(type: "INTEGER", nullable: false),
                    OpenCriticMin = table.Column<int>(type: "INTEGER", nullable: true),
                    PtbrOnly = table.Column<bool>(type: "INTEGER", nullable: false),
                    SteamPositiveMin = table.Column<int>(type: "INTEGER", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPrefs", x => x.SteamId64);
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
    }
}
