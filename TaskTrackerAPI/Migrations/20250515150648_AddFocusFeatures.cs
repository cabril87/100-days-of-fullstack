using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddFocusFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 15, 15, 6, 48, 43, DateTimeKind.Utc).AddTicks(5602));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 15, 15, 6, 48, 43, DateTimeKind.Utc).AddTicks(7110));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName", "PasswordHash", "Salt" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46f98_kIEFzO_9VmpESvWYYsUGHLq8R3FxPUitlpxnmQ_Id8P_hO1TnlNHQ_mtCgWrgR0UhRCpjXX_Dnb2X6Dp0J7Lq9-9hGqwW9xgmKNCfxq5Zrt4XMhaAxWDVTjRCrmdk", "CfDJ8HeiyxunoJNOiKpgMimE46c3DawknVPovKDvTdrb9RhfFU1WykVUsA6P-G9sDOdtJb8MtaacVy5-1RdNpB_ls45PNPrPBepWKn8KDXjqCd5HoP76KcRhEqN2EAn76g3dcQ", "CfDJ8HeiyxunoJNOiKpgMimE46fNdgkaHt4zxes97n14vPo-VgNdtErsW6QCHOofs94Gv8lMs4LL8aDeH-CJdLqWYkQ4bL7UL4UY6Lii2tAe95bvlIs2Oi2W9ur2X2uG92AwSg", "L6Y+Dh8V3HZ1U3A12NPP8jfGaxL1cOFUeo84mMjO1vQ=", "AAECAwQFBgcICQoLDA0ODw==" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 32, 46, 440, DateTimeKind.Utc).AddTicks(2220));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 32, 46, 440, DateTimeKind.Utc).AddTicks(3823));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName", "PasswordHash", "Salt" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46djrH_6Wak3swBSxyxby6bOcgmB-EebUbG_YrWBB1tOcjwi0XnWnNnH25qeCFvYdI12e6VX2LwCkI2JUvtS6aEwrdAUGE5ZweonNkazv8dOC0oxLZfUYbfLUBhoW6nzNc0", "CfDJ8HeiyxunoJNOiKpgMimE46dE39MaB-cb7pzPUrdZAq-pw8_3gCPiDwgx15wnkD5mtF0p9ndhgh7ggtYG0QE5dL91n_BvN-d0mvCaf4GWRWEgR2-aqTZY4Oun3ncg0EVQ4g", "CfDJ8HeiyxunoJNOiKpgMimE46fpxKm9PbMqaB0oH4e2-AhwipCzcqy1i73-fICvROUvkOqg-5xfava4_q3qrJ3RaNHdeEUP-i1FsY1w7Fk3mVgnlG9BLM6_fLirO_TrJ_cFxg", "AQAAAAIAAYagAAAAEM+YP5xvgRYmWKYLHcpbxBpGmGRG84u+ejHNiGVmAJkGpzVPWCcxLnvKVwRH89Vf/Q==", "RVENTsNrIeUkGxDiQQcAKQ==" });
        }
    }
}
