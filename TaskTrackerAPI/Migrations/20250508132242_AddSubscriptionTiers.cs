using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionTiers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubscriptionTiers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DefaultRateLimit = table.Column<int>(type: "int", nullable: false),
                    DefaultTimeWindowSeconds = table.Column<int>(type: "int", nullable: false),
                    DailyApiQuota = table.Column<int>(type: "int", nullable: false),
                    MaxConcurrentConnections = table.Column<int>(type: "int", nullable: false),
                    BypassStandardRateLimits = table.Column<bool>(type: "bit", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    IsSystemTier = table.Column<bool>(type: "bit", nullable: false),
                    MonthlyCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionTiers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RateLimitTierConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubscriptionTierId = table.Column<int>(type: "int", nullable: false),
                    EndpointPattern = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    HttpMethod = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    RateLimit = table.Column<int>(type: "int", nullable: false),
                    TimeWindowSeconds = table.Column<int>(type: "int", nullable: false),
                    IsCriticalEndpoint = table.Column<bool>(type: "bit", nullable: false),
                    ExemptSystemAccounts = table.Column<bool>(type: "bit", nullable: false),
                    MatchPriority = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    IsAdaptive = table.Column<bool>(type: "bit", nullable: false),
                    HighLoadReductionPercent = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RateLimitTierConfigs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RateLimitTierConfigs_SubscriptionTiers_SubscriptionTierId",
                        column: x => x.SubscriptionTierId,
                        principalTable: "SubscriptionTiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserApiQuotas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ApiCallsUsedToday = table.Column<int>(type: "int", nullable: false),
                    MaxDailyApiCalls = table.Column<int>(type: "int", nullable: false),
                    LastResetTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    LastUpdatedTime = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    SubscriptionTierId = table.Column<int>(type: "int", nullable: false),
                    IsExemptFromQuota = table.Column<bool>(type: "bit", nullable: false),
                    HasReceivedQuotaWarning = table.Column<bool>(type: "bit", nullable: false),
                    QuotaWarningThresholdPercent = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserApiQuotas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserApiQuotas_SubscriptionTiers_SubscriptionTierId",
                        column: x => x.SubscriptionTierId,
                        principalTable: "SubscriptionTiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserApiQuotas_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 22, 41, 113, DateTimeKind.Utc).AddTicks(1092));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 22, 41, 113, DateTimeKind.Utc).AddTicks(2818));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46fkeVUDMfznDELKhfRd1y368sZvt78KRe81O8taU99iNaXjdTL54LgAzil3VROf1_95HmxihChKHt2rnMaSulfsS9s4mqV3UxH8txEOA-LGLkJ1gUEVJfDyq8Co3rJ-0fc", "CfDJ8HeiyxunoJNOiKpgMimE46eUInIoTR7LqSTZBTImt6YzVmGu7aTme-c2amNepMML04XPDAtN16fiIUT7nNOeSwSVFDChLHHS25g4zj2bDq5AZSRLb4ulAcg_IQlvd4VYZg", "CfDJ8HeiyxunoJNOiKpgMimE46eTXe-4R_9uIpt3dkoaRQWJDUQq6xsi9h40umFQ7VQ616SQtUezdtm_h2-AsqJPcGMZZHnhKbp1ixxZKsUipDTDojqgwvuYGTuR0323Z8QVog" });

            migrationBuilder.CreateIndex(
                name: "IX_RateLimitTierConfigs_SubscriptionTierId",
                table: "RateLimitTierConfigs",
                column: "SubscriptionTierId");

            migrationBuilder.CreateIndex(
                name: "IX_UserApiQuotas_SubscriptionTierId",
                table: "UserApiQuotas",
                column: "SubscriptionTierId");

            migrationBuilder.CreateIndex(
                name: "IX_UserApiQuotas_UserId",
                table: "UserApiQuotas",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RateLimitTierConfigs");

            migrationBuilder.DropTable(
                name: "UserApiQuotas");

            migrationBuilder.DropTable(
                name: "SubscriptionTiers");

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
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46c4iwEDy-ZyQNwBtb2nIMB64kjIZ4E2Kxto3hB1zrRv2cE1HjyxETB3nMnW8rz2dZQKUs1Cp6el0bQKtQYMRyaNl8IKvo7KA-ybxSuve9qYT74Y8pEdhV9iYhLQ1Qk2kHo", "CfDJ8HeiyxunoJNOiKpgMimE46dWaeXEXF-eC3T8ZRfjIR-Ol3QrGlF7JptxX2BTVzyzHD_NWMSeKqlXodX7HjciZoWISkVPS7BIX0HUIXDoG-14NRmZ55Qxwm15B6IXWhJCtA", "CfDJ8HeiyxunoJNOiKpgMimE46eZcbJ3tBhPGIm8__Ec5lvy1wLWi7VgavUaaVkbolyx_DJiAFuWgY_zW0_pY2Zx26wx2qqPQwu6D5TBqjFv1F895qNmPIAWsWlcUFYNuB7d_w" });
        }
    }
}
