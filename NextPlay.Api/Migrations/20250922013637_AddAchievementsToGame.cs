using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextPlay.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAchievementsToGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AchievementsTotal",
                table: "Games",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AchievementsUnlocked",
                table: "Games",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AchievementsTotal",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "AchievementsUnlocked",
                table: "Games");
        }
    }
}
