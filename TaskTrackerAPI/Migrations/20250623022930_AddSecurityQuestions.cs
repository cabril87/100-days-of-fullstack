using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSecurityQuestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SecurityQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    EncryptedAnswer = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false, comment: "Encrypted field - SecurityQuestions"),
                    QuestionOrder = table.Column<int>(type: "int", nullable: false),
                    IsAgeAppropriate = table.Column<bool>(type: "bit", nullable: false),
                    MinimumAgeGroup = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    LastUsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsageCount = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    UserId1 = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SecurityQuestions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SecurityQuestions_Users_UserId1",
                        column: x => x.UserId1,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityQuestions_UserId_QuestionOrder",
                table: "SecurityQuestions",
                columns: new[] { "UserId", "QuestionOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SecurityQuestions_UserId1",
                table: "SecurityQuestions",
                column: "UserId1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SecurityQuestions");
        }
    }
}
