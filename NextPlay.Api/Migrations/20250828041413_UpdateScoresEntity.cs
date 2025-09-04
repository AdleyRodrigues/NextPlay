using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextPlay.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScoresEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalNegative",
                table: "Scores");

            migrationBuilder.DropColumn(
                name: "TotalPositive",
                table: "Scores");

            migrationBuilder.AddColumn<int>(
                name: "SteamPositivePct",
                table: "Scores",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SteamPositivePct",
                table: "Scores");

            migrationBuilder.AddColumn<int>(
                name: "TotalNegative",
                table: "Scores",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalPositive",
                table: "Scores",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }
    }
}
