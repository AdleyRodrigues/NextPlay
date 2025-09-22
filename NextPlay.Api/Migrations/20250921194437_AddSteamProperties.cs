using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextPlay.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSteamProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SteamNegative",
                table: "Scores",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SteamPositive",
                table: "Scores",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasCommunityVisibleStats",
                table: "Ownerships",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Playtime2Weeks",
                table: "Ownerships",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PlaytimeForever",
                table: "Ownerships",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "HeaderImage",
                table: "Games",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImgIconUrl",
                table: "Games",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImgLogoUrl",
                table: "Games",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SteamNegative",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "SteamPositive",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "HasCommunityVisibleStats",
                table: "Ownerships");

            migrationBuilder.DropColumn(
                name: "Playtime2Weeks",
                table: "Ownerships");

            migrationBuilder.DropColumn(
                name: "PlaytimeForever",
                table: "Ownerships");

            migrationBuilder.DropColumn(
                name: "HeaderImage",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "ImgIconUrl",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "ImgLogoUrl",
                table: "Games");
        }
    }
}
