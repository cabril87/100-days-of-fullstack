using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddPermissionOverrideForCalendarEvents : Migration
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
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                comment: "Encrypted field - PII",
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                comment: "Encrypted field - PII",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 22, 13, 25, 40, 882, DateTimeKind.Utc).AddTicks(7719));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 22, 13, 25, 40, 882, DateTimeKind.Utc).AddTicks(9196));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46dkVx9SIkOQrkgiV6NK5ld7U43v_Mwv1QOoIKEmXXrSQwsFKFN-0qUB4e8mwY7CW7i9KQapPpieI9tQRZtvB9bKmPsz7QKiS8D5njqEuvtEicWjlCHCW6YN2D_utIp8tOU", "CfDJ8HeiyxunoJNOiKpgMimE46ddP-MlBJWUqHvr2YM4B4ibaWoAqeYMJwHTnHpH_GEpzuWbyJPOGlVJkImDqdNJEbSOM8YmusRPmQgXjOcMROT58VSe6g0Xi5R8O9ng1XpKzw", "CfDJ8HeiyxunoJNOiKpgMimE46ftszXLaqLVGTJEqG1Pg1bPF5Kw5dtT8ynKH-sJ-VNRembh55oYlp5T2MvfA_CF4ztA_nR55GKEvjOWN8qVALlHTPfn8CBmNTFgJvmOV1JF-A" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "LastName",
                table: "Users",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true,
                oldComment: "Encrypted field - PII");

            migrationBuilder.AlterColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true,
                oldComment: "Encrypted field - PII");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldComment: "Encrypted field - PII");

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 21, 21, 30, 21, 595, DateTimeKind.Utc).AddTicks(8611));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 21, 21, 30, 21, 596, DateTimeKind.Utc).AddTicks(164));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "admin@tasktracker.com", "Admin", "User" });
        }
    }
}
