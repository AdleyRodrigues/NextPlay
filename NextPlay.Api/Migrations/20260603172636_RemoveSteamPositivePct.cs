using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NextPlay.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSteamPositivePct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SteamPositivePct",
                table: "Scores");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SteamPositivePct",
                table: "Scores",
                type: "INTEGER",
                nullable: true);
        }
    }
}
