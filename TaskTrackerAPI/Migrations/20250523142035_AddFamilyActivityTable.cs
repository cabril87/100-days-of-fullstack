using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyActivityTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FamilyActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FamilyId = table.Column<int>(type: "int", nullable: false),
                    ActorId = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<int>(type: "int", nullable: true),
                    ActionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    EntityType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EntityId = table.Column<int>(type: "int", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FamilyActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FamilyActivities_Families_FamilyId",
                        column: x => x.FamilyId,
                        principalTable: "Families",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyActivities_Users_ActorId",
                        column: x => x.ActorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FamilyActivities_Users_TargetId",
                        column: x => x.TargetId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 23, 14, 20, 34, 449, DateTimeKind.Utc).AddTicks(7387));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 23, 14, 20, 34, 449, DateTimeKind.Utc).AddTicks(9110));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "CfDJ8HVHXjoCuL1MtUIjNQz5N_IA-U4-CIidae0t4V58_9QaHPo77I5_NaybP7_AJ-iKjAlQw0rlhUrM8pkDRb-6LUWXCxSrDGscM9-mLbvGTOyIXrHo6OzIhrqeOvHIpOqyqYWzVlnOXZ-1goK_fHW0gkM", "CfDJ8HVHXjoCuL1MtUIjNQz5N_KfIpoSHnowJER4mKlwV7DM0h9UGm1QW0T-Wb8skb6j-3aBM2ZK0gOyt1Ydz4WiN1cIsBC-fU9X0flg6HabvsUr88bmNsYOH5frQb7Hqt7N2A", "CfDJ8HVHXjoCuL1MtUIjNQz5N_IBCvTOf6IJc9HQa-jYlZJeEtfFWgu3zlCQ9SgHS25xHEozS6_V_HxBBBlHVO28bVI4436AE0rxU55PLQhftF9EIE4JO9kIyxC55LPVOfo09A" });

            migrationBuilder.CreateIndex(
                name: "IX_FamilyActivities_ActorId",
                table: "FamilyActivities",
                column: "ActorId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyActivities_FamilyId",
                table: "FamilyActivities",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyActivities_TargetId",
                table: "FamilyActivities",
                column: "TargetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FamilyActivities");

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
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46cHYORTZzfsJPKRe9sinjdtKVYvWJ4CjeM5PCLTVvWClFIvl8vWGcqHqvbnH3UEOQKlRelc1H1M23iIKL0z7GeTYb-Kj5lGymroBVeyDtRLzOTYD7nZbzfMXbda6FU1ASU", "CfDJ8HeiyxunoJNOiKpgMimE46cLOIcenXD29-JGkCt0Jzh3OQqU3rPc6e7vM7IPyhId2HsVGqCwnomsmS-UPhThKPwE5CpUdI78RmFvkrv2qM3rsdLZpwuHCSpHscT3Y8kSTQ", "CfDJ8HeiyxunoJNOiKpgMimE46fmWuS6Kcj-Nm4Nc-HCavJwZjPgHP11ofaksYM_3GpAd4UnBtOH4cGxkeRX5q5lbxWVYgJvBad5AEu9g17rwuJWafOazDKKoNeLz-AIBy5sUQ" });
        }
    }
}
