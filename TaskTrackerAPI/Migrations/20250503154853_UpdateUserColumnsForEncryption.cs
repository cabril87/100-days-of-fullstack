using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserColumnsForEncryption : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Users",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                comment: "Encrypted field - PII",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                comment: "Encrypted field - PII",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                comment: "Encrypted field - PII",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "VerificationCode",
                table: "UserDevices",
                type: "nvarchar(1024)",
                nullable: true,
                comment: "Encrypted field - Security",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DeviceToken",
                table: "UserDevices",
                type: "nvarchar(1024)",
                nullable: false,
                comment: "Encrypted field (highly sensitive) - DeviceToken",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "ChecklistTemplateItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Text = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    TaskTemplateId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistTemplateItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChecklistTemplateItems_TaskTemplates_TaskTemplateId",
                        column: x => x.TaskTemplateId,
                        principalTable: "TaskTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 3, 15, 48, 52, 813, DateTimeKind.Utc).AddTicks(4705));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 3, 15, 48, 52, 813, DateTimeKind.Utc).AddTicks(6233));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46eM9binpBEhOYrR08NgmXYjX1NNM7f_AdAxpgXLmz0inF-j5X1E3lZVcHKjH_JcKvmBKyhrNCKSY2iJoIPsMSD5xk9m7QOeAJf2CejY7Xa7Gy0Ru7kXLEGU3ZTBkRY4k5U", "CfDJ8HeiyxunoJNOiKpgMimE46cfIX6LXre4qqBoDWwRqCq2tdacm-FS7yW_9THkSDl6bM-bA3O8bsbXjKthNs_5SQD67_9Z5TGulRnIbnfYTkBm_WkTAAMhXbwkjuJKmbKNvg", "CfDJ8HeiyxunoJNOiKpgMimE46e38mzT1Wgd6Im_KBaUU_AMEKErCRr2Uzt7EYLc7pQ4SNUCUgMhNqGO7LZRafM50jajvx_9fyafHaBokJxffeIX5zO48uA8w4EcfBdOxB0Cjg" });

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistTemplateItems_TaskTemplateId",
                table: "ChecklistTemplateItems",
                column: "TaskTemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChecklistTemplateItems");

            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true,
                oldComment: "Encrypted field - PII");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true,
                oldComment: "Encrypted field - PII");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldComment: "Encrypted field - PII");

            migrationBuilder.AlterColumn<string>(
                name: "VerificationCode",
                table: "UserDevices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1024)",
                oldNullable: true,
                oldComment: "Encrypted field - Security");

            migrationBuilder.AlterColumn<string>(
                name: "DeviceToken",
                table: "UserDevices",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(1024)",
                oldComment: "Encrypted field (highly sensitive) - DeviceToken");

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 4, 30, 14, 54, 37, 510, DateTimeKind.Utc).AddTicks(6928));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 4, 30, 14, 54, 37, 510, DateTimeKind.Utc).AddTicks(8766));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "admin@tasktracker.com", "Admin", "User" });
        }
    }
}
