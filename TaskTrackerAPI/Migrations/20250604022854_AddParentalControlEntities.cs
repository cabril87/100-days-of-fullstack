using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddParentalControlEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ParentalControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParentUserId = table.Column<int>(type: "int", nullable: false),
                    ChildUserId = table.Column<int>(type: "int", nullable: false),
                    ScreenTimeEnabled = table.Column<bool>(type: "bit", nullable: false),
                    DailyTimeLimit = table.Column<TimeSpan>(type: "time", nullable: false),
                    TaskApprovalRequired = table.Column<bool>(type: "bit", nullable: false),
                    PointSpendingApprovalRequired = table.Column<bool>(type: "bit", nullable: false),
                    BlockedFeatures = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChatMonitoringEnabled = table.Column<bool>(type: "bit", nullable: false),
                    MaxPointsWithoutApproval = table.Column<int>(type: "int", nullable: false),
                    CanInviteOthers = table.Column<bool>(type: "bit", nullable: false),
                    CanViewOtherMembers = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParentalControls", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ParentalControls_Users_ChildUserId",
                        column: x => x.ChildUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ParentalControls_Users_ParentUserId",
                        column: x => x.ParentUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PermissionRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChildUserId = table.Column<int>(type: "int", nullable: false),
                    ParentUserId = table.Column<int>(type: "int", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResponseMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ParentalControlId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PermissionRequests_ParentalControls_ParentalControlId",
                        column: x => x.ParentalControlId,
                        principalTable: "ParentalControls",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PermissionRequests_Users_ChildUserId",
                        column: x => x.ChildUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PermissionRequests_Users_ParentUserId",
                        column: x => x.ParentUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "TimeRanges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ParentalControlId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeRanges", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeRanges_ParentalControls_ParentalControlId",
                        column: x => x.ParentalControlId,
                        principalTable: "ParentalControls",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ParentalControls_ChildUserId",
                table: "ParentalControls",
                column: "ChildUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ParentalControls_ParentUserId",
                table: "ParentalControls",
                column: "ParentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionRequests_ChildUserId",
                table: "PermissionRequests",
                column: "ChildUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionRequests_ParentalControlId",
                table: "PermissionRequests",
                column: "ParentalControlId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionRequests_ParentUserId",
                table: "PermissionRequests",
                column: "ParentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeRanges_ParentalControlId",
                table: "TimeRanges",
                column: "ParentalControlId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PermissionRequests");

            migrationBuilder.DropTable(
                name: "TimeRanges");

            migrationBuilder.DropTable(
                name: "ParentalControls");
        }
    }
}
