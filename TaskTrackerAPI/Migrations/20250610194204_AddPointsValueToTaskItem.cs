using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPointsValueToTaskItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PointsValue",
                table: "Tasks",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PointsValue",
                table: "Tasks");
        }
    }
}
